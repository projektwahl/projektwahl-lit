export type ResultSuccess<R> = { success: true; data: R }
export type ResultError<E> = { success: false; error: E }

export type Result<R, E> =
  | ResultSuccess<R>
  | ResultError<E>;

export function isOk<R, E>(result: Result<R, E>): result is ResultSuccess<R> {
  return result.success;
}

export function isErr<R, E>(result: Result<R, E>): result is ResultError<E> {
  return !result.success;
}

function hasProp<T extends object, K extends PropertyKey>(
  obj: T, 
  key: K
): obj is T & Record<K, any> {
  return key in obj;
}

export abstract class VSchema<T> {
  schema!: T;

  abstract validate(input: unknown): Result<T, any>;
}

export class VEnum<T> extends VSchema<T> {

  values: readonly [T, ...T[]];

  constructor(values: readonly [T, ...T[]]) {
    super();
    this.values = values;
  }

  validate(input: unknown): Result<T, any> {
    const found = this.values.find(v => v === input)
      if (found !== undefined) {
        return {
          success: true,
          data: found,
        }
      } else {
        return {
          success: false,
          error: `Erwartet eines von: ${this.values}`
        }
      }
  }
}

export class VTuple<T extends VSchema<any>[]> extends VSchema<SchemaArrayToSchema<T>> {

  entries: T;

  constructor(entries: T) {
    super();
    this.entries = entries;
  }

  validate(input: unknown): Result<T, any> {
    // similar to VObject
    if (!Array.isArray(input)) {
      return {
        success: false,
        error: `Keine Liste!`
      }
    }
    if (input.length !== this.entries.length) {
      return {
        success: false,
        error: `Liste nicht ${this.entries.length} lang, sondern ${input.length}!`
      }
    }
    const validations = input.map((v, i) => [i, this.entries[i].validate(v)] as const)
    const errors = validations.filter((v): v is [number, ResultError<any>] => isErr(v[1]));
    if (errors.length > 0) {
      return {
        success: false,
        error: Object.fromEntries(errors),
      };
    }
    const successes = validations.map(v => v[1]).filter(isOk).map((v) => v.data);
    return {
      success: true,
      data: successes,
    };
  }
}

export class VNumber extends VSchema<number> {
  min: number;
  max: number;

  constructor(
    min: number = Number.NEGATIVE_INFINITY,
    max: number = Number.POSITIVE_INFINITY
  ) {
    super();
    this.min = min;
    this.max = max;
  }

  validate(input: unknown): Result<number, any> {
    if (typeof input !== "number") {
      return {
        success: false,
        error: `${input} ist keine Zahl!`,
      };
    }
    if (input < this.min) {
      return {
        success: false,
        error: `${input} muss mindestens ${this.min} sein!`,
      };
    }
    if (input > this.max) {
      return {
        success: false,
        error: `${input} darf höchstens ${this.min} sein!`,
      };
    }
    return {
      success: true,
      data: input,
    };
  }
}

export class VBoolean extends VSchema<boolean> {
  validate(input: unknown): Result<boolean, any> {
    if (typeof input !== "boolean") {
      return {
        success: false,
        error: `${input} ist keine Zahl!`,
      };
    }
    return {
      success: true,
      data: input,
    };
  }
}

export class VString extends VSchema<string> {
  min: number;
  max: number;

  constructor(
    min: number = Number.NEGATIVE_INFINITY,
    max: number = Number.POSITIVE_INFINITY
  ) {
    super();
    this.min = min;
    this.max = max;
  }

  validate(input: unknown): Result<string, any> {
    if (typeof input !== "string") {
      return {
        success: false,
        error: `${input} ist kein String!`,
      };
    }
    if (input.length < this.min) {
      return {
        success: false,
        error: `${input} muss mindestens ${this.min} Zeichen lang sein!`,
      };
    }
    if (input.length > this.max) {
      return {
        success: false,
        error: `${input} darf höchstens ${this.min} Zeichen lang sein!`,
      };
    }
    return {
      success: true,
      data: input,
    };
  }
}

