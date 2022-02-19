import { createRequire } from 'module';

// e.g. the openid-client library is bundles as cjs and I think with node bundling this causes problems
Object.defineProperty(globalThis, 'require', {
	enumerable: true,
	value: createRequire(import.meta.url)
});