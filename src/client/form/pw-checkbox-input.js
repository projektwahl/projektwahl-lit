// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement, noChange } from "lit";
import { bootstrapCss } from "../index.js";
import { HistoryController } from "../history-controller.js";
import { isErr } from "../../lib/result.js";
import { setupHmr } from "../hmr.js";
import { msg } from "@lit/localize";
import { createRef, ref } from "lit/directives/ref.js";

/** @template T */
export class PwCheckboxInput extends LitElement {
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

    /** @type {import("lit/directives/ref").Ref<HTMLInputElement>} */
    this.input = createRef();
  }

  // because forms in shadow root are garbage
  /** @protected @override */ createRenderRoot() {
    return this;
  }

  myformdataEventListener = (/** @type {CustomEvent} */ event) => {
    event.detail[this.name] = this.input.value?.checked;
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
      <div class="mb-3 form-check">
        <input type="hidden" name=${this.name.toString()} value="off" />
        <input
          ${ref(this.input)}
          type="checkbox"
          class="form-check-input ${this.task.render({
            error: () => "",
            pending: () => "",
            complete: (v) =>
              isErr(v) && v.failure[this.name] !== undefined
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
customElements.define("pw-checkbox-input", PwCheckboxInput);

setupHmr(PwCheckboxInput, import.meta.url);
