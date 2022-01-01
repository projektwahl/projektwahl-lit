import { cwd } from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import esbuild from "esbuild";
import { stat } from "node:fs/promises";

const baseURL = pathToFileURL(`${cwd()}/`).href;

const fileExists = (/** @type {import("fs").PathLike} */ path) =>
  stat(path).then(
    () => true,
    () => false
  );

/**
 * @param {{ parentURL: any; }} context
 * @param {{ (specifier: any, context: any, defaultResolve: any): { url: string; }; (arg0: string, arg1: any, arg2: any): any; }} defaultResolve
 */
export async function resolve(
  /** @type {string} */ specifier,
  context,
  defaultResolve
) {
  let newSpecifier = specifier.replace(/\.js$/, ".ts");

  if (newSpecifier.startsWith("file://")) {
    newSpecifier = fileURLToPath(newSpecifier);
  }

  const { parentURL = baseURL } = context;

  const targetUrl = new URL(newSpecifier, parentURL);

  //console.log("target:", targetUrl.href);

  if (
    targetUrl.href.startsWith("file://") &&
    (await fileExists(fileURLToPath(targetUrl.href)))
  ) {
    return {
      url: targetUrl.href,
    };
  }

  return defaultResolve(specifier, context, defaultResolve);
}

/**
 * @param {string} url
 * @param {undefined} context
 * @param {{ (url: string): Promise<{ source: string; }>; (arg0: any, arg1: any, arg2: any): PromiseLike<{ source: any; }> | { source: any; }; }} defaultLoad
 */
export async function load(url, context, defaultLoad) {
  if (/\.ts$/.test(url)) {
    //console.log("a")
    const { source: rawSource } = await defaultLoad(
      url,
      { format: "module" },
      defaultLoad
    );
    //console.log(rawSource)
    const transformedSource = (
      await esbuild.transform(rawSource.toString(), {
        format: "esm",
        loader: "ts",
        sourcemap: "inline",
        sourcefile: url,
      })
    ).code;

    return {
      format: "module",
      source: transformedSource,
    };
  }

  return defaultLoad(url, context, defaultLoad);
}
