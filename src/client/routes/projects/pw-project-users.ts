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
import { PwUsers, taskFunction } from "../users/pw-users.js";
import "./pw-project-user-checkbox.js";
import "../../form/pw-input.js";
import { setupHmr } from "../../hmr.js";
import { aClick } from "../../pw-a.js";
import { pwOrder } from "../../entity-list/pw-order.js";
import { ifDefined } from "lit/directives/if-defined";

export const pwProjectUsers = async (url: URL) => {
  let result = await taskFunction([url.searchParams]);
  return html`<pw-project-users .initial=${result}></pw-project-users>`;
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
      const f_name = this.history.url.searchParams.get(`f_${this.name}`);
      const f_id = this.history.url.searchParams.get("f_id")
      const f_username = this.history.url.searchParams.get("f_username")
      const f_type = this.history.url.searchParams.get("f_type");
      return html`<tr>
          <!--
      do not support this without javascript because there is literally zero useful ways to do this useful.
      the only nice way is probably submit buttons that do things like "oder_by_id_asc" and then redirect to the new state (because you need to remove the old state)
    -->
          <th class="table-cell-hover" scope="col">${msg(html`&#x2713;`)}</th>

          <th class="table-cell-hover p-0" scope="col">
            ${pwOrder({ name: "id", title: msg("ID") })}
          </th>

          <th class="table-cell-hover p-0" scope="col">
            ${pwOrder({ name: "username", title: msg("Name") })}
          </th>

          <th class="table-cell-hover p-0" scope="col">
            ${pwOrder({ name: "type", title: msg("Type") })}
          </th>
        </tr>

        <tr>
          <th scope="col">
            <input
              name=${`f_${this.name}`}
              type="checkbox"
              class="form-check-input"
              value=${ifDefined(f_name === null ? undefined : f_name)}
            />
          </th>

          <th scope="col">
            <input
              name="f_id"
              type="text"
              class="form-control"
              id="projects-filter-{name}"
              value=${ifDefined(f_id === null ? undefined : f_id)}
            />
          </th>

          <th scope="col">
            <input
              name="f_username"
              type="text"
              class="form-control"
              id="projects-filter-{name}"
              value=${ifDefined(f_username === null ? undefined : f_username)}
            />
          </th>

          <th scope="col">
            <input
              name="f_type"
              type="text"
              class="form-control"
              id="projects-filter-{name}"
              value=${f_type}
            />
          </th>

          <th scope="col"></th>
        </tr>`;
    }

    override get body() {
      return html`${this._apiTask.render({
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
