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
import { createRef, Ref, ref } from "lit/directives/ref.js";
import { repeat } from "lit/directives/repeat.js";
import type { routes, ResponseType } from "../../lib/routes.js";
import type { z } from "zod";
import type { Task } from "@dev.mohe/task";

export abstract class PwInput<
  P extends keyof typeof routes,
  T,
  I extends Element
> extends LitElement {
  static override get properties() {
    return {
      label: { attribute: false },
      name: { attribute: false },
      type: { type: String },
      options: { attribute: false },
      autocomplete: { type: String },
      disabled: { type: Boolean },
      randomId: { state: true },
      defaultValue: { attribute: false },
      url: { attribute: false },
      task: {
        attribute: false,
        /*hasChanged: () => {
          return true; // TODO FIXME bug in @dev.mohe/task
          // I think the problem was that passing down a @dev.mohe/task doesnt work as this doesnt trigger updates in the subcomponent
        },*/
      },
      initial: {
        attribute: false,
      },
    };
  }

  url!: P;

  // these three here are just plain-up terrible but the typings for paths are equally bad
  name!: string[];

  // TODO FIXME maybe switch this back to Path and lodash-es (but not remove then for now so we could switch back)
  get!: (o: z.infer<typeof routes[P]["request"]>) => T | undefined;

  set!: (o: z.infer<typeof routes[P]["request"]>, v: T) => void;

  disabled?: boolean = false;

  randomId;

  label!: string | null;

  type: "text" | "password" | "number" | "checkbox" | "select";

  autocomplete?: "username" | "current-password" | "new-password";

  task!: Task<[URLSearchParams], ResponseType<P>>;

  initial?: z.infer<typeof routes[P]["request"]>;

  value?: T;

  input: Ref<I>;

  form!: HTMLFormElement;

  // z.infer<typeof routes[P]["request"]>[Q]
  options?: { value: T; text: string }[];

  defaultValue?: T;

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

  myformkeysEventListener = (event: CustomEvent<string[][]>) => {
    event.detail.push(this.name);
  };

  abstract myformdataEventListener: (
    event: CustomEvent<z.infer<typeof routes[P]["request"]>>
  ) => void

  override connectedCallback() {
    super.connectedCallback();
    const form = this.closest("form"); 
    if (!form) {
      throw new Error()
    }
    this.form = form;
    this.form.addEventListener("myformdata", this.myformdataEventListener);
    this.form.addEventListener("myformkeys", this.myformkeysEventListener);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.form.removeEventListener("myformdata", this.myformdataEventListener);
    this.form.removeEventListener("myformkeys", this.myformkeysEventListener);
  }

  override render() {
    if (this.label === undefined || this.task === undefined) {
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
          @input=${() => {
            this.input.value?.dispatchEvent(
              new CustomEvent("refreshentitylist", {
                bubbles: true,
                composed: true,
              })
            );
          }}
          type=${this.type}
          value=${ifDefined(this.get(this.initial))}
          ?checked=${this.get(this.initial)}
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
            this.disabled ||
            this.task.render({
              complete: () => false,
              pending: () => true,
              initial: () => false,
            })
          }
        >
          ${
            this.type === "select"
              ? repeat(
                  this.options!,
                  (o) => o.value,
                  (o) =>
                    html`<option
                      ?selected=${this.get(this.initial) === o.value}
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
              if (
                v.error.issues.find(
                  (i) => JSON.stringify(i.path) == JSON.stringify(this.name)
                ) !== undefined
              ) {
                return html` <div
                  id="${this.randomId}-feedback"
                  class="invalid-feedback"
                >
                  ${v.error.issues.find(
                    (i) => JSON.stringify(i.path) == JSON.stringify(this.name)
                  )?.message}
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
