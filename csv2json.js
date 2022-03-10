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
		// TODO FIXME these could / should be done in LibreOffice or so (so this script doesnt need to be adapted. Also maybe we should provide an upload for csv as it doesnt seem too complicated and is a pretty common format)
		name: `${entry["Vorname"]} ${entry["Nachname"]}`,
		openid_id: entry["E-Mail"],
	})
}
console.log(JSON.stringify(result, null, 2))