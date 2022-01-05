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
import { html, LitElement, noChange } from "lit";
import { bootstrapCss } from "../index.js";
import { HistoryController } from "../history-controller.js";
import { setupHmr } from "../hmr.js";
import { msg } from "@lit/localize";
import { createRef, ref } from "lit/directives/ref.js";
import { ifDefined } from "lit/directives/if-defined.js";

export class PwCheckboxInput<T> extends LitElement {
  static override get properties() {
    return {
      label: { type: String },
      name: { attribute: false },
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

  disabled: boolean = false;

  randomId;

  private history;

  label!: string;

  name!: keyof T;

  task!: import("@lit-labs/task").Task<
    any,
    import("zod").infer<typeof import("../../lib/result.js").anyResult>
  >;

  initial: T | undefined;

  value!: string;

  input: import("lit/directives/ref").Ref<HTMLInputElement>;

  constructor() {
    super();
    this.randomId = "id" + Math.random().toString().replace(".", "");

    this.history = new HistoryController(this, /.*/);

    this.randomId;

    this.input = createRef();
  }

  // because forms in shadow root are garbage
  protected override createRenderRoot() {
    return this;
  }

  myformdataEventListener = (event: CustomEvent) => {
    event.detail[this.name] = this.input.value?.checked;
  };

  override connectedCallback() {
    super.connectedCallback();
    this.closest("form")?.addEventListener(
      "myformdata",
      this.myformdataEventListener
    );
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.closest("form")?.removeEventListener(
      "myformdata",
      this.myformdataEventListener
    );
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
      <div class="mb-3 form-check">
        <input type="hidden" name=${this.name.toString()} value="off" />
        <input
          ${ref(this.input)}
          ?disabled=${this.disabled ||
          this.task.render({
            complete: () => false,
            pending: () => true,
            initial: () => false,
          }) as boolean}
          type="checkbox"
          ?checked=${this.initial?.[this.name]}
          class="form-check-input ${this.task.render({
            pending: () => "",
            complete: (v) =>
              !v.success && v.error[this.name as string] !== undefined
                ? "is-invalid"
                : "is-valid",
            initial: () => "",
          })}"
          aria-describedby="${this.randomId}-feedback"
          name=${this.name.toString()}
          id=${this.randomId}
        />
        <label class="form-check-label" for=${this.randomId}
          >${this.label}</label
        >
        ${this.task.render({
          complete: (v) =>
            !v.success && v.error[this.name as string] !== undefined
              ? html` <div
                  id="${this.randomId}-feedback"
                  class="invalid-feedback"
                >
                  ${v.error[this.name as string]}
                </div>`
              : undefined,
          initial: () => undefined,
          pending: () => noChange,
        })}
      </div>
    `;
  }
}
customElements.define("pw-checkbox-input", PwCheckboxInput);
