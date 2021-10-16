// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { bootstrapCss } from "../..";
import { HistoryController } from "../../history-controller";

@customElement("pw-input")
export class PwInput extends LitElement {
  private history = new HistoryController(this);

  @property({ type: String })
  label!: string;

  @property({ type: String })
  type!: "text" | "password";

  @property({ type: String })
  name!: string;

  @property({ type: String })
  autocomplete!: "username" | "current-password";

  @state()
  randomId: string;

  constructor() {
    super();
    this.randomId = "id" + Math.random().toString().replace(".", "");
  }

  // because forms in shadow root are garbage
  protected override createRenderRoot() {
    return this;
  }

  override render() {
    return html`
      ${bootstrapCss}
      <div class="mb-3">
        <label for=${this.randomId} class="form-label">${this.label}:</label>
        <input
          type=${this.type}
          class="form-control ${"is-invalid"}"
          name=${this.name}
          id=${this.randomId}
          aria-describedby="${this.randomId}-feedback"
          autocomplete=${this.autocomplete}
        />
        <div id="${this.randomId}-feedback" class="invalid-feedback">error</div>
      </div>
    `;
  }
}
