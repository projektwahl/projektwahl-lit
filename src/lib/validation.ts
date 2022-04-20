export type Result<R, E> =
  | { success: true; data: R }
  | { success: false; error: E };

abstract class VSchema<T> {

    schema!: T
}

export const vnumber = class VNumber extends VSchema<number> {

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
};

export const vobject = class VObject<K extends string | number | symbol, V> extends VSchema<{ [k in K]: V }> {
  
  validate(
    key: K,
    value: (input: unknown) => Result<V, any>
  ) {
  return (input: unknown): Result<{ [k in K]: V }, any> => {
    if (typeof input !== "object") {
      return {
        success: false,
        error: {
          // TODO don't stringify as this could explode the error message length
          [key]: `${JSON.stringify(input)} ist kein Objekt!`,
        },
      };
    }
    if (input === null) {
      return {
        success: false,
        error: { [key]: `${JSON.stringify(input)} ist null!` },
      };
    }
    if (!(key in input)) {
      return {
        success: false,
        error: { [key]: `${JSON.stringify(input)} hat kein Attribut ${key}!` },
      };
    }
    // @ts-expect-error probably not typeable
    const inner = value(input[key]);
    if (inner.success) {
      // @ts-expect-error probably not typeable
      const data: { [k in K]: V } = {
        [key]: inner.data,
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
};

export const vintersection =
  <S1, S2>(
    schema1: (input: unknown) => Result<S1, any>,
    schema2: (input: unknown) => Result<S2, any>
  ) =>
  (input: unknown): Result<S1 & S2, any> => {
    const output1 = schema1(input);
    const output2 = schema2(input);
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
  };

function setDifference(
  a: (string | number | symbol)[],
  b: Set<string | number | symbol>
) {
  return new Set(Array.from(a).filter((item) => !b.has(item)));
}

// https://stackoverflow.com/questions/58779360/typescript-generic-being-incorrectly-inferred-as-unknown ?
export const vfilterKeys =
  <S, K extends keyof S>(
    keys: Set<K>,
    schema: (input: unknown) => Result<S, any>
  ) =>
  (input: unknown): Result<Pick<S, K>, any> => {
    const diff = setDifference(Object.keys(input), keys);
    if (diff.size > 0) {
      return {
        success: false,
        error: Object.fromEntries(
          Array.from(diff).map((v) => [v, `${String(v)} unbekannter Schlüssel`])
        ),
      };
    }
    return schema(input);
  };

const schema1 = vobject("helper" as const, vnumber);
const schema2 = vobject("tester" as const, vnumber);

console.log(schema1({ helper: 1 }));
console.log(schema1({ helper: null }));
console.log(schema1({ he: 1 }));
console.log(schema1({ he: 1, helper: 1 }));

console.log(schema2({ tester: 1 }));

const schema = vintersection(schema1, schema2);

console.log(schema({ helper: 1, tester: 1 }));
console.log(schema({ helper: 1, tejster: 1 }));
console.log(schema({ hjelper: 1, tester: 1 }));
console.log(schema({ helliper: 1, testekr: 1 }));

const betterSchema = vfilterKeys(
  new Set(["helper", "tester"] as const),
  schema
);

const testGenericSchema = <K extends string | number | symbol>(k: K) => {
  const a = vintersection(
    vobject("helper" as const, vnumber),
    vobject(k, vnumber)
  );
  return vfilterKeys(new Set(["helper", k] as const), a);
};

const testGenericSchema2 = <K extends string | number | symbol>(k: K) => {
  return vfilterKeys(
    new Set(["helper"] as const),
    vintersection(vobject("helper" as const, vnumber), vobject(k, vnumber))
  );
};

const joGeneric = testGenericSchema("hi");

const parsed = joGeneric("");

if (parsed.success) {
  parsed.data.hi;
}

console.log(betterSchema({ helper: 1, tester: 1 }));
console.log(betterSchema({ helper: 1, tejster: 1 }));
console.log(betterSchema({ hjelper: 1, tester: 1 }));
console.log(betterSchema({ helliper: 1, testekr: 1 }));
