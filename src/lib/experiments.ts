
const map = {
    "a": [1, 2, 3],
    "b": ["hello", "jofe"],
}

function singleOperate<V extends unknown>(arr: V[], value: V): V {
    arr.push(value)
    return arr[0]
}

function testMap<MAPPED_TYPE, K extends keyof MAPPED_TYPE, FUNCTION extends {
    [Property in keyof MAPPED_TYPE]: (arg: MAPPED_TYPE[Property]) => unknown[Property];
}>(map: MAPPED_TYPE, key: K, func: FUNCTION) {
    return func[key](map[key])
}

const func1 = <T>(value: T[]): T => value[0];
const result = testMap<typeof map, "a", {
    [Property in keyof typeof map]: (arg: typeof map[Property]) => typeof map[Property][0];
}>(map, "a", func1);