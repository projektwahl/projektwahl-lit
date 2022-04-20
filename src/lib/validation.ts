export type Result<R, E> =
  | { success: true; data: R }
  | { success: false; error: E };

export const vnumber = (input: unknown): Result<number, any> => {
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
};

export const vobject =
  <K extends string | number | symbol, V>(
    key: K,
    value: (input: unknown) => Result<V, any>
  ) =>
  (input: unknown): Result<{ [k in K]: V }, any> => {
    if (typeof input !== "object") {
      return {
        success: false,
        error: `${input} ist kein Objekt!`,
      };
    }
    if (input === null) {
      return {
        success: false,
        error: `${input} ist null!`,
      };
    }
    if (!(key in input)) {
      return {
        success: false,
        error: `${input} hat kein Attribut ${key}!`,
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
  };

const schema = vobject("helper" as const, vnumber);

console.log(schema({ helper: 1 }));
console.log(schema({ helper: null }));
console.log(schema({ he: 1 }));
console.log(schema({ he: 1, helper: 1 }));