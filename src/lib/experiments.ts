// https://stackoverflow.com/questions/54366720/mapped-types-in-typescript-with-functions

const map = {
    a: {
      input: 4,
      fun: (input: number) => [1, 2, 3]
    },
    b: {
      input: "i",
      fun: (input: number) => ["hi", "jo"]
    },
};

export function mappedTypeMap<MappedType, Key extends (keyof MappedType & keyof Q), Q>(mappedType: MappedType, key: Key, func: (input: MappedType[Key]) => Q[Key]): Q[Key] {
  return func(mappedType[key])
}

const someKey: "a" | "b" = "a";

const result = mappedTypeMap<typeof map, keyof typeof map, { [Key in keyof typeof map]: (typeof map)[Key]["input"][] }>(map, someKey, (input) => {
  return input.fun(input.input)
})
