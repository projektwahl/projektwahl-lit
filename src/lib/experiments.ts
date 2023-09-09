export type Writable<T> = { -readonly [P in keyof T]: T[P] };

export type DeepWritable<T> = { -readonly [P in keyof T]: DeepWritable<T[P]> };

function jo2<
  MappedType extends {
    [key: string]: readonly unknown[];
  },
  Key extends keyof MappedType,
>(mappedType: MappedType, key: Key): MappedType[Key][0] {
  return mappedType[key][0];
}


const result = jo2(map, "hi");

//const thePush = <T>()#


const map = {
    a: [1, 2, 3],
    b: ["hi", "jo"],
};

function pushSorting<
  Key extends keyof typeof map,
  V extends (typeof map)[Key][number]
>(sorting: Array<V>, key: Key, sortToAdd: V): void {
  sorting.push(sortToAdd);
  return sorting[0]
}

pushSorting(map["a"], "a", 5)