export class VArray<T> extends VSchema<T[]> {

  innerSchema: VSchema<T>;

  constructor(innerSchema: VSchema<T>) {
    super();
    this.innerSchema = innerSchema;
  }

  validate(input: unknown): Result<T[], any> {
    // similar to VObject impl
    if (!Array.isArray(input)) {
      return {
        success: false,
        error: `Keine Liste!`
      }
    }
    const validations = input.map((v, i) => [i, this.innerSchema.validate(v)] as const)
    const errors = validations.filter((v): v is [number, ResultError<any>] => isErr(v[1]));
    if (errors.length > 0) {
      return {
        success: false,
        error: Object.fromEntries(errors),
      };
    }
    const successes = validations.map(v => v[1]).filter(isOk).map((v) => v.data);
    return {
      success: true,
      data: successes,
    };
  }
}

export class VNullable<T> extends VSchema<T | null> {
  innerSchema?: VSchema<T>;

  constructor(innerSchema?: VSchema<T>) {
    super();
    this.innerSchema = innerSchema;
  }

  validate(input: unknown): Result<T | null, any> {
    if (input === null) {
      return {
        success: true,
        data: null,
      };
    }
    if (this.innerSchema === undefined) {
      return {
        success: false,
        error: "Null erwartet.",
      };
    }
    return this.innerSchema.validate(input);
  }
}

type SchemaObjectToSchema<Type extends { [key: string]: VSchema<any> }> = {
  [Property in keyof Type]: Type[Property]["schema"];
};

type SchemaArrayToSchema<Type extends VSchema<any>[]> = {
  [Property in number]: Type[Property]["schema"];
};

export class VObject<O extends { [key: string]: VSchema<any> }> extends VSchema<
  SchemaObjectToSchema<O>
> {
  objectSchema: O;

  constructor(objectSchema: O) {
    super();
    this.objectSchema = objectSchema;
  }

  validate(input: unknown): Result<SchemaObjectToSchema<O>, any> {
    if (typeof input !== "object") {
      return {
        success: false,
        error: `${JSON.stringify(input)} ist kein Objekt!`,
      };
    }
    if (input === null) {
      return {
        success: false,
        error: `${JSON.stringify(input)} ist null!`,
      };
    }
    const diff = setDifference(
      Object.keys(input),
      new Set(Object.keys(this.objectSchema))
    );
    if (diff.size > 0) {
        // TODO FIXME potentially still do the validation below of the entries
      return {
        success: false,
        error: Object.fromEntries(
          Array.from(diff).map((v) => [v, `${String(v)} unbekannter Schlüssel`])
        ),
      };
    }
    /*for (const key in this.objectSchema) {
        // @ts-expect-error probably not typeable
        const val = input[key];
        const result = this.objectSchema[key].validate(val)
    }*/
    // TODO FIXME mapped type would be needed
    const validations = Object.keys(this.objectSchema).map((key) => {
      // @ts-expect-error probably not typeable
      const val = input[key];
      const innerSchema: O[keyof O] = this.objectSchema[key];
      return [key, innerSchema.validate(val)] as const;
    });
    // TODO FIXME use `is` type refinement for Result
    const errors = validations.filter((v): v is [number, ResultError<any>] => isErr(v[1]));
    if (errors.length > 0) {
      return {
        success: false,
        error: Object.fromEntries(errors),
      };
    }
    const successes = validations.filter((v): v is [number, ResultSuccess<O[keyof O]>] => isOk(v[1])).map((v) => [v[0], v[1].data] as const);
    return {
      success: true,
      data: Object.fromEntries(successes),
    };
  }
}

export class VObjectEntry<
  K extends string | number | symbol,
  V
