// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html } from "lit";
import "../../form/pw-input.js";
import "../../form/pw-form.js";
import { Task } from "@lit-labs/task";
import { myFetch } from "../../utils.js";
import { PwForm } from "../../form/pw-form.js";
import { HistoryController } from "../../history-controller.js";
import { isOk } from "../../../lib/result.js";
import { msg } from "@lit/localize";

// https://lit.dev/docs/components/lifecycle/
// updateComplete

/**
 * @returns {Promise<import("lit").TemplateResult>}
 */
export const pwLogin = async () => {
  const content = 0; //await fetch("/api/v1/sleep").then((r) => r.text());
  return html`<pw-login .data=${content}></pw-login>`;
};

// maybe let this extend PwForm?
// I think this is the easiest way
// otherwise I think some information needs to propagated in some way

/**
 * @extends PwForm<"/api/v1/login">
 */
export class PwLogin extends PwForm {
  /** @override */ static get properties() {
    return {
      url: { attribute: false },
      actionText: { type: String },
      _task: { state: true },
      forceTask: { state: true },
    };
  }

  /** @override */ get actionText() {
    return msg("Login")
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
        // ts-expect-error doesn't contain files so this is fine
        const formData = /*new URLSearchParams(*/ new FormData(this.form.value);

        // @ts-expect-error bad typings
        let jsonData = Object.fromEntries(formData.entries());

        let result = await myFetch("/api/v1/login", {
          method: "POST",
          headers: {
            "content-type": "text/json",
          },
          body: JSON.stringify(jsonData),
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

  /** @override */ getInputs = () => {
    return html` <a
        class="btn btn-primary btn-lg w-100 my-5"
        href="/api/v1/openid-login"
        role="button"
        >${msg("Login with third party account")}</a
      >

      <h3 class="text-center">${msg("Login as guest")}</h3>

      <pw-input
        type="text"
        autocomplete="username"
        label="${msg("Username")}"
        name="username"
        .task=${this._task}
      ></pw-input>
      <pw-input
        label="${msg("Password")}"
        name="password"
        type="password"
        autocomplete="current-password"
        .task=${this._task}
      ></pw-input>`;
  };

  /** @override */ submit = (/** @type {SubmitEvent} */ event) => {
    event.preventDefault();

    this.forceTask = (this.forceTask || 0) + 1;
  };
}
customElements.define("pw-login", PwLogin);
