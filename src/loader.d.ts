/**
 * @param {{ parentURL: any; }} context
 * @param {{ (specifier: any, context: any, defaultResolve: any): { url: string; }; (arg0: string, arg1: any, arg2: any): any; }} defaultResolve
 */
export function resolve(specifier: string, context: {
    parentURL: any;
}, defaultResolve: {
    (specifier: any, context: any, defaultResolve: any): {
        url: string;
    };
    (arg0: string, arg1: any, arg2: any): any;
}): Promise<{
    url: string;
}>;
/**
 * @param {string} url
 * @param {undefined} context
 * @param {{ (url: string): Promise<{ source: string; }>; (arg0: any, arg1: any, arg2: any): PromiseLike<{ source: any; }> | { source: any; }; }} defaultLoad
 * @returns {Promise<{ format: "module"; source: string; }>}
 */
export function load(url: string, context: undefined, defaultLoad: {
    (url: string): Promise<{
        source: string;
    }>;
    (arg0: any, arg1: any, arg2: any): PromiseLike<{
        source: any;
    }> | {
        source: any;
    };
}): Promise<{
    format: "module";
    source: string;
}>;
