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
import { html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import type { z } from "zod";
import type { routes } from "../../lib/routes.js";
import type { PwForm } from "./pw-form.js";
import { PwInput } from "./pw-input.js";

// workaround see https://github.com/runem/lit-analyzer/issues/149#issuecomment-1006162839
export function pwInputCheckbox<
  P extends keyof typeof routes,
  T extends boolean | undefined
>(
  props: Pick<
    PwInputCheckbox<P, T>,
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
    | "defaultValue"
    | "trueValue"
    | "falseValue"
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
    trueValue,
    defaultValue,
    falseValue,
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
    .defaultValue=${defaultValue}
    .trueValue=${trueValue}
    .falseValue=${falseValue}
  ></pw-input-checkbox>`;
}

export class PwInputCheckbox<
  P extends keyof typeof routes,
  T extends boolean | undefined
> extends PwInput<P, T, HTMLInputElement> {
  static override get properties() {
    return {
      trueValue: { attribute: false },
      ...super.properties,
    };
  }

  falseValue!: T;
  trueValue!: T;

  mypwinputchangeDispatcher = (
  ) => {
    if (!this.input.value) {
      throw new Error();
    }

    this.set(this.closest<PwForm<P>>("pw-form")?.formData, this.input.value.checked ? this.trueValue : this.falseValue)

    this.dispatchEvent(new CustomEvent("pwinputchange", {
      bubbles: true,
      cancelable: false,
    }))
  };
}

customElements.define("pw-input-checkbox", PwInputCheckbox);
