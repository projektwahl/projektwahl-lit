export type Result<R, E> =
  | { success: true; data: R }
  | { success: false; error: E };

abstract class VSchema<T> {
  private schema!: T;

  abstract validate(input: unknown): Result<T, any>;
}

export class VNumber extends VSchema<number> {
  validate(input: unknown): Result<number, any> {
    if (typeof input !== "number") {
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

export class VObject<K extends string | number | symbol, V> extends VSchema<{
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

// https://stackoverflow.com/questions/58779360/typescript-generic-being-incorrectly-inferred-as-unknown ?
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

const schema1 = new VObject("helper" as const, new VNumber());
const schema2 = new VObject("tester" as const, new VNumber());

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
  const a = new VIntersection(
    new VObject("helper" as const, new VNumber()),
    new VObject(k, new VNumber())
  );
  return new VFilterKeys(new Set(["helper", k] as const), a);
};

const testGenericSchema2 = <K extends string | number | symbol>(k: K) => {
  return new VFilterKeys(
    new Set(["helper"] as const),
    new VIntersection(
      new VObject("helper" as const, new VNumber()),
      new VObject(k, new VNumber())
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
