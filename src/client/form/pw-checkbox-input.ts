// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement, noChange } from "lit";
import { bootstrapCss } from "../index.js";
import { HistoryController } from "../history-controller.js";
import { setupHmr } from "../hmr.js";
import { msg } from "@lit/localize";
import { createRef, ref } from "lit/directives/ref.js";

export class PwCheckboxInput<T> extends LitElement {
  static override get properties() {
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

  randomId;

  private history;

  label!: string;

  name!: keyof T;

  task!: import("@lit-labs/task").Task<any, import("zod").infer<typeof import("../../lib/result.js").anyResult>>;

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
    console.log(this.closest("form"));
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
          type="checkbox"
          class="form-check-input ${this.task.render({
            error: () => "",
            pending: () => "",
            complete: (v) =>
              !v.success && v.error[this.name] !== undefined
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
            !v.success && v.error[this.name] !== undefined
              ? html` <div
                  id="${this.randomId}-feedback"
                  class="invalid-feedback"
                >
                  ${v.error[this.name]}
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
