import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { execFile } from 'child_process'
import { promisify } from 'util';
const asyncExecFile = promisify(execFile);

// first approach: try to create a package-lock.json that uses git-repos
// If the package being installed contains a prepare script, its dependencies and devDependencies will be installed, and the prepare script will be run, before the package is packaged and installed.
// <protocol> is one of git, git+ssh, git+http, git+https, or git+file.
/*
npm install git+https://github.com/Microsoft/TypeScript.git

// try out express.js first as it has dependencies and is still comparably simple
npm install git+https://github.com/expressjs/express.git

rm -Rf /tmp/node_modules/ && node ~/Documents/projektwahl-lit/audit.js
mv new-package-lock.json package-lock.json
rm -Rf node_modules/
npm ci

*/

// if that doesn't work try to implement building manually



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
    repository = repository.replace(/tree.+/, "");

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

            // TODO FIXME that this also works with existing directories
            return `git+${repository}#${version}`
        } catch (error) {
            console.error(error)
            return undefined
        }
    }
}

async function gitClonePackageCommit([pkgpath, pkg], package_json, commit) {
    let repository = package_json.repository
    if (typeof repository === "object") repository = repository.url;
    if (/^[a-zA-Z0-9-]+\/[a-zA-Z0-9-\.]+$/.test(repository)) {
        repository = "https://github.com/"+repository+".git"
    }
    repository = repository.replace(/^git\+/, "");
    //console.log(repository)
    // TODO FIXME parse the URL so we at least have a little bit more safety of malicious inputs

    if (!existsSync(join("/tmp", pkgpath))) {
        try {
            let result = await asyncExecFile("git", ["clone", "--filter=tree:0", "--no-checkout", repository, pkgpath], {
                cwd: "/tmp",
            })
            console.log(result)

            result = await asyncExecFile("git", ["checkout", commit], {
                cwd: join("/tmp", pkgpath),
            })
            console.log(result)
            return `git+${repository}#${commit}`
        } catch (error) {
            console.error(error)
            return undefined
        }
    }
}

async function typesPackage([pkgpath, pkg], package_json) {
    // please tell me how to extract version better out of @types packages
    // there is a hash in the package.json we could calculate but I don't if that works.

    let repository = package_json.repository
    if (typeof repository === "object") repository = repository.url;
    if (/^[a-zA-Z0-9-]+\/[a-zA-Z0-9-\.]+$/.test(repository)) {
        repository = "https://github.com/"+repository+".git"
    }
    repository = repository.replace(/^git\+/, "");
    //console.log(repository)
    // TODO FIXME parse the URL so we at least have a little bit more safety of malicious inputs

    if (!existsSync(join("/tmp", pkgpath))) {
        try {
            let result = await asyncExecFile("git", ["clone", "--filter=tree:0", "--branch", "master", "--no-checkout", repository, pkgpath], {
                cwd: "/tmp",
            })
            console.log(result)

            let readme_md = await readFile(join(pkgpath, "README.md"), {
                encoding: "utf-8"
            })

            let re = /Last updated: (.+)/
            let readme_time = readme_md.match(re)[1]
            console.log(readme_time)

            let commit = await asyncExecFile("git", ["rev-list", "-1", `--before="${readme_time}"`, "master"], {
                cwd: join("/tmp", pkgpath),
            })
            console.log(commit)

            result = await asyncExecFile("git", ["sparse-checkout", "init", "--cone"], {
                cwd: join("/tmp", pkgpath),
            })
            console.log(result)

            result = await asyncExecFile("git", ["sparse-checkout", "set", package_json.repository.directory], {
                cwd: join("/tmp", pkgpath),
            })
            console.log(result)

            result = await asyncExecFile("git", ["checkout", commit.stdout.trim()], {
                cwd: join("/tmp", pkgpath),
            })
            console.log(result)
            return `git+${repository}#${commit.stdout.trim()}`
        } catch (error) {
            console.error(error)
            return undefined
        }
    }
}

