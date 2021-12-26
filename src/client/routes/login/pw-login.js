// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { css, html } from "lit";
import "../../form/pw-form.js";
import { Task } from "@lit-labs/task";
import { myFetch } from "../../utils.js";
import { PwForm } from "../../form/pw-form.js";
import { HistoryController } from "../../history-controller.js";
import { isOk } from "../../../lib/result.js";
import { msg } from "@lit/localize";
import "../../form/pw-text-input.js";
import { setupHmr } from "../../hmr.js";

/**
 * @returns {Promise<import("lit").TemplateResult>}
 */
export const pwLogin = async () => {
  const content = 0; //await fetch("/api/v1/sleep").then((r) => r.text());
  return html`<pw-login .data=${content}></pw-login>`;
};

/**
 * @extends PwForm<"/api/v1/login">
 */
let PwLogin = class PwLogin extends PwForm {
  /** @override */ static get properties() {
    return {
      url: { attribute: false },
      actionText: { type: String },
      data: { attribute: false },
      _task: { state: true },
      forceTask: { state: true },
    };
  }

  /** @override */ get actionText() {
    return msg("Login");
  }

  constructor() {
    super();

    /** @type {number|undefined} */
    this.forceTask = undefined;

    /**
     * @override
     */
    this._task = new Task(
      this,
      async () => {
        const formDataEvent = new CustomEvent("myformdata", {
          bubbles: true,
          composed: true,
          detail: {},
        });
        this.form.value?.dispatchEvent(formDataEvent);

        let result = await myFetch("/api/v1/login", {
          method: "POST",
          headers: {
            "content-type": "text/json",
          },
          body: JSON.stringify(formDataEvent.detail),
        });

        if (isOk(result)) {
          HistoryController.goto(new URL("/", window.location.href), {});
        }

        return result;
        /*// https://lit.dev/docs/components/events/#dispatching-events
        const resultEvent = new CustomEvent("form-result", {
          detail: this.result,
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(resultEvent);
        */
      },
      () => [this.forceTask]
    );
  }

  /** @override static styles = css`h3 {
    color: blue;
  }`*/

  /** @override */ getInputs() {
    return html` <a
        class="btn btn-primary btn-lg w-100 my-5"
        href="/api/v1/openid-login"
        role="button"
        >${msg("Login with third party account")}</a
      >

      <h3 class="text-center">${msg("Login as guest")}</h3>
      

      <pw-text-input
        autocomplete="username"
        label="${msg("Username")}"
        name="username"
        .task=${this._task}
      ></pw-text-input>
      <pw-text-input
        label="${msg("Password")}"
        name="password"
        type="password"
        autocomplete="current-password"
        .task=${this._task}
      ></pw-text-input>`;
  };

  /** @override */ submit = (/** @type {SubmitEvent} */ event) => {
    event.preventDefault();

    this.forceTask = (this.forceTask || 0) + 1;
  };
}

PwLogin = setupHmr(import.meta.url, "PwLogin", PwLogin);

customElements.define("pw-login", PwLogin);

export { PwLogin }