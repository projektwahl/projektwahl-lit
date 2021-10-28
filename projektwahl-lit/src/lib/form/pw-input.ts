// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement, noChange, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { bootstrapCss } from "../..";
import { HistoryController } from "../../history-controller";
import { isErr, OptionalResult, Result } from "../result";
import { promise } from "./promise-directive";

@customElement("pw-input")
export class PwInput<T> extends LitElement {
  private history = new HistoryController(this);

  @property({ type: String })
  label!: string;

  @property({ type: String })
  type!: "text" | "password";

  @property({ type: String })
  name!: keyof T;

  @property({ type: String })
  autocomplete!: "username" | "current-password";

  @state()
  randomId: string;

  @property({ attribute: false })
  result!: Promise<
    OptionalResult<T, { network?: string } & { [key in keyof T]?: string }>
  >;

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
          class="form-control ${promise<
            OptionalResult<
              T,
              { network?: string } & { [key in keyof T]?: string }
            >,
            string | symbol | undefined
          >(
            this.result,
            noChange,
            (v) =>
              isErr(v) && v.failure[this.name] !== undefined
                ? "is-invalid"
                : (isErr(v) && v.failure.network !== undefined) ||
                  v.result === "none"
                ? undefined
                : "is-valid",
            (e) => undefined
          )}"
          name=${this.name.toString()}
          id=${this.randomId}
          aria-describedby="${this.randomId}-feedback"
          autocomplete=${this.autocomplete}
        />
        ${promise<
          OptionalResult<
            T,
            { network?: string } & { [key in keyof T]?: string }
          >,
          TemplateResult | symbol | undefined
        >(
          this.result,
          noChange,
          (v) =>
            isErr(v) && v.failure[this.name] !== undefined
              ? html` <div
                  id="${this.randomId}-feedback"
                  class="invalid-feedback"
                >
                  ${v.failure[this.name]}
                </div>`
              : undefined,
          (e) => undefined
        )}
      </div>
    `;
  }
}
