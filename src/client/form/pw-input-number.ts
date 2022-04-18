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
import { html, noChange } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { live } from "lit/directives/live.js";
import { ref } from "lit/directives/ref.js";
import type { routes } from "../../lib/routes.js";
import { PwInput } from "./pw-input.js";

// workaround see https://github.com/runem/lit-analyzer/issues/149#issuecomment-1006162839
export function pwInputNumber<
  P extends keyof typeof routes,
  RESETTABLE extends boolean,
  T extends number | undefined | null
>(
  props: Pick<
    PwInputNumber<P, RESETTABLE, T>,
    | "type"
    | "autocomplete"
    | "disabled"
    | "enabled"
    | "initial"
    | "label"
    | "name"
    | "url"
    | "get"
    | "set"
    | "task"
    | "resettable"
  >
) {
  const {
    disabled,
    enabled,
    initial,
    label,
    name,
    get,
    set,
    url,
    task,
    type,
    autocomplete,
    resettable,
    ...rest
  } = props;
  let _ = rest;
  _ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
  return html`<pw-input-number
    type=${type}
    ?disabled=${disabled}
    ?enabled=${enabled}
    .label=${label}
    .get=${get}
    .set=${set}
    .url=${url}
    .name=${name}
    autocomplete=${ifDefined(autocomplete)}
    .task=${task}
    .initial=${initial}
    .resettable=${resettable}
  ></pw-input-number>`;
}

export class PwInputNumber<
  P extends keyof typeof routes,
  RESETTABLE extends boolean,
  T extends number | undefined | null
> extends PwInput<P, T, RESETTABLE, number | undefined, HTMLInputElement> {
  get inner() {
    return html`${
      this.label !== null
        ? html`<label for=${this.randomId} class="form-label"
            >${this.label}:</label
          >`
        : undefined
    }
    <div class="input-group">
      <input
        ${ref(this.input)}
        type=${this.type}
        name=${this.name}
        .value=${live(this.get(this.pwForm.formData))}
        class="form-control ${this.task.render({
          pending: () => noChange,
          complete: (v) =>
            !v.success &&
            v.error.issues.find(
              (i) => JSON.stringify(i.path) == JSON.stringify(this.name)
            ) !== undefined
              ? "is-invalid"
              : "is-valid",
          initial: () => "",
        })}"
        id=${this.randomId}
        aria-describedby="${this.randomId}-feedback"
        autocomplete=${ifDefined(this.autocomplete)}
        ?disabled=${
          !this.enabled &&
          (this.disabled ||
            this.task.render({
              complete: () => false,
              pending: () => true,
              initial: () => false,
            }))
        }
      ></input>
   ${this.inner2}    </div>
  `;
  }

  mypwinputchangeDispatcher = () => {
    if (!this.input.value) {
      throw new Error();
    }

    this.set(this.pwForm.formData, this.input.value.valueAsNumber);

    this.input.value?.dispatchEvent(
      new CustomEvent("refreshentitylist", {
        bubbles: true,
        composed: true,
      })
    );
  };
}

customElements.define("pw-input-number", PwInputNumber);
