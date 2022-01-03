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
    terser({
      ecma: 2020,
      module: true,
      warnings: true,
      mangle: {
        toplevel: true,
        //eval: true,
        module: true,
      },
      compress: {
        global_defs: {
          "window.PRODUCTION": true
        },
        //passes: 3,
        //arguments: true,
        //hoist_funs: true,
        toplevel: true,
        //keep_fargs: false,
        module: true,
        //pure_getters: true,
        /*unsafe: true,
        unsafe_comps: true,
        unsafe_Function: true,
        unsafe_math: true,
        unsafe_symbols: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true,*/
      },
      toplevel: true,
      //keep_classnames: false,
      //keep_fnames: false,
    }),
    //compiler(), // currently crashes in acorn dependency that's not updated
  ],
  output: {
    dir: 'dist',
  },
};