for (const [pkgpath, pkg] of Object.entries(package_lock.packages)) {
    if (pkgpath === "") continue;
    // https://docs.npmjs.com/cli/v7/configuring-npm/package-json
    let package_json = JSON.parse(await readFile(join(pkgpath, "package.json")))

    console.log(package_json.name)
    console.log(package_json.version)

    let correct_url;
    if (pkgpath.includes("/@types/")) {
        correct_url = await typesPackage([pkgpath, pkg], package_json)
    } else if (pkgpath.endsWith("/lodash.merge")) {
        correct_url = await gitClonePackage([pkgpath, pkg], package_json, `${pkg.version}-npm-packages`);
    } else if (pkgpath.endsWith("/lit-html")) {
        correct_url = await gitClonePackage([pkgpath, pkg], package_json, `lit-html@${pkg.version}`);
    } else if (pkgpath.endsWith("/lit-element")) {
        correct_url = await gitClonePackage([pkgpath, pkg], package_json, `lit-element@${pkg.version}`);
    } else if (pkgpath.endsWith("/lit")) {
        correct_url = await gitClonePackage([pkgpath, pkg], package_json, `lit@${pkg.version}`);
    } else if (pkgpath.endsWith("/@lit/reactive-element")) {
        correct_url = await gitClonePackage([pkgpath, pkg], package_json, `@lit/reactive-element@${pkg.version}`);
    } else if (pkgpath.endsWith("/@web/dev-server")) {
        correct_url = await gitClonePackage([pkgpath, pkg], package_json, `@web/dev-server@${pkg.version}`);
    } else if (pkgpath.endsWith("/@web/dev-server-core")) {
        correct_url = await gitClonePackage([pkgpath, pkg], package_json, `@web/dev-server-core@${pkg.version}`);
    } else if (pkgpath.endsWith("/@web/dev-server-esbuild")) {
        correct_url = await gitClonePackage([pkgpath, pkg], package_json, `@web/dev-server-esbuild@${pkg.version}`);
    } else if (pkgpath.endsWith("/@web/dev-server-hmr")) {
        correct_url = await gitClonePackage([pkgpath, pkg], package_json, `@web/dev-server-hmr@${pkg.version}`);
    } else if (pkgpath.endsWith("/@web/dev-server-rollup")) {
        correct_url = await gitClonePackage([pkgpath, pkg], package_json, `@web/dev-server-rollup@${pkg.version}`);
    } else if (pkgpath.endsWith("/@napi-rs/triples")) {
        correct_url = await gitClonePackage([pkgpath, pkg], package_json, `@napi-rs/triples@${pkg.version}`);
    } else if (pkgpath.endsWith("/@web/parse5-utils")) {
        correct_url = await gitClonePackage([pkgpath, pkg], package_json, `@web/parse5-utils@${pkg.version}`);
    } else if (pkgpath.endsWith("/@nodelib/fs.scandir")) {
        correct_url = await gitClonePackage([pkgpath, pkg], package_json, `@nodelib/fs.scandir@${pkg.version}`);
    } else if (pkgpath.endsWith("/@nodelib/fs.stat")) {
        correct_url = await gitClonePackage([pkgpath, pkg], package_json, `@nodelib/fs.stat@${pkg.version}`);
    } else if (pkgpath.endsWith("/@nodelib/fs.walk")) {
        correct_url = await gitClonePackage([pkgpath, pkg], package_json, `@nodelib/fs.walk@${pkg.version}`);
    } else if (package_json.name === "uri-js" && package_json.version === "4.4.1") {
        correct_url = await gitClonePackageCommit([pkgpath, pkg], package_json, "9a328873a21262651c3790505b24c9e318a0e12d")
    } else if (package_json.name === "string_decoder" && package_json.version === "0.10.31") {
        correct_url = await gitClonePackageCommit([pkgpath, pkg], package_json, "06bb4afbf163c9e1acd14125618784f9513f39d9")
    } else if (package_json.name === "pstree.remy" && package_json.version === "1.1.8") {
        correct_url = await gitClonePackageCommit([pkgpath, pkg], package_json, "f82ab879fc8929a5be76828545a0674af14f8d43")
    } else if (package_json.name === "progress" && package_json.version === "2.0.3") {
        correct_url = await gitClonePackageCommit([pkgpath, pkg], package_json, "0790207ef077cbfb7ebde24a1dd9895ebf4643e1")
    } else if (package_json.name === "path-to-regexp" && package_json.version === "0.1.7") {
        correct_url = await gitClonePackageCommit([pkgpath, pkg], package_json, "4c5412af6fae141f48c32e535bc931573ade99c4")
    } else if (package_json.name === "normalize-url" && package_json.version === "4.5.1") {
        correct_url = await gitClonePackageCommit([pkgpath, pkg], package_json, "454970b662086e8856d1af074c7a57df96545b8b")
    } else if (package_json.name === "mkdirp" && package_json.version === "0.5.5") {
        correct_url = await gitClonePackageCommit([pkgpath, pkg], package_json, "f2003bbcffa80f8c9744579fabab1212fc84545a")
    } else if (package_json.name === "json-buffer" && package_json.version === "3.0.0") {
        correct_url = await gitClonePackageCommit([pkgpath, pkg], package_json, "da6fe4c61fd9a5e7b450aecb079219794733b245")
    } else if (package_json.name === "functional-red-black-tree" && package_json.version === "1.0.1") {
        correct_url = await gitClonePackageCommit([pkgpath, pkg], package_json, "e7c9899a68797f8e891220b4c1a70456991a32a5")
    } else if (package_json.name === "fill-range" && package_json.version === "7.0.1") {
        correct_url = await gitClonePackageCommit([pkgpath, pkg], package_json, "39f421b499d5c97b62e955c179fa34c062aab2a5")
    } else if (package_json.name === "@open-wc/dev-server-hmr" && package_json.version === "0.1.2") {
        correct_url = await gitClonePackageCommit([pkgpath, pkg], package_json, "@open-wc/dev-server-hmr@0.1.2-next.0")
    } else if (package_json.name === "file-entry-cache" && package_json.version === "6.0.1") {
        correct_url = await gitClonePackageCommit([pkgpath, pkg], package_json, "c227beb3f0dacc1a8dd95504deabb74a7618c003")
    } else if (package_json.name === "acorn-jsx" && package_json.version === "5.3.2") {
        correct_url = await gitClonePackageCommit([pkgpath, pkg], package_json, "f5c107b85872230d5016dbb97d71788575cda9c3")
    } else {
        correct_url = await gitClonePackage([pkgpath, pkg], package_json, pkg.version);
        if (correct_url === undefined) {
            correct_url = await gitClonePackage([pkgpath, pkg], package_json, `v${pkg.version}`);
        }
    }

    pkg.integrity = correct_url;
    delete pkg.resolved;

    //console.log(pkg)
    //console.log(pkg.resolved)
}

delete package_lock.dependencies;

console.log(JSON.stringify(package_lock))
await writeFile("new-package-lock.json", JSON.stringify(package_lock, null, 4))