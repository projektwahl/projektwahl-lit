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
import "../../form/pw-checkbox-input.js";
import { setupHmr } from "../../hmr.js";
import { aClick } from "../../pw-a.js";

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

    name!: string; // f_project_leader

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
            <pw-order name="id" title=${msg("ID")}></pw-order>
          </th>

          <th class="table-cell-hover p-0" scope="col">
            <pw-order name="username" title=${msg("Name")}></pw-order>
          </th>

          <th class="table-cell-hover p-0" scope="col">
            <pw-order name="type" title=${msg("Type")}></pw-order>
          </th>
        </tr>

        <tr>
          <th scope="col">
            <input
              name=${`f_${this.name}`}
              type="checkbox"
              class="form-check-input"
              value=${this.history.url.searchParams.get(`f_${this.name}`)}
            />
          </th>

          <th scope="col">
            <input
              name="f_id"
              type="text"
              class="form-control"
              id="projects-filter-{name}"
              value=${this.history.url.searchParams.get("f_id")}
            />
          </th>

          <th scope="col">
            <input
              name="f_username"
              type="text"
              class="form-control"
              id="projects-filter-{name}"
              value=${this.history.url.searchParams.get("f_username")}
            />
          </th>

          <th scope="col">
            <input
              name="f_type"
              type="text"
              class="form-control"
              id="projects-filter-{name}"
              value=${this.history.url.searchParams.get("f_type")}
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
