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
  T extends string | number | undefined
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
      .resettable=${resettable}
    ></pw-input-select>`;
  }
}

export class PwInputSelect<
  P extends keyof typeof routes,
  RESETTABLE extends boolean,
  T extends string | number | undefined
> extends PwInput<P, T, RESETTABLE, string, HTMLSelectElement> {
  get inner() {
    return html`${
      this.type !== "checkbox" && this.label !== null
        ? html`<label for=${this.randomId} class="form-label"
            >${this.label}:</label
          >`
        : undefined
    }
    <div class="${this.type !== "checkbox" ? "input-group" : ""}">
      <${
        this.type === "select"
          ? literal`select`
          : this.type === "textarea"
          ? literal`textarea`
          : literal`input`
      }
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
      >${
        this.type === "select" && this.options
          ? repeat(
              this.options,
              (o) => o.value,
              (o) =>
                html`<option
                  .selected=${/* maybe do this in the subclass and then maybe we can type it better */live(this.get(this.pwForm.formData) === o.value)}
                  .value=${o.value}
                >
                  ${o.text}
                </option>`
            )
          : undefined
      }</${
    this.type === "select"
      ? literal`select`
      : this.type === "textarea"
      ? literal`textarea`
      : literal`input`
  }>
  ${
    this.type === "checkbox" && this.label !== null
      ? html`<label for=${this.randomId} class="form-check-label"
          >${this.label}</label
        >`
      : undefined
  }`
  }



  mypwinputchangeDispatcher = () => {
    if (!this.input.value) {
      throw new Error();
    }
    const input = this.input.value;

    this.set(this.pwForm.formData, input.selectedIndex == -1
      ? null
      : this.options?.find((v) => v.value == input.value)?.value);

    this.input.value?.dispatchEvent(
      new CustomEvent("refreshentitylist", {
        bubbles: true,
        composed: true,
      })
    );
  };
}

customElements.define("pw-input-select", PwInputSelect);
