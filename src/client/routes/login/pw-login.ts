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
import { ref } from "lit/directives/ref.js";
import { pwInputText } from "../../form/pw-input-text.js";
import { routes } from "../../../lib/routes.js";

// workaround see https://github.com/runem/lit-analyzer/issues/149#issuecomment-1006162839
export function pwLogin(
  props: Record<string, never>, // Pick<PwLogin, never>
) {
  return html`<pw-login></pw-login>`;
}

class PwLogin extends PwForm<"/api/v1/login"> {
  static override get properties() {
    return {
      ...super.properties,
      url: { attribute: false },
      actionText: { type: String },
      _task: {
        state: true,
        hasChanged: () => {
          return true;
        },
      },
    };
  }

  override get actionText() {
    return msg("Login");
  }

  constructor() {
    super();

    this._task = new Task(this, async () => {
      const result = await myFetch<"/api/v1/login">(
        "POST",
        "/api/v1/login",
        routes[this.url].request.parse(this.formData), // TODO FIXME error handling
        {},
      );

      if (result.success) {
        localStorage.setItem("stateupdate", "login");
        window.dispatchEvent(
          new StorageEvent("storage", {
            newValue: "login",
          }),
        );

        if (window.opener) {
          window.close();
        } else {
          HistoryController.goto(new URL("/", window.location.href), {}, true);
        }
      }

      return result;
    });
  }

  override render() {
    if (this.actionText === undefined) {
      throw new Error(msg("component not fully initialized"));
    }

    if (!this.hasUpdated) {
      this.formData = {};
    }

    return html`
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

              ${pwInputText<"/api/v1/login", string>({
                url: this.url,
                type: "text",
                autocomplete: "username",
                label: msg("Username"),
                name: ["username"],
                get: (o) => o.username,
                set: (o, v) => (o.username = v),
                task: this._task,
                defaultValue: "",
                resettable: false,
              })}
              ${pwInputText<"/api/v1/login", string>({
                url: this.url,
                type: "password",
                label: msg("Password"),
                name: ["password"],
                get: (o) => o.password,
                set: (o, v) => (o.password = v),
                autocomplete: "current-password",
                task: this._task,
                defaultValue: "",
                resettable: false,
              })}
              ${
                !this.disabled
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
                  : undefined
              }
            </form>
          </div>
        </div>
      </main>
    `;
  }
}

customElements.define("pw-login", PwLogin);

export { PwLogin };
