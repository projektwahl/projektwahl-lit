export type ResultSuccess<R> = { success: true; data: R };
export type ResultError<E> = { success: false; error: E };

export type Result<R, E> = ResultSuccess<R> | ResultError<E>;

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

export class VEnum<T extends readonly (string | number)[]> extends VSchema<T[number]> {
  values: T;

  constructor(values: T) {
    super();
    this.values = values;
  }

  validate(input: unknown): Result<T[number], any> {
    const found = this.values.find((v) => v === input);
    if (found !== undefined) {
      return {
        success: true,
        data: found,
      };
    } else {
      return {
        success: false,
        error: `Erwartet eines von: ${this.values}`,
      };
    }
  }
}

export class VTuple<T extends VSchema<any>[]> extends VSchema<
  SchemaArrayToSchema<T>
> {
  objectSchema: T;

  constructor(objectSchema: T) {
    super();
    this.objectSchema = objectSchema;
  }

  validate(input: unknown): Result<T, any> {
    // similar to VObject
    if (!Array.isArray(input)) {
      return {
        success: false,
        error: `Keine Liste!`,
      };
    }
    if (input.length !== this.objectSchema.length) {
      return {
        success: false,
        error: `Liste nicht ${this.objectSchema.length} lang, sondern ${input.length}!`,
      };
    }
    const validations = input.map(
      (v, i) => [i, this.objectSchema[i].validate(v)] as const
    );
    const errors = validations.filter((v): v is [number, ResultError<any>] =>
      isErr(v[1])
    );
    if (errors.length > 0) {
      return {
        success: false,
        error: Object.fromEntries(errors),
      };
    }
    const successes = validations
      .map((v) => v[1])
      .filter(isOk)
      .map((v) => v.data);
    return {
      success: true,
      // @ts-expect-error map function not typeable
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
        error: `Keine Liste!`,
      };
    }
    const validations = input.map(
      (v, i) => [i, this.innerSchema.validate(v)] as const
    );
    const errors = validations.filter((v): v is [number, ResultError<any>] =>
      isErr(v[1])
    );
    if (errors.length > 0) {
      return {
        success: false,
        error: Object.fromEntries(errors),
      };
    }
    const successes = validations
      .map((v) => v[1])
      .filter(isOk)
      .map((v) => v.data);
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

export class VUndefined<T> extends VSchema<T | undefined> {
  innerSchema?: VSchema<T>;

  constructor(innerSchema?: VSchema<T>) {
    super();
    this.innerSchema = innerSchema;
  }

  validate(input: unknown): Result<T | undefined, any> {
    if (input === undefined) {
      return {
        success: true,
        data: undefined,
      };
    }
    if (this.innerSchema === undefined) {
      return {
        success: false,
        error: "Undefined erwartet.",
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
    // TODO FIXME mapped type would be needed
    const validations = Object.keys(this.objectSchema).map((key) => {
      const val = hasProp(input, key) ? input[key] : undefined;
      const innerSchema: O[keyof O] = this.objectSchema[key];
      return [key, innerSchema.validate(val)] as const;
    });
    const errors = validations.filter((v): v is [number, ResultError<any>] =>
      isErr(v[1])
    );
    if (errors.length > 0) {
      return {
        success: false,
        error: Object.fromEntries(errors),
      };
    }
    const successes = validations
      .filter((v): v is [number, ResultSuccess<O[keyof O]>] => isOk(v[1]))
      .map((v) => [v[0], v[1].data] as const);
    return {
      success: true,
      // @ts-expect-error bruh
      data: Object.fromEntries(successes),
    };
  }
}

// this only needs vobject like objects
export class VDiscriminatedUnion<
  T extends VObject<any>,
  K extends keyof T["objectSchema"]
> extends VSchema<T["objectSchema"]> {
  key: K;
  unions: T[];

  constructor(key: K, unions: T[]) {
    super();
    this.key = key;
    this.unions = unions;
  }

  validate(
    input: unknown
  ) {
    if (typeof input !== "object") {
      return {
        success: false as const,
        error: {
          // TODO don't stringify as this could explode the error message length
          [this.key]: `${JSON.stringify(input)} ist kein Objekt!`,
        },
      };
    }
    if (input === null) {
      return {
        success: false as const,
        error: { [this.key]: `${JSON.stringify(input)} ist null!` },
      };
    }
    if (!hasProp(input, this.key)) {
      return {
        success: false as const,
        error: { [this.key]: `${this.key} fehlt!` },
      };
    }
    for (const union of this.unions) {
      const test = union.objectSchema[this.key];
      const result = test.validate(input[this.key]);
      if (result.success) {
        return union.validate(input);
      }
    }
    return {
      success: false as const,
      error: {
        [this.key]: `Ungültiger Wert ${input[this.key]}`,
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

const inclusivePick = <O, K extends keyof O>(obj: O, keys: readonly K[]): Pick<O, K> =>
  Object.fromEntries(keys.map((key) => [key, obj[key]])) as any;

export class VPick<
  O extends VObject<{ [key: string]: VSchema<any> }>,
  K extends string | number
> extends VObject<Pick<O["objectSchema"], K>> {

  constructor(parentSchema: O, keys: readonly K[]) {
    super(inclusivePick<O["objectSchema"], K>(parentSchema["objectSchema"], keys))
  }
}

export class VPickUnion<
  T extends VObject<any>,
  K extends keyof T["objectSchema"],
  KEYS extends string|number
> extends VDiscriminatedUnion<VObject<Pick<T["objectSchema"], KEYS>>, K> {
 
  constructor(parentSchema: VDiscriminatedUnion<T, K>, keys: readonly KEYS[]) {
    super(
        parentSchema.key,
        parentSchema.unions.map(
          (s) =>
            new VObject(
              inclusivePick(s.objectSchema, keys)
            )
        )
      );
  }
}

// fix this with schema types
const makePartial = <O, K extends keyof O>(
  obj: O,
  keys: K[]
): Partial<Pick<O, K>> & Exclude<O, K> =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) =>
      keys.includes(key as K) ? new VUndefined(value) : value
    )
  ) as any;

// type-wise could be represented as VObject
// this needs to work with both
export class VPartial<
  O extends VObject<{ [key: string]: VSchema<any> }>,
  K extends string | number
> extends VObject<
  Partial<Pick<O["objectSchema"], K>> &
    Exclude<O["objectSchema"], K>
> {
  constructor(parentSchema: O, keys: readonly K[]) {
    super(
        makePartial<O["objectSchema"], K>(parentSchema["objectSchema"], keys)
      );
  }
}


export class VPartialUnion<
  T extends VObject<any>,
  K extends KEYS,
  KEYS extends string|number
> extends VDiscriminatedUnion<
VObject<(Partial<Pick<T["objectSchema"], KEYS>> &
Exclude<T["objectSchema"], KEYS>)>, K  
> {
  constructor(parentSchema: VDiscriminatedUnion<T, K>, keys: readonly K[]) {
    super(
        parentSchema.key,
        parentSchema.unions.map(
          (s) =>
            new VObject(makePartial(s.objectSchema, keys))
        )
      );
  }
}


// maybe for everything create two classes.
// I think we need to do that otherwise we don't know whether something can actually be used. (e.g whether a a picked union can be used as the second argument to vmerge)

// this needs actual vobject objects (e.g. not unions)
// actually it needs to work with both (at least first one discriminated union and second one anything)
export class VMerge<
  O1 extends { [key: string]: VSchema<any> },
  O2 extends { [key: string]: VSchema<any> }
> extends VObject<O1 & O2> {

  constructor(schema1: VObject<O1>, schema2: VObject<O2>) {
    super({
      ...schema1.objectSchema,
      ...schema2.objectSchema,
    });
  }
}

export type MappedFunctionCallType<
  Q extends { [key: string]: VSchema<any> },
  T extends { [K: string]: VObject<any> }
> = {
  [K in keyof T]: VObject<T[K]["objectSchema"] & Q>;
};

export function VMergeUnion<
  T extends VObject<any>,
  K extends keyof T["objectSchema"],
  O2 extends VObject<{ [key: string]: VSchema<any> }>
>(schema1: VDiscriminatedUnion<T, K>, schema2: O2): VDiscriminatedUnion<VObject<(T["objectSchema"] & O2["objectSchema"])>, K> {
    return new VDiscriminatedUnion(schema1.key, schema1.unions.map(v => new VObject({
      ...v.objectSchema,
      ...schema2.objectSchema
    })));
  }

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
});

if (res2.success) {
  res2.data.jo;
}

const pickedSchema = new VPick(schema5, ["test"]);

console.log(pickedSchema.validate({}));
console.log(pickedSchema.validate({ test: "" }));
console.log(pickedSchema.validate({ test: 1 }));

console.log(pickedSchema.validate({ test: 1, hi: 2 }));
console.log(pickedSchema.validate({ test: "jo", hi: 2 }));

const discriminated = new VDiscriminatedUnion("test", [
  new VObject({
    test: new VEnum([1]),
  }),
  new VObject({
    test: new VEnum([2]),
  }),
]);

console.log(discriminated.validate({ test: 1 }));
console.log(discriminated.validate({ test: 2 }));
console.log(discriminated.validate({ test: 3 }));
console.log(discriminated.validate({}));

const res = discriminated.validate({ test: 3 });

if (res.success) {
  // broken
  res.data.test;
}
