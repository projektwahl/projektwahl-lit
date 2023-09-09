function jo2<
  MappedType extends {
    [key: string]: readonly unknown[];
  },
  Key extends keyof MappedType,
>(mappedType: MappedType, key: Key): MappedType[Key][0] {
  return mappedType[key][0];
}

// https://stackoverflow.com/questions/54366720/mapped-types-in-typescript-with-functions

const map = {
    a: [1, 2, 3],
    b: ["hi", "jo"],
};

function pushSorting<
  Key extends keyof typeof map,
  V extends (typeof map)[Key][number]
>(sorting: Array<V>, key: Key, sortToAdd: V): (typeof map)[Key][number] {
  sorting.push(sortToAdd);
  return sorting[0]
}

pushSorting(map["a"], "a", 5)

function mappedTypeMap<MappedType, Key extends (keyof MappedType & keyof Q), Q = Record<string|number|symbol, unknown>>(mappedType: MappedType, key: Key, func: (input: MappedType[Key]) => Q[Key]): Q[Key] {
  return func(mappedType[key])
}

const result = mappedTypeMap<typeof map, "a", { [Key in keyof typeof map]: (typeof map)[Key][number] }>(map, "a", (input) => {
  input.push(5)
  return input[0]
})
