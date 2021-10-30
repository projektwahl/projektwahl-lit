// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { AsyncDirective, directive } from "lit/async-directive.js";

class PromiseDirective extends AsyncDirective {

  /**
   * @template T
   * @template Q
   * @param {Promise<T>} promise 
   * @param {Q} defaultValue 
   * @param {(v: T) => Q} resolveMapper 
   * @param {(v: any) => Q} rejectMapper 
   * @returns 
   */
  render(
    promise,
    defaultValue,
    resolveMapper,
    rejectMapper
  ) {
    promise
      .then((resolvedValue) => {
        console.log("success");
        this.setValue(resolveMapper(resolvedValue));
      })
      .catch((reason) => {
        console.log("failure");
        this.setValue(rejectMapper(reason));
      });
    console.log("start");
    return defaultValue;
  }
}

// https://github.com/lit/lit/blob/main/packages/lit-html/src/directives/repeat.ts#L481
export const promise = /** @type {import("./promise-directive-types").PromiseDirectiveFn} */ (directive(PromiseDirective));
