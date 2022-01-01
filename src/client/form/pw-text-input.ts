// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement, noChange } from "lit";
import { bootstrapCss } from "../index.js";
import { HistoryController } from "../history-controller.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { setupHmr } from "../hmr.js";
import { msg } from "@lit/localize";
import { createRef, ref } from "lit/directives/ref.js";

export class PwTextInput<T> extends LitElement {
  static override get properties() {
    return {
      label: { type: String },
      name: { type: String },
      type: { type: String },
      autocomplete: { type: String },
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

  randomId;

  private history;

  label!: string;

  name!: keyof T;

  type: "text" | "password";

  autocomplete!: "username" | "current-password";

  task!: import("@lit-labs/task").Task<
    any,
    import("zod").infer<typeof import("../../lib/result.js").anyResult>
  >;

  initial: T | undefined;

  input: import("lit/directives/ref").Ref<HTMLInputElement>;

  value!: string;

  form: HTMLFormElement;

  constructor() {
    super();
    this.randomId = "id" + Math.random().toString().replace(".", "");

    this.history = new HistoryController(this, /.*/);

    this.type = "text";

    this.input = createRef();
  }

  // because forms in shadow root are garbage
  /** @protected @override */ createRenderRoot() {
    return this;
  }

  myformdataEventListener = (event: CustomEvent) => {
    event.detail[this.name] = this.input.value!.value;
  };

  override connectedCallback() {
    super.connectedCallback();
    this.form = this.closest("form")!;
    this.form.addEventListener("myformdata", this.myformdataEventListener);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.form.removeEventListener("myformdata", this.myformdataEventListener);
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
        <input
          ${ref(this.input)}
          type=${this.type}
          value=${this.initial?.[this.name]}
          class="form-control ${this.task.render({
            pending: () => "",
            complete: (v) =>
              !v.success && v.error[this.name] !== undefined
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
            pending: () => true,
            initial: () => false,
          })}
        />
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
          initial: () => undefined,
          pending: () => noChange,
        })}
      </div>
    `;
  }
}
customElements.define("pw-text-input", PwTextInput);
