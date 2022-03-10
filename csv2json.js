import { parse } from "csv-parse";
import { createReadStream } from "node:fs";
import { exit } from "node:process";

if (process.argv.length !== 3) {
  console.log("usage: node csv2json.js <file>");
  exit(0);
}

const parser = createReadStream(process.argv[2]).pipe(
  parse({
    trim: true,
    columns: true,
    delimiter: ",",
    cast: true,
  })
);

const result = [];
for await (const entry of parser) {
  result.push(entry);
}
console.log(JSON.stringify(result, null, 2));
