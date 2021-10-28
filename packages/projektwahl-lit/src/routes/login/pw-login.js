var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import "../../lib/form/pw-form";
// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import "../../lib/form/pw-input";
// https://lit.dev/docs/components/lifecycle/
// updateComplete
export const pwLogin = async () => {
    const content = await fetch("/api/v1/sleep").then((r) => r.text());
    return html `<pw-login .data=${content}></pw-login>`;
};
let PwLogin = class PwLogin extends LitElement {
    constructor() {
        super(...arguments);
        this.result = Promise.resolve({ result: "none" });
    }
    render() {
        console.log("rerender");
        return html `<pw-form
      .url=${"/api/v1/login"}
      @form-result=${(event) => {
            this.result = event.detail;
        }}
      actionText="Login"
      .fakeSlot=${html ` <pw-input
          type="text"
          autocomplete="username"
          label="Name"
          name="username"
          .result=${this.result}
        ></pw-input>
        <pw-input
          label="Passwort"
          name="password"
          type="password"
          autocomplete="current-password"
          .result=${this.result}
        ></pw-input>`}
    >
    </pw-form>`;
    }
};
__decorate([
    state()
], PwLogin.prototype, "result", void 0);
PwLogin = __decorate([
    customElement("pw-login")
], PwLogin);
export { PwLogin };
//# sourceMappingURL=pw-login.js.map