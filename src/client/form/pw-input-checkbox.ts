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
import { literal } from "lit/static-html.js";
import type { routes } from "../../lib/routes.js";
import { PwInput } from "./pw-input.js";

// workaround see https://github.com/runem/lit-analyzer/issues/149#issuecomment-1006162839
export function pwInputCheckbox<P extends keyof typeof routes, RESETTABLE extends boolean,>(
  props: Pick<
    PwInputCheckbox<P, RESETTABLE>,
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
    | "options"
    | "task"
    | "resettable"
  >
) {
  const {
    disabled,
    enabled,
    initial,
    label,
    options,
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
  return html`<pw-input-checkbox
    type=${type}
    ?disabled=${disabled}
    ?enabled=${enabled}
    .label=${label}
    .get=${get}
    .set=${set}
    .url=${url}
    .name=${name}
    .options=${options}
    autocomplete=${ifDefined(autocomplete)}
    .task=${task}
    .initial=${initial}
    .resettable=${resettable}
  ></pw-input-checkbox>`;
}

export class PwInputCheckbox<P extends keyof typeof routes, RESETTABLE extends boolean,
> extends PwInput<
  P,
  boolean | undefined,
  RESETTABLE,
  boolean,
  HTMLInputElement
> {
  static override get properties() {
    return {
      ...super.properties,
    };
  }

  get inner() {
    return html`
    <div>
      <input
        ${ref(this.input)}
        rows="6"
        type=${ifDefined(this.type !== "textarea" ? this.type : undefined)}
        name=${this.name}
        .value=${ifDefined(
          this.type !== "checkbox" && this.type !== "select"
            ? live(this.get(this.pwForm.formData))
            : undefined
        )}
        .checked=${ifDefined(
          this.type === "checkbox" ? live(this.get(this.pwForm.formData) ) : undefined
        )}
        class="${
          this.type === "checkbox" ? "form-check-input" : "form-control"
        } ${this.task.render({
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
  ${
    this.type === "checkbox" && this.label !== null
      ? html`<label for=${this.randomId} class="form-check-label"
          >${this.label}</label
        >`
      : undefined
  }  ${this.inner2}     </div>
  `
  }

  mypwinputchangeDispatcher = () => {
    if (!this.input.value) {
      throw new Error();
    }

    this.set(this.pwForm.formData, this.input.value.checked);

    this.input.value?.dispatchEvent(
      new CustomEvent("refreshentitylist", {
        bubbles: true,
        composed: true,
      })
    );
  };
}

customElements.define("pw-input-checkbox", PwInputCheckbox);
