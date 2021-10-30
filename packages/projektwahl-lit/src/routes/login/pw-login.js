import "../../lib/form/pw-form";
// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { Routes } from "../../routes";
import { OptionalResult } from "../../lib/types";
import "../../lib/form/pw-input.js";

// https://lit.dev/docs/components/lifecycle/
// updateComplete

/**
 * @returns {Promise<TemplateResult>}
 */
export const pwLogin = async () => {
  const content = await fetch("/api/v1/sleep").then((r) => r.text());
  return html`<pw-login .data=${content}></pw-login>`;
};

/**
 * @template {keyof Routes} P
 */
export class PwLogin extends LitElement {
  /** @override */ static properties = {
    result: { state: true }
  }

  constructor() {
    super()
    /** @type {Promise<OptionalResult<Routes[P],{ network?: string } & { [key in keyof Routes[P]]?: string }>>} */
    this.result = Promise.resolve({ result: "none" });
  }

  /** @override */ render() {
    console.log("rerender");
    return html`<pw-form
      .url=${"/api/v1/login"}
      @form-result=${(/** @type {CustomEvent} */ event) => {
        this.result = event.detail;
      }}
      actionText="Login"
      .fakeSlot=${html` <pw-input
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
}
customElements.define("pw-login", PwLogin)