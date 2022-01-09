/*
projektwahl-lit is a software to manage choosing projects and automatically assigning people to projects.
Copyright (C) 2021 Moritz Hedtke

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see https://www.gnu.org/licenses/.
*/
/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import { html } from "lit";
import "../../form/pw-form.js";
import { Task } from "@lit-labs/task";
import { myFetch } from "../../utils.js";
import { PwForm } from "../../form/pw-form.js";
import { HistoryController } from "../../history-controller.js";
import { msg } from "@lit/localize";
import "../../form/pw-input.js";
import { pwInput } from "../../form/pw-input.js";

class PwLogin extends PwForm<"/api/v1/login"> {
  static override get properties() {
    return {
      ...super.properties,
      url: { attribute: false },
      actionText: { type: String },
      _task: { state: true },
    };
  }

  override get actionText() {
    return msg("Login");
  }

  constructor() {
    super();

    this._task = new Task(this, async () => {
      const formDataEvent = new CustomEvent("myformdata", {
        bubbles: true,
        composed: true,
        detail: {},
      });
      this.form.value?.dispatchEvent(formDataEvent);

      const result = await myFetch<"/api/v1/login">("/api/v1/login", {
        method: "POST",
        headers: {
          "content-type": "text/json",
        },
        body: JSON.stringify(formDataEvent.detail),
      });

      if (result.success) {
        HistoryController.goto(new URL("/", window.location.href), {});
      }

      return result;
    });
  }

  override getInputs() {
    return html` <a
        class="btn btn-primary btn-lg w-100 my-5"
        href="/api/v1/openid-login"
        role="button"
        >${msg("Login with third party account")}</a
      >

      <h3 class="text-center">${msg("Login as guest")}</h3>

      ${pwInput({
        type: "text",
        autocomplete: "username",
        label: msg("Username"),
        name: "username",
        task: this._task,
      })}
      ${pwInput({
        type: "password",
        label: msg("Password"),
        name: "password",
        autocomplete: "current-password",
        task: this._task,
      })}`;
  }
}

customElements.define("pw-login", PwLogin);

// eslint-disable-next-line @typescript-eslint/require-await
export const pwLogin = async (): Promise<import("lit").TemplateResult> => {
  return html`<pw-login></pw-login>`;
};

export { PwLogin };
