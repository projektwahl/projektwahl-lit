

export type Result<R, E> = { success: true, data: R } | { success: false, error: E }

export const number = (input: unknown): Result<number, any> => {
        if (typeof input !== "number") {
            return {
                success: false,
                error: `${input} ist keine Zahl!`
            }
        }
        return {
            success: true,
            data: input
        }
    }


export const object = <K, V>(key: K, value: (input: unknown) => Result<V, any>) => (input: unknown): Result<object, any> => {
    if (typeof input !== "object") {
        return {
            success: false,
            error: `${input} ist kein Objekt!`
        }
    }
    if (input === null) {
        return {
            success: false,
            error: `${input} ist null!`
        }
    }
    if (!(key in input)) {
        return {
            success: false,
            error: `${input} hat kein Attribut ${key}!`
        }
    }
    if (key in input) {
        const inner = value(input[key]);
    }
}