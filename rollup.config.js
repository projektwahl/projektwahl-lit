/*
projektwahl-lit is a software to manage choosing projects and automatically assigning people to projects.
Copyright (C) 2021 Moritz Hedtke

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see https://www.gnu.org/licenses/.
*/
/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
// Import rollup plugins
import html from "@web/rollup-plugin-html";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import minifyHTML from "rollup-plugin-minify-html-literals";
import typescript from "@rollup/plugin-typescript";
//import sucrase from '@rollup/plugin-sucrase';

// https://github.com/google/closure-compiler-npm/tree/master/packages/google-closure-compiler
// nix build nixpkgs#closurecompiler
// ln -sf $(readlink result)/bin/closure-compiler node_modules/google-closure-compiler-linux/compiler

import compiler from "@ampproject/rollup-plugin-closure-compiler";

export default {
  plugins: [
    html({
      input: "src/index.html",
    }),
    resolve({
      extensions: [".js", ".ts"],
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
      compress: {
        global_defs: {
          "window.PRODUCTION": true,
        },
      },
    }),
    //compiler(), // currently crashes in acorn dependency that's not updated
  ],
  output: {
    dir: "dist",
  },
};
