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
import { ref } from "lit/directives/ref.js";
import { pwInputFile } from "../../form/pw-input-file.js";

class PwUsersImport extends PwForm<"/api/v1/users/create"> {
  static get properties() {
    return {
      ...super.properties,
      uri: { type: String },
      _task: { state: true },
      type: { state: true },
      initial: { attribute: false },
    };
  }

  override get actionText() {
    return msg("Import accounts");
  }

  constructor() {
    super();

    this._task = new Task(this, async () => {
      const formDataEvent = new CustomEvent<
        { file: Promise<string|undefined> }
      >("myformdata", {
        bubbles: false,
        detail: {},
      });
      this.form.value?.dispatchEvent(formDataEvent);

      // TODO FIXME check that file upload succeeded

      const result = await myFetch<"/api/v1/users/create">(
        "POST",
        "/api/v1/users/create",
        JSON.parse(await formDataEvent.detail.file),
        {}
      );

      if (result.success) {
        HistoryController.goto(new URL("/", window.location.href), {}, false);
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
              ${pwInputFile<"/api/v1/users/create">({
                url: this.url,
                type: "file",
                label: msg(".json Datei"),
                name: [],
                get: (o) => undefined,
                set: (o, v) => {
                  o.file = v;
                },
                task: this._task,
                defaultValue: undefined,
              })}

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
            </form>
          </div>
        </div>
      </main>
    `;
  }
}

customElements.define("pw-users-import", PwUsersImport);
