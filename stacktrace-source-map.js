import sourceMap from 'source-map';
import { readFileSync } from 'fs';

var smc = new sourceMap.SourceMapConsumer(readFileSync("dist/pw-app.js.map","utf8"));
console.log(smc.originalPositionFor({line: 5, column: 2290}));
