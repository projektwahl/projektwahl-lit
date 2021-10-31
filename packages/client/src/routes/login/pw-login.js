import "../../lib/form/pw-form";
// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement } from "lit";
import "../../lib/form/pw-input.js";

// https://lit.dev/docs/components/lifecycle/
// updateComplete

/**
 * @returns {Promise<import("lit").TemplateResult>}
 */
export const pwLogin = async () => {
  const content = await fetch("/api/v1/sleep").then((r) => r.text());
  return html`<pw-login .data=${content}></pw-login>`;
};

/**
 * @template {keyof import("../../routes").Routes} P
 */
export class PwLogin extends LitElement {
  /** @override */ static get properties() {
    return {
      result: { state: true },
    };
  }

  constructor() {
    super();
    /** @type {Promise<import("../../lib/types").OptionalResult<import("../../routes").Routes[P],{ network?: string } & { [key in keyof import("../../routes").Routes[P]]?: string }>>} */
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
customElements.define("pw-login", PwLogin);
