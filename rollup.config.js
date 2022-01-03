// Import rollup plugins
import html from '@web/rollup-plugin-html';
import resolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import typescript from '@rollup/plugin-typescript';
//import sucrase from '@rollup/plugin-sucrase';

// https://github.com/google/closure-compiler-npm/tree/master/packages/google-closure-compiler
// nix build nixpkgs#closurecompiler
// ln -sf $(readlink result)/bin/closure-compiler node_modules/google-closure-compiler-linux/compiler

import compiler from '@ampproject/rollup-plugin-closure-compiler';

export default {
  plugins: [
    html({
      input: 'src/index.html',
    }),
    resolve({
      extensions: ['.js', '.ts']
    }),
    typescript(),
    /*sucrase({
      exclude: ['node_modules/**'],
      transforms: ['typescript']
    }),*/
    minifyHTML(),
    /*terser({
      ecma: 2020,
      module: true,
      warnings: true,
    }),*/
    compiler(), // currently crashes in acorn dependency that's not updated
  ],
  output: {
    dir: 'dist',
  },
};