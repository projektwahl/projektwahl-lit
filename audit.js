import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { execFile } from 'child_process'
import { promisify } from 'util';
const asyncExecFile = promisify(execFile);

// string_decoder has an archived upstream with replacement
// npm why string_decoder

// path-to-regexp has replacement
// npm why path-to-regexp

// mkdirp should be superseded by node-apis
// npm why mkdirp

// json-buffer unmaintained
// npm why json-buffer

// issues by others
// https://github.com/jonschlinkert/fill-range/issues/13
// https://github.com/royriojas/file-entry-cache/issues/27

// DefinitelyTyped
// e.g. https://www.npmjs.com/package/@types/node

// Each Definitely Typed package is versioned when published to npm. The DefinitelyTyped-tools (the tool that publishes @types packages to npm) will set the declaration package's version by using the major.minor version number listed in the first line of its index.d.ts file. For example, here are the first few lines of Node's type declarations for version 10.12.x at the time of writing:

// https://docs.npmjs.com/cli/v7/configuring-npm/package-lock-json
let package_lock = JSON.parse(await readFile("./package-lock.json"));

async function gitClonePackage([pkgpath, pkg], package_json, version) {
    let repository = package_json.repository
    if (typeof repository === "object") repository = repository.url;
    if (/^[a-zA-Z0-9-]+\/[a-zA-Z0-9-\.]+$/.test(repository)) {
        repository = "https://github.com/"+repository+".git"
    }
    repository = repository.replace(/^git\+/, "");
    console.log(repository)
    // TODO FIXME parse the URL so we at least have a little bit more safety of malicious inputs

    if (!existsSync(join("/tmp", pkgpath))) {
        try {
            let { error2, stdout2, stderr2 } = await asyncExecFile("git", ["clone", "--depth", "1", "--branch", version, repository, pkgpath], {
                cwd: "/tmp",
            })
            console.log(stdout2)
            console.error(stderr2)
            console.error(error2)
        } catch (error) {
            console.error(error)
        }
    }
}

for (const [pkgpath, pkg] of Object.entries(package_lock.packages)) {
    if (pkgpath === "") continue;
    // https://docs.npmjs.com/cli/v7/configuring-npm/package-json
    let package_json = JSON.parse(await readFile(join(pkgpath, "package.json")))

    if (pkgpath.endsWith("/lodash.merge")) {
        await gitClonePackage([pkgpath, pkg], package_json, `${pkg.version}-npm-packages`);
    } else if (pkgpath.endsWith("/lit-html")) {
        await gitClonePackage([pkgpath, pkg], package_json, `lit-html@${pkg.version}`);
    } else if (pkgpath.endsWith("/lit-element")) {
        await gitClonePackage([pkgpath, pkg], package_json, `lit-element@${pkg.version}`);
    } else if (pkgpath.endsWith("/lit")) {
        await gitClonePackage([pkgpath, pkg], package_json, `lit@${pkg.version}`);
    } else {
        await gitClonePackage([pkgpath, pkg], package_json, pkg.version);
        await gitClonePackage([pkgpath, pkg], package_json, `v${pkg.version}`);
    }

    //console.log(pkg)
    //console.log(pkg.resolved)
}