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
import { bootstrapCss } from "../../index.js";
import { z } from "zod";

class PwRedirect extends PwForm<"/api/v1/redirect"> {
  static override get properties() {
    return {
      ...super.properties,
      _task: {
        state: true,
        hasChanged: () => {
          return true;
        },
      },
    };
  }

  override get actionText() {
    return msg("Third-party login");
  }

  constructor() {
    super();

    this._task = new Task(this, async () => {
      const searchParams = z
        .object({
          session_state: z.string(),
          code: z.string(),
        })
        .parse(Object.fromEntries(new URL(window.location.href).searchParams));

      const result = await myFetch<"/api/v1/redirect">(
        "GET",
        `/api/v1/redirect`,
        searchParams,
        {}
      );

      if (result.success) {
        if ("BroadcastChannel" in window) {
          const bc = new BroadcastChannel("updateloginstate");
          bc.postMessage("login");
          bc.close();
        }

        if (window.opener) {
          window.close();
        } else {
          HistoryController.goto(new URL("/", window.location.href), {}, true);
        }
      }

      return result;
    });
    void this._task.run();
  }

  override render() {
    return html`
      ${bootstrapCss}
      <main class="container">
        <h1 class="text-center">${this.actionText}</h1>

        <div class="row justify-content-center">
          <div class="col-md-7 col-lg-8">
            ${this.getErrors()}

            <div
              style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1337;"
            >
              ${this._task.render({
                pending: () => html`<div
                  class="spinner-grow text-primary"
                  role="status"
                >
                  <span class="visually-hidden">${msg("Loading...")}</span>
                </div>`,
              })}
            </div>
          </div>
        </div>
      </main>
    `;
  }
}

customElements.define("pw-redirect", PwRedirect);

export { PwRedirect };
