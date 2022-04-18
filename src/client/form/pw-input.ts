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
import { html } from "lit/static-html.js";
import { noChange, TemplateResult } from "lit";
import { msg } from "@lit/localize";
import { createRef, Ref } from "lit/directives/ref.js";
import type { routes, ResponseType } from "../../lib/routes.js";
import type { z } from "zod";
import type { Task } from "@lit-labs/task";
import { PwElement } from "../pw-element.js";
import { PwForm } from "./pw-form.js";

export abstract class PwInput<
  P extends keyof typeof routes,
  T,
  RESETTABLE extends boolean,
  Q,
  I extends Element
> extends PwElement {
  static override get properties() {
    return {
      ...super.properties,
      label: { attribute: false },
      name: {
        attribute: false,
        hasChanged: (
          newVal: (string | number)[],
          oldVal: (string | number)[]
        ) => {
          return JSON.stringify(newVal) !== JSON.stringify(oldVal);
        },
      },
      type: { type: String },
      options: {
        attribute: false,
        hasChanged: (
          newVal: (string | number)[],
          oldVal: (string | number)[]
        ) => {
          return JSON.stringify(newVal) !== JSON.stringify(oldVal);
        },
      },
      autocomplete: { type: String },
      disabled: { type: Boolean },
      enabled: { type: Boolean },
      randomId: { state: true },
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
      resettable: { attribute: false },
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

  // TODO FIXME goddammit, the problem is probably differentiating an undefined start value and resetting to null/"". But maybe this works as we `set` the value to undefined at the start and all later `set` calls should use the default value instead

  /**
   * Extracts the value from the routes request data.
   */
  get!: (o: z.infer<typeof routes[P]["request"]>) => [RESETTABLE] extends [true] ? (Q | undefined) : Q;

  /**
   * Sets the value in the routes request data.
   */
  set!: (o: z.infer<typeof routes[P]["request"]>, v: [RESETTABLE] extends [true] ? (Q | undefined) : Q) => void;

  // TODO FIXME maybe merge these two?
  disabled?: boolean = false;
  enabled?: boolean = false;

  /**
   * Whether the input is resettable. Adds a reset button that resets the value to the initial value.
   */
  resettable!: RESETTABLE;

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
    | "file";

  /**
   * Autocompletion settings.
   */
  autocomplete?: "username" | "current-password" | "new-password";

  /**
   * The task that is executed in the parent form.
   */
  task!: Task<[URLSearchParams], ResponseType<P>>;

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
   * The parent form.
   */
  pwForm!: PwForm<P>;

  constructor() {
    super();
    this.randomId = "id" + Math.random().toString().replace(".", "");

    this.type = "text";

    this.input = createRef();
  }

  abstract mypwinputchangeDispatcher: () => void;

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener(
      this.type === "select" || this.type === "checkbox" ? "change" : "input",
      this.mypwinputchangeDispatcher
    );
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
    this.removeEventListener(
      this.type === "select" || this.type === "checkbox" ? "change" : "input",
      this.mypwinputchangeDispatcher
    );
  }

  protected willUpdate(changedProperties: Map<PropertyKey, unknown>): void {
    super.willUpdate(changedProperties);
    if (this.resettable && changedProperties.has("initial")) {
      // this is a "hack" so that rerendering with new initial data resets the resettable fields.

      // in case this is an update set the value to undefined as it wasn't changed yet.
      this.set(
        this.pwForm.formData,
        // @ts-expect-error tmp error
        this.resettable
          ? undefined
          : this.get(this.pwForm.formData)
      );
    }
  }

  abstract get inner(): TemplateResult;

  get inner2() {
    return html`${
      this.resettable && !this.disabled
        ? html`<button
            @click=${() => {
              this.set(
                this.pwForm.formData,
                this.initial
              );
              this.requestUpdate();
            }}
            class="btn btn-outline-secondary"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-arrow-counterclockwise"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"
              />
              <path
                d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"
              />
            </svg>
          </button>`
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
        })}`
  }

  override render() {
    if (this.label === undefined || this.task === undefined) {
      throw new Error(msg("component not fully initialized"));
    }

    if (!this.hasUpdated) {
      // TODO FIXME updated from above

      // in case this is an update set the value to undefined as it wasn't changed yet.
      if (this.resettable) {
        // @ts-expect-error bruh, known issue https://github.com/Microsoft/TypeScript/issues/24929
        const theUndefined: [RESETTABLE] extends [true] ? undefined : never = undefined;

        this.set(
          this.pwForm.formData,
          theUndefined
        );
      } else {
        this.set(
          this.pwForm.formData,
          this.get(this.initial)
        );
      }
      
    }

    return html`
      
      <div class="col mb-3">
      ${this.inner}
    
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
