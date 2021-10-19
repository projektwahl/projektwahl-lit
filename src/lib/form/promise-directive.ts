// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { AsyncDirective, directive } from "lit/async-directive.js";

class PromiseDirective<T, Q> extends AsyncDirective {
  render(
    promise: Promise<T>,
    defaultValue: Q,
    resolveMapper: (v: T) => Q,
    rejectMapper: (v: any) => Q
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
export const promise = directive(PromiseDirective);
