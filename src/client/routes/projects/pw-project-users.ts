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
import "../../form/pw-form.js";
import "../../entity-list/pw-order.js";
import { html } from "lit";
import { noChange } from "lit";
import { msg } from "@lit/localize";
import { PwUsers } from "../users/pw-users.js";
import "./pw-project-user-checkbox.js";
import "../../form/pw-input.js";
import { setupHmr } from "../../hmr.js";
import { aClick } from "../../pw-a.js";
import { pwOrder } from "../../entity-list/pw-order.js";
import { pwInput } from "../../form/pw-input.js";

export const pwProjectUsers = async (url: URL) => {
  //const result = await taskFunction([url.searchParams]);
  // .initial=${result}
  return html`<pw-project-users></pw-project-users>`;
};

export const PwProjectUsers = setupHmr(
  "PwProjectUsers",
  class PwProjectUsers extends PwUsers {
    static override get properties() {
      return {
        ...super.properties,
        projectId: { type: Number },
        name: { type: String },
      };
    }

    name!: "project_leader_id" | "force_in_project_id";

    projectId!: number;

    override get buttons() {
      return html``;
    }

    override get head() {
      return html`<tr>
          <!--
      do not support this without javascript because there is literally zero useful ways to do this useful.
      the only nice way is probably submit buttons that do things like "oder_by_id_asc" and then redirect to the new state (because you need to remove the old state)
    -->
          <th class="table-cell-hover" scope="col">${msg(html`&#x2713;`)}</th>

          <th class="table-cell-hover p-0" scope="col">
            ${pwOrder<"/api/v1/users">({
              refreshEntityList: () => this._task.run(),
              name: "id",
              title: msg("ID"),
            })}
          </th>

          <th class="table-cell-hover p-0" scope="col">
            ${pwOrder<"/api/v1/users">({
              refreshEntityList: () => this._task.run(),
              name: "username",
              title: msg("Name"),
            })}
          </th>

          <th class="table-cell-hover p-0" scope="col">
            ${pwOrder<"/api/v1/users">({
              refreshEntityList: () => this._task.run(),
              name: "type",
              title: msg("Type"),
            })}
          </th>
        </tr>

        <tr>
          <th scope="col">
            ${pwInput<"/api/v1/users", ["filters", "project_leader_id" | "force_in_project_id"]>({
              label: null,
              name: ["filters", this.name],
              task: this._task,
              type: "checkbox",
              defaultValue: undefined,
              initial: JSON.parse(decodeURIComponent((this.history.url.search == "" ? "{}" : this.history.url.search.substring(1)))), // TODO FIXME
            })}
          </th>

          <th scope="col">
          ${pwInput<"/api/v1/users", ["filters", "id"]>({
            label: null,
            name: ["filters", "id"],
            task: this._task,
            type: "number",
            defaultValue: undefined,
            initial: JSON.parse(decodeURIComponent((this.history.url.search == "" ? "{}" : this.history.url.search.substring(1)))), // TODO FIXME
          })}
        </th>

        <th scope="col">
          ${pwInput<"/api/v1/users", ["filters", "username"]>({
            label: null,
            name: ["filters", "username"],
            task: this._task,
            type: "text",
            initial: JSON.parse(decodeURIComponent((this.history.url.search == "" ? "{}" : this.history.url.search.substring(1)))), // TODO FIXME
          })}
        </th>

        <th scope="col">
          ${pwInput<"/api/v1/users", ["filters", "type"]>({
            label: null,
            name: ["filters", "type"],
            task: this._task,
            type: "text",
            defaultValue: undefined,
            initial: JSON.parse(decodeURIComponent((this.history.url.search == "" ? "{}" : this.history.url.search.substring(1)))), // TODO FIXME
          })}
        </th>

          <th scope="col"></th>
        </tr>`;
    }

    override get body() {
      return html`${this._task.render({
        pending: () => {
          return noChange;
        },
        complete: (result) => {
          return result.success
            ? result.data.entities.map(
                (value) => html`<tr>
                  <td>
                    <pw-project-user-checkbox
                      projectId=${this.projectId}
                      .user=${value}
                      name=${this.name}
                    ></pw-project-user-checkbox>
                  </td>
                  <th scope="row">
                    <p>
                      <a @click=${aClick} href="/users/view/${value.id}"
                        >${value.id}</a
                      >
                    </p>
                  </th>
                  <td>
                    <p>
                      <a @click=${aClick} href="/users/view/${value.id}"
                        >${value.username}</a
                      >
                    </p>
                  </td>
                  <td>
                    <p>${value.type}</p>
                  </td>
                </tr>`
              )
            : result.error;
        },
        initial: () => {
          return html`hi`;
        },
      })}`;
    }
  }
);

customElements.define("pw-project-users", PwProjectUsers);
