import { parse } from "csv-parse";
import { createReadStream } from "node:fs";

const parser = createReadStream("")
  .pipe(
    parse({
      trim: true,
      columns: true,
      delimiter: ";",
      cast: true,
    })
  );

const result = []
for await (const entry of parser) {
	result.push({
		name: `${entry["Vorname"]} ${entry["Nachname"]}`,
		openid_id: entry["E-Mail"],
	})
}
console.log(JSON.stringify(result, null, 2))