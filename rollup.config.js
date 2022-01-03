// Import rollup plugins
import html from '@web/rollup-plugin-html';
import resolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import typescript from '@rollup/plugin-typescript';
import sucrase from '@rollup/plugin-sucrase';

// https://github.com/google/closure-compiler-npm/tree/master/packages/google-closure-compiler
// nix build nixpkgs#closurecompiler
// ln -sf $(readlink result)/bin/closure-compiler node_modules/google-closure-compiler-linux/compiler

import compiler from '@ampproject/rollup-plugin-closure-compiler';

export default {
  plugins: [
    // Entry point for application build; can specify a glob to build multiple
    // HTML files for non-SPA app
    html({
      input: 'src/index.html',
    }),
    // Resolve bare module specifiers to relative paths
    resolve({
      extensions: ['.js', '.ts']
    }),
    sucrase({
      exclude: ['node_modules/**'],
      transforms: ['typescript']
    }),
    // Minify HTML template literals
    minifyHTML(),
    compiler(),
/*    // Minify JS
    terser({
      ecma: 2020,
      module: true,
      warnings: true,
    }),*/
  ],
  output: {
    dir: 'dist',
  },
  preserveEntrySignatures: 'strict',
};