> extends VSchema<{
  [k in K]: V;
}> {
  private key: K;

  private value: VSchema<V>;

  constructor(key: K, value: VSchema<V>) {
    super();
    this.key = key;
    this.value = value;
  }

  validate(input: unknown): Result<{ [k in K]: V }, any> {
    if (typeof input !== "object") {
      return {
        success: false,
        error: {
          // TODO don't stringify as this could explode the error message length
          [this.key]: `${JSON.stringify(input)} ist kein Objekt!`,
        },
      };
    }
    if (input === null) {
      return {
        success: false,
        error: { [this.key]: `${JSON.stringify(input)} ist null!` },
      };
    }
    if (!(this.key in input)) {
      return {
        success: false,
        error: {
          [this.key]: `${JSON.stringify(input)} hat kein Attribut ${this.key}!`,
        },
      };
    }
    // @ts-expect-error probably not typeable
    const val = input[this.key];
    const inner = this.value.validate(val);
    if (inner.success) {
      // @ts-expect-error probably not typeable
      const data: { [k in K]: V } = {
        [this.key]: inner.data,
      };
      return {
        success: true,
        data,
      };
    } else {
      return {
        success: false,
        error: {
          key: `${inner.error}`,
        },
      };
    }
  }
}

export class VIntersection<S1, S2> extends VSchema<S1 & S2> {
  private schema1: VSchema<S1>;
  private schema2: VSchema<S2>;

  constructor(schema1: VSchema<S1>, schema2: VSchema<S2>) {
    super();
    this.schema1 = schema1;
    this.schema2 = schema2;
  }

  validate(input: unknown): Result<S1 & S2, any> {
    const output1 = this.schema1.validate(input);
    const output2 = this.schema2.validate(input);
    if (!output1.success && !output2.success) {
      return {
        success: false,
        error: {
          ...output1.error,
          ...output2.error,
        },
      };
    }
    if (!output1.success) {
      return output1;
    }
    if (!output2.success) {
      return output2;
    }
    return {
      success: true,
      data: {
        ...output1.data,
        ...output2.data,
      },
    };
  }
}

function setDifference(
  a: (string | number | symbol)[],
  b: Set<string | number | symbol>
) {
  return new Set(Array.from(a).filter((item) => !b.has(item)));
}

export class VFilterKeys<S, K extends keyof S> extends VSchema<Pick<S, K>> {
  private keys: Set<K>;
  private parentSchema: VSchema<S>;

  constructor(keys: Set<K>, parentSchema: VSchema<S>) {
    super();
    this.keys = keys;
    this.parentSchema = parentSchema;
  }

  validate(input: unknown): Result<Pick<S, K>, any> {
    const diff = setDifference(Object.keys(input), this.keys);
    if (diff.size > 0) {
      return {
        success: false,
        error: Object.fromEntries(
          Array.from(diff).map((v) => [v, `${String(v)} unbekannter Schlüssel`])
        ),
      };
    }
    return this.parentSchema.validate(input);
  }
}

const inclusivePick = <O, K extends keyof O>(obj: O, keys: K[]): Pick<O, K> =>
  Object.fromEntries(keys.map((key) => [key, obj[key]])) as any;

export class VPick<
  O extends { [key: string]: VSchema<any> },
  K extends keyof O
> extends VSchema<Pick<SchemaObjectToSchema<O>, K>> {
  private pickedSchema: VSchema<Pick<SchemaObjectToSchema<O>, K>>;

  constructor(parentSchema: VObject<O> | VDiscriminatedUnion<VObject<O>, any>, keys: K[]) {
    super();
    if ("unions" in parentSchema) {
      this.pickedSchema = new VDiscriminatedUnion(parentSchema.key, parentSchema.unions.map(s => new VObject(inclusivePick(s.objectSchema, keys))))
    } else {
      this.pickedSchema = new VObject(inclusivePick(parentSchema.objectSchema, keys));
    }
  }

  validate(input: unknown): Result<Pick<SchemaObjectToSchema<O>, K>, any> {
    return this.pickedSchema.validate(input);
  }
}

export class VDiscriminatedUnion<T extends VObject<any>, K extends keyof T["objectSchema"]> extends VSchema<T["objectSchema"]> {
  key: K;
  unions: T[];

  constructor(key: K, unions: T[]) {
    super();
    this.key = key;
    this.unions = unions
  }

