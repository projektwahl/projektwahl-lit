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
import { html, literal } from "lit/static-html.js";
import { LitElement, noChange } from "lit";
import { bootstrapCss } from "../index.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { msg } from "@lit/localize";
import { createRef, ref } from "lit/directives/ref.js";
import { repeat } from "lit/directives/repeat.js";
import type { routes } from "../../lib/routes.js";
import type { z } from "zod";
import type { Path } from "../utils.js";

// workaround see https://github.com/runem/lit-analyzer/issues/149#issuecomment-1006162839
export function pwInput<
  P extends keyof typeof routes = never,
  Q extends Path<z.infer<typeof routes[P]["request"]>> = never
>(
  props: Pick<
    PwInput<P, Q>,
    | "type"
    | "autocomplete"
    | "disabled"
    | "initial"
    | "label"
    | "name"
    | "options"
    | "task"
  > &
    Partial<Pick<PwInput<P, Q>, "onchange">>
) {
  const {
    onchange,
    disabled,
    initial,
    label,
    name,
    options,
    task,
    type,
    autocomplete,
    ...rest
  } = props;
  let _ = rest;
  _ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
  return html`<pw-input
    type=${type}
    ?disabled=${disabled}
    @change=${onchange}
    .label=${label}
    .name=${name}
    .options=${options}
    autocomplete=${ifDefined(autocomplete)}
    .task=${task}
    .initial=${initial}
  ></pw-input>`;
}

export class PwInput<
  P extends keyof typeof routes,
  Q extends Path<z.infer<typeof routes[P]["request"]>> = never
> extends LitElement {
  static override get properties() {
    return {
      label: { attribute: false },
      name: { type: String },
      type: { type: String },
      options: { attribute: false },
      autocomplete: { type: String },
      disabled: { type: Boolean },
      randomId: { state: true },
      task: {
        attribute: false,
        hasChanged: () => {
          return true; // TODO FIXME bug in @lit-labs/task
        },
      },
      initial: {
        attribute: false,
      },
    };
  }

  disabled?: boolean = false;

  randomId;

  label!: string | null;

  name!: Q;

  type: "text" | "password" | "number" | "checkbox" | "select";

  autocomplete?: "username" | "current-password" | "new-password";

  task!: import("@lit-labs/task").Task<
    unknown[],
    z.infer<typeof routes[P]["response"]>
  >;

  initial?: z.infer<typeof routes[P]["request"]>;

  value!: string;

  input: import("lit/directives/ref").Ref<HTMLElement>;

  form!: HTMLFormElement;

  options?: { value: z.infer<typeof routes[P]["request"]>[Q]; text: string }[];

  constructor() {
    super();
    this.randomId = "id" + Math.random().toString().replace(".", "");

    this.type = "text";

    this.input = createRef();
  }

  // because forms in shadow root are garbage
  protected override createRenderRoot() {
    return this;
  }

  myformdataEventListener = (
    event: CustomEvent<z.infer<typeof routes[P]["request"]>>
  ) => {
    if (this.type === "number") {
      event.detail[this.name] =
        (this.input.value as HTMLInputElement).value === ""
          ? null
          : (this.input.value as HTMLInputElement).valueAsNumber;
    } else if (this.type === "checkbox") {
      event.detail[this.name] = (this.input.value as HTMLInputElement).checked;
    } else if (this.type === "select") {
      event.detail[this.name] =
        (this.input.value as HTMLSelectElement).selectedIndex == -1
          ? null
          : (this.input.value as HTMLInputElement).value;
    } else {
      event.detail[this.name] = (this.input.value as HTMLInputElement).value;
    }
  };

  override connectedCallback() {
    super.connectedCallback();
    this.form = this.closest("form") as HTMLFormElement;
    this.form.addEventListener("myformdata", this.myformdataEventListener);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.form.removeEventListener("myformdata", this.myformdataEventListener);
  }

  override render() {
    if (
      this.label === undefined ||
      this.name === undefined ||
      this.task === undefined
    ) {
      throw new Error(msg("component not fully initialized"));
    }

    return html`
      ${bootstrapCss}
      <div class="mb-3">
        ${
          this.type !== "checkbox" && this.label !== null
            ? html`<label for=${this.randomId} class="form-label"
                >${this.label}:</label
              >`
            : undefined
        }
        <${this.type === "select" ? literal`select` : literal`input`}
          ${ref(this.input)}
          type=${this.type}
          value=${ifDefined(this.initial?.[this.name])}
          ?checked=${this.initial?.[this.name]}
          class="${
            this.type === "checkbox" ? "form-check-input" : "form-control"
          } ${this.task.render({
      pending: () => "",
      complete: (v) =>
        !v.success && v.error[this.name as string] !== undefined
          ? "is-invalid"
          : "is-valid",
      initial: () => "",
    })}"
          name=${this.name.toString()}
          id=${this.randomId}
          aria-describedby="${this.randomId}-feedback"
          autocomplete=${ifDefined(this.autocomplete)}
          ?disabled=${
            this.disabled ||
            (this.task.render({
              complete: () => false,
              pending: () => true,
              initial: () => false,
            }) as boolean)
          }
        >
          ${
            this.type === "select"
              ? repeat(
                  this.options as {
                    value: z.infer<typeof routes[P]["request"]>[Q];
                    text: string;
                  }[],
                  (o) => o.value,
                  (o) =>
                    html`<option
                      ?selected=${this.initial?.[this.name] === o.value}
                      value=${o.value}
                    >
                      ${o.text}
                    </option>`
                )
              : undefined
          }
        </${this.type === "select" ? literal`select` : literal`input`}>
        ${
          this.autocomplete === "new-password"
            ? html`<div id="passwordHelp" class="form-text">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://imgs.xkcd.com/comics/password_strength.png"
                  >${msg(
                    "Denk dran: Lange Passwörter sind viel sicherer als welche mit vielen Sonderzeichen."
                  )}</a
                ><br />
                ${msg(html` Also lieber "Ich mag fliegende Autos." anstatt
                  "Moritz1234!".<br />Du kannst auch einen Passwort-Manager
                  verwenden, z.B.`)}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://bitwarden.com/download/"
                  >${msg("Bitwarden")}</a
                >
              </div>`
            : undefined
        }
        ${
          this.type === "checkbox" && this.label !== null
            ? html`<label for=${this.randomId} class="form-check-label"
                >${this.label}</label
              >`
            : undefined
        }
        ${this.task.render({
          complete: (v) => {
            if (!v.success) {
              if (v.error[this.name as string] !== undefined) {
                return html` <div
                  id="${this.randomId}-feedback"
                  class="invalid-feedback"
                >
                  ${v.error[this.name as string]}
                </div>`;
              }
              return undefined;
            }
          },
          initial: () => undefined,
          pending: () => noChange,
        })}
      </div>
    `;
  }
}
customElements.define("pw-input", PwInput);
