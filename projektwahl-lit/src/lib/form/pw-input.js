var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement, noChange } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { bootstrapCss } from "../..";
import { HistoryController } from "../../history-controller";
import { isErr } from "../result";
import { promise } from "./promise-directive";
let PwInput = class PwInput extends LitElement {
    constructor() {
        super();
        this.history = new HistoryController(this);
        this.randomId = "id" + Math.random().toString().replace(".", "");
    }
    // because forms in shadow root are garbage
    createRenderRoot() {
        return this;
    }
    render() {
        if (this.label === undefined ||
            this.type === undefined ||
            this.name === undefined ||
            this.autocomplete === undefined ||
            this.result === undefined) {
            throw new Error("component not fully initialized");
        }
        return html `
      ${bootstrapCss}
      <div class="mb-3">
        <label for=${this.randomId} class="form-label">${this.label}:</label>
        <input
          type=${this.type}
          class="form-control ${promise(this.result, noChange, (v) => isErr(v) && v.failure[this.name] !== undefined
            ? "is-invalid"
            : (isErr(v) && v.failure.network !== undefined) ||
                v.result === "none"
                ? undefined
                : "is-valid", (e) => undefined)}"
          name=${this.name.toString()}
          id=${this.randomId}
          aria-describedby="${this.randomId}-feedback"
          autocomplete=${this.autocomplete}
        />
        ${promise(this.result, noChange, (v) => isErr(v) && v.failure[this.name] !== undefined
            ? html ` <div
                  id="${this.randomId}-feedback"
                  class="invalid-feedback"
                >
                  ${v.failure[this.name]}
                </div>`
            : undefined, (e) => undefined)}
      </div>
    `;
    }
};
__decorate([
    property({ type: String })
], PwInput.prototype, "label", void 0);
__decorate([
    property({ type: String })
], PwInput.prototype, "type", void 0);
__decorate([
    property({ type: String })
], PwInput.prototype, "name", void 0);
__decorate([
    property({ type: String })
], PwInput.prototype, "autocomplete", void 0);
__decorate([
    state()
], PwInput.prototype, "randomId", void 0);
__decorate([
    property({ attribute: false })
], PwInput.prototype, "result", void 0);
PwInput = __decorate([
    customElement("pw-input")
], PwInput);
export { PwInput };
//# sourceMappingURL=pw-input.js.map