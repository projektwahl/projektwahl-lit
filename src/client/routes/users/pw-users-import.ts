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
import { bootstrapCss } from "../../index.js";
import { ref } from "lit/directives/ref.js";
import { pwInputFile } from "../../form/pw-input-file.js";

class PwUsersImport extends PwForm<"/api/v1/users/create-or-update"> {
  static get properties() {
    return {
      ...super.properties,
      uri: { type: String },
      _task: {
        state: true,
        hasChanged: () => {
          return true;
        },
      },
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
      // TODO FIXME check that file upload succeeded

      // @ts-expect-error impossible
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const fileContents = await this.formData.file;

      const result = await myFetch<"/api/v1/users/create-or-update">(
        "POST",
        "/api/v1/users/create-or-update",
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        fileContents ? JSON.parse(fileContents) : null,
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

    if (!this.hasUpdated) {
      // @ts-expect-error impossible
      this.formData = { file: Promise.resolve(undefined) };
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
              ${pwInputFile<"/api/v1/users/create-or-update">({
                url: this.url,
                type: "file",
                label: msg(".json Datei"),
                name: [],
                get: () => undefined,
                set: (o, v) => {
                  // @ts-expect-error hack
                  o.file = v;
                },
                task: this._task,
                defaultValue: undefined,
                resettable: false,
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
