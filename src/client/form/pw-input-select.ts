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
import type { routes } from "../../lib/routes.js";
import { PwInput } from "./pw-input.js";
import { Ref, ref } from "lit/directives/ref.js";

// workaround see https://github.com/runem/lit-analyzer/issues/149#issuecomment-1006162839
export function pwInputSelect<
  P extends keyof typeof routes,
  T extends string | boolean | number | undefined
>(
  props: Pick<
    PwInputSelect<P, T>,
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
    | "resettable"
  > & { pwRef?: Ref<PwInputSelect<P, T>> }
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
    defaultValue,
    resettable,
    pwRef,
    ...rest
  } = props;
  let _ = rest;
  _ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
  if (pwRef) {
    return html`<pw-input-select
      ${ref(pwRef)}
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
      .resettable=${resettable}
    ></pw-input-select>`;
  } else {
    return html`<pw-input-select
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
      .resettable=${resettable}
    ></pw-input-select>`;
  }
}

export class PwInputSelect<
  P extends keyof typeof routes,
  T extends string | boolean | number | undefined
> extends PwInput<P, T, HTMLSelectElement> {
  mypwinputchangeDispatcher = () => {
    if (!this.input.value) {
      throw new Error();
    }
    const input = this.input.value;

    this.inputValue =
      input.selectedIndex == -1
        ? this.defaultValue
        : this.options?.find((v) => {
            // don't ask please. HTML select inputs can only store strings and this is a nice and easy hack
            if (v.value === true && input.value === "true") return true;
            if (v.value === false && input.value === "false") return true;
            return v.value == input.value;
          })?.value ?? this.defaultValue;

    this.set(this.pwForm.formData, this.inputValue);

    this.input.value?.dispatchEvent(
      new CustomEvent("refreshentitylist", {
        bubbles: true,
        composed: true,
      })
    );
  };
}

customElements.define("pw-input-select", PwInputSelect);
