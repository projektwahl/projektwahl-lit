

function canIGetAGenericFunctionAndMapIt<MappedType extends {
    [key: string]: readonly unknown[]
}, Key extends keyof MappedType, GenericFunction extends <T>(input: readonly T[]) => T>(mappedType: MappedType, func: GenericFunction, key: Key): MappedType[Key][0] {
    return func(mappedType[key])
}

const map = {
    hi: [1, 2, 3],
    jo: ["hi", "jo"]
} as const

const result = canIGetAGenericFunctionAndMapIt(map, (key) => key[0], "hi")