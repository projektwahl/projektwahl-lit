/**
 * @param {{ parentURL: string; }} context
 * @param { (specifier: string, context: { parentURL: string; }) => { url: string; } } defaultResolve
 */
export function resolve(specifier: string, context: {
    parentURL: string;
}, defaultResolve: (specifier: string, context: {
    parentURL: string;
}) => {
    url: string;
}): Promise<{
    url: string;
}>;
/**
 * @param {string} url
 * @param {undefined} context
 * @param { (url: string) => Promise<{ source: string; }> } defaultLoad
 * @returns {Promise<{ format: "module"; source: string; }>}
 */
export function load(url: string, context: undefined, defaultLoad: (url: string) => Promise<{
    source: string;
}>): Promise<{
    format: "module";
    source: string;
}>;
