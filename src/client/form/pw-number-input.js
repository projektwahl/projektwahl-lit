// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement, noChange } from "lit";
import { bootstrapCss } from "../index.js";
import { HistoryController } from "../history-controller.js";
import { isErr } from "../../lib/result.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { setupHmr } from "../hmr.js";
import { msg } from "@lit/localize";

/** @template T */
export class PwNumberInput extends LitElement {
  /** @override */ static get properties() {
    return {
      label: { type: String },
      name: { type: String },
      randomId: { state: true },
      task: {
        attribute: false,
        hasChanged: () => {
          return true; // TODO FIXME bug in @lit-labs/task
        },
      },
      value: { type: String },
    };
  }

  constructor() {
    super();
    this.randomId = "id" + Math.random().toString().replace(".", "");

    /** @private */ this.history = new HistoryController(this, /.*/);

    /** @type {string} */
    this.label;

    /** @type {keyof T} */
    this.name;

    /** @type {string} */
    this.randomId;

    /** @type {import("@lit-labs/task").Task} */
    this.task;

    /** @type {string} */
    this.value;
  }

  // because forms in shadow root are garbage
  /** @protected @override */ createRenderRoot() {
    return this;
  }

  myformdataEventListener = (/** @type {CustomEvent} */ event) => {
    console.log("pw-input" + Math.random(), event);

    //event.detail[this.name] =
  };

  /** @override */ connectedCallback() {
    super.connectedCallback();
    console.log(this.closest("form"));
    this.closest("form")?.addEventListener(
      "myformdata",
      this.myformdataEventListener
    );
  }

  /** @override */ disconnectedCallback() {
    super.disconnectedCallback();
    this.closest("form")?.removeEventListener(
      "myformdata",
      this.myformdataEventListener
    );
  }

  /** @override */ render() {
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
        <label for=${this.randomId} class="form-label">${this.label}:</label>
        <input
          type="number"
          class="form-control ${this.task.render({
            error: () => "",
            pending: () => "",
            complete: (v) =>
              isErr(v) && v.failure[this.name] !== undefined
                ? "is-invalid"
                : "is-valid",
            initial: () => "",
          })}"
          name=${this.name.toString()}
          id=${this.randomId}
          aria-describedby="${this.randomId}-feedback"
          autocomplete=${ifDefined(this.autocomplete)}
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
          pending: () => noChange,
        })}
      </div>
    `;
  }
}
customElements.define("pw-number-input", PwNumberInput);

setupHmr(PwNumberInput, import.meta.url);
