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
} as const;

const magic = <K extends keyof typeof map>(key: K) => {
  const ji: { [K in keyof typeof map]: typeof map[K] }[K] = map[key]
  ji.fun(ji.input)
}