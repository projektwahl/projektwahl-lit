// https://stackoverflow.com/questions/54366720/mapped-types-in-typescript-with-functions

const map = {
    a: [1, 2, 3],
    b: ["hi", "jo"],
};

function mappedTypeMap<MappedType, Key extends (keyof MappedType & keyof Q), Q>(mappedType: MappedType, key: Key, func: (input: MappedType[Key]) => Q[Key]): Q[Key] {
  return func(mappedType[key])
}

const result = mappedTypeMap<typeof map, "a" | "b", { [Key in keyof typeof map]: (typeof map)[Key][number] }>(map, "a", (input) => {
  input.push()
  return input[0]
})

const result2 = mappedTypeMap<typeof map, "a" | "b", { [Key in keyof typeof map]: (typeof map)[Key][number] }>(map, "a", (input) => {
  input.push()
  return input[0]
})
