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
import { Task } from "@dev.mohe/task";
import { myFetch } from "../../utils.js";
import { PwForm } from "../../form/pw-form.js";
import { HistoryController } from "../../history-controller.js";
import { msg } from "@lit/localize";
import "../../form/pw-input.js";
import { pwInput } from "../../form/pw-input.js";
import { bootstrapCss } from "../../index.js";
import { ref } from "lit/directives/ref.js";

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
        bubbles: false,
        detail: {},
      });
      this.form.value?.dispatchEvent(formDataEvent);

      const result = await myFetch<"/api/v1/login">(
        "POST",
        "/api/v1/login",
        formDataEvent.detail,
        {}
      );

      if (result.success) {
        const bc = new BroadcastChannel("updateloginstate");
        bc.postMessage("login");
        bc.close();

        if (window.opener) {
          window.close();
        } else {
          HistoryController.goto(new URL("/", window.location.href), {});
        }
      }

      return result;
    });
  }

  override render() {
    if (this.actionText === undefined) {
      throw new Error(msg("component not fully initialized"));
    }

    return html`
      ${bootstrapCss}
      <main class="container">
        <h1 class="text-center">${this.actionText}</h1>

        <div class="row justify-content-center">
          <div class="col-md-7 col-lg-8">
            ${this.getErrors()}

            <form
              ${ref(this.form)}
              method="POST"
              action="/no-javascript"
              @submit=${async (event: Event) => {
                event.preventDefault();

                await this._task.run();
              }}
            >
              <a
                class="btn btn-primary btn-lg w-100 my-5"
                href="/api/v1/openid-login"
                role="button"
                >${msg("Login with third party account")}</a
              >
              <h3 class="text-center">${msg("Login as guest")}</h3>

              ${pwInput({
                url: this.url,
                type: "text",
                autocomplete: "username",
                label: msg("Username"),
                name: ["username"],
                get: (o) => o.username,
                set: (o, v) => (o.username = v),
                task: this._task,
              })}
              ${pwInput({
                url: this.url,
                type: "password",
                label: msg("Password"),
                name: ["password"],
                get: (o) => o.password,
                set: (o, v) => (o.password = v),
                autocomplete: "current-password",
                task: this._task,
              })}
              ${!this.disabled
                ? html`
                    <button
                      type="submit"
                      ?disabled=${this._task.render({
                        pending: () => true,
                        complete: () => false,
                        initial: () => false,
                      })}
                      class="btn btn-primary"
                    >
                      ${this.actionText}
                    </button>
                  `
                : undefined}
            </form>
          </div>
        </div>
      </main>
    `;
  }
}

customElements.define("pw-login", PwLogin);

export const pwLogin = async (): Promise<import("lit").TemplateResult> => {
  return html`<pw-login></pw-login>`;
};

export { PwLogin };
