// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement, noChange } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { bootstrapCss } from "../..";
import { HistoryController } from "../../history-controller";
import { OptionalResult, Result } from "../result";
import { promise } from "./promise-directive";

@customElement("pw-input")
export class PwInput<T> extends LitElement {
  private history = new HistoryController(this);

  @property({ type: String })
  label?: string;

  @property({ type: String })
  type?: "text" | "password";

  @property({ type: String })
  name?: string;

  @property({ type: String })
  autocomplete?: "username" | "current-password";

  @state()
  randomId: string;

  @property({ attribute: false })
  result?: Promise<OptionalResult<T>>;

  constructor() {
    super();
    this.randomId = "id" + Math.random().toString().replace(".", "");
  }

  // because forms in shadow root are garbage
  protected override createRenderRoot() {
    return this;
  }

  override render() {
    if (
      this.label === undefined ||
      this.type === undefined ||
      this.name === undefined ||
      this.autocomplete === undefined ||
      this.result === undefined
    ) {
      throw new Error("component not fully initialized");
    }

    return html`
      ${bootstrapCss}
      <div class="mb-3">
        <label for=${this.randomId} class="form-label">${this.label}:</label>
        <input
          type=${this.type}
          class="form-control ${promise(
            this.result,
            noChange,
            (v) => v,
            (e) => "is-invalid"
          )}"
          name=${this.name}
          id=${this.randomId}
          aria-describedby="${this.randomId}-feedback"
          autocomplete=${this.autocomplete}
        />
        ${promise(
          this.result,
          noChange,
          (v) => undefined,
          (v) => html` <div
            id="${this.randomId}-feedback"
            class="invalid-feedback"
          >
            test
          </div>`
        )}
      </div>
    `;
  }
}
