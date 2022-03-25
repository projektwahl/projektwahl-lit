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
import { noChange } from "lit";
import { bootstrapCss } from "../index.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { msg } from "@lit/localize";
import { createRef, Ref, ref } from "lit/directives/ref.js";
import { repeat } from "lit/directives/repeat.js";
import type { routes, ResponseType } from "../../lib/routes.js";
import type { z } from "zod";
import type { Task } from "@dev.mohe/task";
import { PwElement } from "../pw-element.js";
import { PwForm } from "./pw-form.js";

export abstract class PwInput<
  P extends keyof typeof routes,
  T,
  I extends Element
> extends PwElement {
  static override get properties() {
    return {
      label: { attribute: false },
      name: { attribute: false },
      type: { type: String },
      options: { attribute: false },
      autocomplete: { type: String },
      disabled: { type: Boolean },
      enabled: { type: Boolean },
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
      resettable: { attribute: false },
      currentValue: { state: true },
    };
  }

  url!: P;

  // these three here are just plain-up terrible but the typings for paths are equally bad
  name!: (string | number)[];

  // TODO FIXME maybe switch this back to Path and lodash-es (but not remove then for now so we could switch back)
  get!: (o: z.infer<typeof routes[P]["request"]>) => T;

  set!: (o: z.infer<typeof routes[P]["request"]>, v: T) => void;

  disabled?: boolean = false;

  enabled?: boolean = false;

  resettable = false;

  randomId;

  label!: string | null;

  type:
    | "text"
    | "textarea"
    | "password"
    | "number"
    | "checkbox"
    | "select"
    | "file";

  autocomplete?: "username" | "current-password" | "new-password";

  task!: Task<[URLSearchParams], ResponseType<P>>;

  initial?: z.infer<typeof routes[P]["request"]>;

  input: Ref<I>;

  // TODO FIXME
  options?: { value: T; text: string }[];

  defaultValue!: T;

  pwForm!: PwForm<P>;

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

  abstract mypwinputchangeDispatcher: () => void;

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener("input", this.mypwinputchangeDispatcher);
    let curr: HTMLElement | null = this.parentElement;
    while (!(curr === null || curr instanceof PwForm)) {
      curr = curr.parentElement;
    }
    if (!curr) {
      throw new Error("PwForm not found");
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.pwForm = curr;
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("input", this.mypwinputchangeDispatcher);
  }

  override render() {
    if (this.label === undefined || this.task === undefined) {
      throw new Error(msg("component not fully initialized"));
    }

    if (!this.hasUpdated) {
      if (this.initial !== undefined) {
        this.set(this.pwForm.formData, this.get(this.initial));
      } else {
        this.set(this.pwForm.formData, this.defaultValue);
      }
    }

    // https://getbootstrap.com/docs/5.1/forms/validation/
    return html`
      ${bootstrapCss}
      <div class="col mb-3">
      ${
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
          @input=${() => {
            this.input.value?.dispatchEvent(
              new CustomEvent("refreshentitylist", {
                bubbles: true,
                composed: true,
              })
            );
          }}
          type=${ifDefined(this.type !== "textarea" ? this.type : undefined)}
          name=${this.name}
          value=${ifDefined(
            this.type !== "checkbox" && this.type !== "textarea"
              ? this.get(this.pwForm.formData)
              : undefined
          )}
          ?checked=${ifDefined(
            this.type === "checkbox"
              ? this.get(this.pwForm.formData) !== undefined
                ? this.get(this.pwForm.formData)
                : this.defaultValue
              : undefined
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
                    ?selected=${this.get(this.pwForm.formData) !== undefined
                      ? this.get(this.pwForm.formData) === o.value
                      : false}
                    value=${o.value}
                  >
                    ${o.text}
                  </option>`
              )
            : this.type === "textarea"
            ? this.get(this.pwForm.formData)
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
    }
    <button class="btn btn-outline-secondary" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
                  <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
                </svg>
                  </button>
        
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
      
      </div>
    `;
  }
}
