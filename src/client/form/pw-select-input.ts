// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement, noChange } from "lit";
import { bootstrapCss } from "../index.js";
import { HistoryController } from "../history-controller.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { setupHmr } from "../hmr.js";
import { msg } from "@lit/localize";
import { createRef, ref } from "lit/directives/ref.js";

export class PwSelectInput<T> extends LitElement {
  static override get properties() {
    return {
      label: { type: String },
      name: { type: String },
      options: { attribute: false },
      randomId: { state: true },
      task: {
        attribute: false,
        hasChanged: () => {
          return true; // TODO FIXME bug in @lit-labs/task
        },
      },
      initial: {
        attribute: false
      },
    };
  }

  randomId;

  private history;

  label!: string;

  name!: keyof T;

  task!: import("@lit-labs/task").Task<any, import("zod").infer<typeof import("../../lib/result.js").anyResult>>;

  initial: T | undefined;

  value!: string;

  input;

  options!: import("lit").TemplateResult;

  constructor() {
    super();
    this.randomId = "id" + Math.random().toString().replace(".", "");

    this.history = new HistoryController(this, /.*/);

    this.input = createRef<HTMLSelectElement>();
  }

  // because forms in shadow root are garbage
  protected override createRenderRoot() {
    return this;
  }

  myformdataEventListener = (event: CustomEvent) => {
    event.detail[this.name] =
      this.input.value!.selectedIndex == -1 ? null : this.input.value!.value;
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
      <div class="mb-3">
        <label for=${this.randomId} class="form-label">${this.label}:</label>
        <select
          ${ref(this.input)}
          aria-describedby="${this.randomId}-feedback"
          value=${this.initial?.[this.name]}
          class="form-select ${this.task.render({
            error: () => "",
            pending: () => "",
            complete: (v) =>
              !v.success && v.error[this.name] !== undefined
                ? "is-invalid"
                : "is-valid",
            initial: () => "",
          })}"
          name=${this.name.toString()}
          id=${this.randomId}
        >
          ${this.options}
        </select>
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
customElements.define("pw-select-input", PwSelectInput);