  validate(input: unknown): Result<SchemaObjectToSchema<T["objectSchema"]>, any> {
    if (typeof input !== "object") {
      return {
        success: false,
        error: {
          // TODO don't stringify as this could explode the error message length
          [this.key]: `${JSON.stringify(input)} ist kein Objekt!`,
        },
      };
    }
    if (input === null) {
      return {
        success: false,
        error: { [this.key]: `${JSON.stringify(input)} ist null!` },
      };
    }
    if (!hasProp(input, this.key)) {
      return {
        success: false,
        error: { [this.key]: `${this.key} fehlt!` },
      };
    }
    for (const union of this.unions) {
      const test = union.objectSchema[this.key]
      const result = test.validate(input[this.key])
      if (result.success) {
        return union.validate(input)
      }
    }
    return {
      success: false,
      error: {
        [this.key]: `Ungültiger Wert ${input[this.key]}`
      }
    }
  }
}

const schema1 = new VObjectEntry("helper" as const, new VNumber());
const schema2 = new VObjectEntry("tester" as const, new VNumber());

console.log(schema1.validate({ helper: 1 }));
console.log(schema1.validate({ helper: null }));
console.log(schema1.validate({ he: 1 }));
console.log(schema1.validate({ he: 1, helper: 1 }));

console.log(schema2.validate({ tester: 1 }));

const schema = new VIntersection(schema1, schema2);

console.log(schema.validate({ helper: 1, tester: 1 }));
console.log(schema.validate({ helper: 1, tejster: 1 }));
console.log(schema.validate({ hjelper: 1, tester: 1 }));
console.log(schema.validate({ helliper: 1, testekr: 1 }));

const betterSchema = new VFilterKeys(
  new Set(["helper", "tester"] as const),
  schema
);

const testGenericSchema = <K extends string | number | symbol>(k: K) => {
  return new VFilterKeys(
    new Set(["helper", k] as const),
    new VIntersection(
      new VObjectEntry("helper" as const, new VNumber()),
      new VObjectEntry(k, new VNumber())
    )
  );
};

const testGenericSchema2 = <K extends string | number | symbol>(k: K) => {
  return new VFilterKeys(
    new Set(["helper"] as const),
    new VIntersection(
      new VObjectEntry("helper" as const, new VNumber()),
      new VObjectEntry(k, new VNumber())
    )
  );
};

const joGeneric = testGenericSchema("hi");

const parsed = joGeneric.validate("");

if (parsed.success) {
  parsed.data.hi;
}

console.log(betterSchema.validate({ helper: 1, tester: 1 }));
console.log(betterSchema.validate({ helper: 1, tejster: 1 }));
console.log(betterSchema.validate({ hjelper: 1, tester: 1 }));
console.log(betterSchema.validate({ helliper: 1, testekr: 1 }));

const schema5 = new VObject({
  test: new VNumber(),
  jo: new VNumber(),
});

console.log(
  schema5.validate({
    test: 1,
    jo: 1,
    invalid: 1,
    bruh: "hi",
  })
);

const res2 = schema5.validate({
  test: 1,
  jo: 1,
  invalid: 1,
  bruh: "hi",
})

if (res2.success) {
  res2.data.jo
}

const pickedSchema = new VPick(schema5, ["test"]);

console.log(pickedSchema.validate({}));
console.log(pickedSchema.validate({test: ""}));
console.log(pickedSchema.validate({test: 1}));

console.log(pickedSchema.validate({test: 1, hi: 2}));
console.log(pickedSchema.validate({test: "jo", hi: 2}));

const discriminated = new VDiscriminatedUnion("test", [
  new VObject({
    test: new VEnum([1])
  }),
  new VObject({
    test: new VEnum([2])
  }),
])

console.log(discriminated.validate({ test: 1 }))
console.log(discriminated.validate({ test: 2 }))
console.log(discriminated.validate({ test: 3 }))
console.log(discriminated.validate({ }))

const res = discriminated.validate({ test: 3 })

if (res.success) {
  // broken
  res.data.test
}