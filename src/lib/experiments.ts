
const map = {
    "a": [1, 2, 3],
    "b": ["hello", "jofe"],
}

function testMap<K extends keyof typeof map>(key: K, value: (typeof map)[K][number]) {
    const jo = map[key];
    jo.push(value)
}