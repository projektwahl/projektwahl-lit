import { exec as unpromisifiedExec } from 'child_process';
import { createHash } from 'crypto';
import { readFile, rename, writeFile } from 'fs/promises';
import { promisify } from 'util';

const exec = promisify(unpromisifiedExec);

{
    let { stdout, stderr } = await exec("esbuild --format=esm --bundle src/client/pw-app.ts --charset=utf8 --define:window.PRODUCTION=true --entry-names=[dir]/[name] --sourcemap --analyze --outdir=dist --minify-whitespace --minify-identifiers --minify-syntax --tree-shaking=true --minify");

    console.log(stdout)
    console.log(stderr)
}

{
    let { stdout, stderr } = await exec("purgecss --css node_modules/bootstrap/dist/css/bootstrap.css --content dist/*.js --output dist/bootstrap.min.css --font-face --keyframes --variables");

    console.log(stdout)
    console.log(stderr)
}



let pwAppContents = await readFile("dist/pw-app.js", "utf8");

let pwAppHash = createHash('sha256').update(pwAppContents).digest('hex');

console.log(pwAppHash)

await rename("dist/pw-app.js", `dist/pw-app_${pwAppHash}.js`)



let bootstrapContents = await readFile("dist/bootstrap.min.css", "utf8");

let bootstrapHash = createHash('sha256').update(bootstrapContents).digest('hex');

console.log(bootstrapHash)

await rename("dist/bootstrap.min.css", `dist/bootstrap_${bootstrapHash}.min.css`)



const index = `<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->
    <style>
      body {
        overflow-y: scroll;
      }
    </style>
    <link
      href="/dist/bootstrap_${bootstrapHash}.min.css"
      rel="stylesheet"
    />

    <title>Projektwahl</title>
  </head>
  <body style="height: 100vh;">
    <script
      type="module"
      src="/dist/pw-app_${pwAppHash}.js"
    ></script>
    <noscript>Bitte aktiviere JavaScript!</noscript>

    <pw-app></pw-app>
  </body>
</html>
`;

await writeFile("dist/index.html", index);





{
  let { stdout, stderr } = await exec("esbuild --external:fs --external:url --external:stream --external:net --external:tls --external:crypto --format=esm --bundle src/server/setup.ts --external:@dev.mohe/argon2 --charset=utf8 --entry-names=[dir]/[name] --sourcemap --analyze --outdir=dist");
//  --minify-whitespace --minify-identifiers --minify-syntax --tree-shaking=true --minify

  console.log(stdout)
  console.log(stderr)
}



{
  let { stdout, stderr } = await exec("esbuild --external:node:http2 --external:node:fs --external:net --external:cluster --external:node:fs/promises --external:node:path --external:util --external:node:stream --external:node:zlib --external:node:process --external:path/posix --external:node:url --external:url --external:assert --external:url --external:querystring --external:http --external:https --external:crypto --external:fs --external:stream --external:events --external:fs --external:tls --external:os --external:path --external:child_process --external:tty --external:v8 --format=esm --bundle src/server/index.ts --external:@dev.mohe/argon2 --charset=utf8 --entry-names=[dir]/[name] --sourcemap --analyze --outdir=dist ");
// --minify-whitespace --minify-identifiers --minify-syntax --tree-shaking=true --minify

  console.log(stdout)
  console.log(stderr)
}
