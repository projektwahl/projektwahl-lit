// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement, noChange } from "lit";
import { bootstrapCss } from "../index.js";
import { HistoryController } from "../history-controller.js";
import { isErr } from "../../lib/result.js";

/** @template T */
export class PwInput extends LitElement {
  /** @override */ static get properties() {
    return {
      label: { type: String },
      type: { type: String },
      name: { type: String },
      autocomplete: { type: String },
      randomId: { state: true },
      task: { attribute: false },
    };
  }

  constructor() {
    super();
    this.randomId = "id" + Math.random().toString().replace(".", "");

    /** @private */ this.history = new HistoryController(this);

    /** @type {string} */
    this.label;

    /** @type {"text" | "password"} */
    this.type;

    /** @type {keyof T} */
    this.name;

    /** @type {"username" | "current-password"} */
    this.autocomplete;

    /** @type {string} */
    this.randomId;

    /** @type {import("@lit-labs/task").Task} */
    this.task;
  }

  // because forms in shadow root are garbage
  /** @protected @override */ createRenderRoot() {
    return this;
  }

  /** @override */ render() {
    if (
      this.label === undefined ||
      this.type === undefined ||
      this.name === undefined ||
      this.autocomplete === undefined ||
      this.task === undefined
    ) {
      throw new Error("component not fully initialized");
    }

    return html`
      ${bootstrapCss}
      <div class="mb-3">
        <label for=${this.randomId} class="form-label">${this.label}:</label>
        <input
          type=${this.type}
          class="form-control ${this.task.render({
            error: (v) => "none",
            pending: () => "",
            complete: (v) => isErr(v) && v.failure[this.name] !== undefined
                ? "is-invalid"
                : "is-valid",
            initial: () => "",
          })}"
          name=${this.name.toString()}
          id=${this.randomId}
          aria-describedby="${this.randomId}-feedback"
          autocomplete=${this.autocomplete}
          ?disabled=${this.task.render({
            complete: () => false,
            error: () => false,
            pending: () => true,
            initial: () => false,
          })}
        />
        ${this.task.render({
          complete: (v) =>
            isErr(v) && v.failure[this.name] !== undefined
              ? html` <div
                  id="${this.randomId}-feedback"
                  class="invalid-feedback"
                >
                  ${v.failure[this.name]}
                </div>`
              : undefined,
            error: () => undefined,
            initial: () => undefined,
            pending: () => noChange
        })}
      </div>
    `;
  }
}
customElements.define("pw-input", PwInput);
