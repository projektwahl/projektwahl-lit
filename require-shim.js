import { createRequire } from "module";

// e.g. the openid-client and the esbuild library are bundled as cjs and I think with node bundling this causes problems
Object.defineProperty(globalThis, "require", {
  enumerable: true,
  value: createRequire(import.meta.url),
});
