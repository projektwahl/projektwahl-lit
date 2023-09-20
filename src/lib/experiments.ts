// https://stackoverflow.com/questions/54366720/mapped-types-in-typescript-with-functions

const map = {
    a: {
      input: 4,
      fun: (input: number) => [1, 2, 3]
    },
    b: {
      input: "i",
      fun: (input: string) => ["hi", "jo"]
    },
} as const;

// the issue is that K could contain multiple keys and then this is broken
function magic<K extends keyof (typeof map)>(key: K) {
  if (key === "a") {
    map["a"].fun(map["a"].input)
  } else if (key === "b") {
    map["b"].fun(map["b"].input)
  }
}