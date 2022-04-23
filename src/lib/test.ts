



export function mapTuple<T extends readonly any[]>(input: T): {
    test: any;
}[] {
    return input.map(v => { return { test: v }})
}


export type MapTupe<T> = {
    [K in keyof T]: { test: T[K] }
}

// how to type this?
export function mapTuple2<T extends readonly any[]>(input: T): MapTupe<T> {
    return input.map(v => { return { test: v }})
}

// see inferred types
const a = mapTuple([1, "hi"] as const)[0].test
const b = mapTuple([1, "hi"] as const)[1].test

const c = mapTuple2([1, "hi"] as const)[0].test
const d = mapTuple2([1, "hi"] as const)[1].test

console.log(a, b, c, d)