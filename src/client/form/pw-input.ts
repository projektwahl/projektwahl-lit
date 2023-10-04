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
import { ifDefined } from "lit/directives/if-defined.js";
import { msg } from "@lit/localize";
import { createRef, Ref, ref } from "lit/directives/ref.js";
import { repeat } from "lit/directives/repeat.js";
import type { routes, MyResponseType } from "../../lib/routes.js";
import type { z } from "zod";
import type { Task } from "@lit-labs/task";
import { PwElement } from "../pw-element.js";

/// TODO FIXME instead of T we also need to take a zod schema for example for the enum (or if everything is from routes we could use that)
// maybe also use the default from zod
// think about login as thats an easy example
export abstract class PwInput<
  P extends keyof typeof routes,
  T,
  I extends Element,
> extends PwElement {
  static override get properties() {
    return {
      ...super.properties,
      label: { attribute: false },
      name: {
        attribute: false,
        hasChanged: (
          newVal: (string | number)[],
          oldVal: (string | number)[],
        ) => {
          return JSON.stringify(newVal) !== JSON.stringify(oldVal);
        },
      },
      type: { type: String },
      options: {
        attribute: false,
        hasChanged: (
          newVal: (string | number)[],
          oldVal: (string | number)[],
        ) => {
          return JSON.stringify(newVal) !== JSON.stringify(oldVal);
        },
      },
      autocomplete: { type: String },
      disabled: { type: Boolean },
      randomId: { state: true },
      defaultValue: { attribute: false },
      url: { attribute: false },
      task: {
        attribute: false,
        hasChanged: () => {
          return true;
        },
      },
      initial: {
        // TODO FIXME pass the inner element instead (and don't use the get method below)
        attribute: false,
      },
    };
  }

  /**
   * The url of the request.
   */
  url!: P;

  /**
   * The path in the request to this inputs value.
   */
  name!: (string | number)[];

  disabled?: boolean = false;

  /**
   * A random id to associate the label and input errors to the input.
   */
  randomId;

  /**
   * The label.
   */
  label!: string | null;

  /**
   * Field type
   */
  type:
    | "text"
    | "textarea"
    | "password"
    | "number"
    | "checkbox"
    | "select"
    | "file"
    | "datetime-local";

  /**
   * Autocompletion settings.
   */
  autocomplete?: "username" | "current-password" | "new-password";

  /**
   * The task that is executed in the parent form.
   */
  task!: Task<[URLSearchParams], MyResponseType<P>>;

  /**
   * The initial data to show and reset to.
   */
  initial?: z.infer<typeof routes[P]["request"]>;

  /**
   * A reference to the input element.
   */
  input: Ref<I>;

  // TODO FIXME
  options?: { value: T; text: string }[];

  /**
   * The default value. This values is used if e.g. a text/number field is empty.
   */
  defaultValue!: T;

  constructor() {
    super();
    this.randomId = `id${Math.random().toString().replace(".", "")}`;

    this.type = "text";

    this.input = createRef();
  }

  abstract mypwinputchangeDispatcher: () => void;

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener(
      this.type === "select" || this.type === "checkbox" ? "change" : "input",
      this.mypwinputchangeDispatcher,
    );
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(
      this.type === "select" || this.type === "checkbox" ? "change" : "input",
      this.mypwinputchangeDispatcher,
    );
  }

  override render() {
    if (this.label === undefined || this.task === undefined) {
      throw new Error(msg("component not fully initialized"));
    }

    return html`
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
          rows="6"
          type=${ifDefined(this.type !== "textarea" ? this.type : undefined)}
          name=${this.name}
          class="${
            this.type === "checkbox" ? "form-check-input" : "form-control"
          } ${this.task.render({
      pending: () => noChange,
      complete: (v) =>
        !v.success &&
        v.error.issues.find(
          (i) => JSON.stringify(i.path) === JSON.stringify(this.name),
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
        >${
          this.type === "select" && this.options
            ? repeat(
                this.options,
                (o) => o.value,
                (o) =>
                  html`<option
                    .value=${o.value}
                  >
                    ${o.text}
                  </option>`,
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
    }
        ${this.task.render({
          complete: (v) => {
            if (!v.success) {
              if (
                v.error.issues.find(
                  (i) => JSON.stringify(i.path) === JSON.stringify(this.name),
                ) !== undefined
              ) {
                return html` <div
                  id="${this.randomId}-feedback"
                  class="invalid-feedback"
                >
                  ${
                    v.error.issues.find(
                      (i) =>
                        JSON.stringify(i.path) === JSON.stringify(this.name),
                    )?.message
                  }
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
                  "Denk dran: Lange Passwörter sind viel sicherer als welche mit vielen Sonderzeichen.",
                )}</a
              ><br />
              ${msg(
                html`Also lieber "gasthaus lokales horizont monopol dosen klausel" anstatt
                  "Moritz1234!".<br />Du kannst auch einen Passwort-Manager
                  verwenden, z.B.`,
              )}
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
