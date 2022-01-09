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
import { html } from "lit";
import { noChange } from "lit";
import { aClick } from "../../pw-a.js";
import { msg } from "@lit/localize";
import { PwEntityList } from "../../entity-list/pw-entitylist.js";
import { myFetch } from "../../utils.js";
import { pwOrder } from "../../entity-list/pw-order.js";
import { ifDefined } from "lit/directives/if-defined";

export const pwUsers = async (url: URL) => {
  let result = await taskFunction([url.searchParams]);
  return html`<pw-users title=${msg("Users")} .initial=${result}></pw-users>`;
};

export const taskFunction = async ([searchParams]: [URLSearchParams]) => {
  let response = await myFetch<"/api/v1/users">(
    `/api/v1/users?${searchParams}`,
    {}
  );
  return response;
};

export class PwUsers extends PwEntityList<"/api/v1/users"> {
  static override get properties() {
    return {
      ...super.properties,
      title: { type: String },
    };
  }

  constructor() {
    super(taskFunction);
  }

  override get buttons() {
    return html` <a
      @click=${aClick}
      class="btn btn-primary"
      href="/users/create"
      role="button"
      >${msg("Create account")}</a
    >`;
  }

  override get head() {
    const f_id = this.history.url.searchParams.get("f_id");
    const f_username = this.history.url.searchParams.get("f_username");
    const f_type = this.history.url.searchParams.get("f_type");
    return html`<tr>
        <!--
      do not support this without javascript because there is literally zero useful ways to do this useful.
      the only nice way is probably submit buttons that do things like "oder_by_id_asc" and then redirect to the new state (because you need to remove the old state)
    -->
        <th class="table-cell-hover p-0" scope="col">
          ${pwOrder<"/api/v1/users">({ name: "id", title: msg("ID") })}
        </th>

        <th class="table-cell-hover p-0" scope="col">
          ${pwOrder<"/api/v1/users">({ name: "username", title: msg("Name") })}
        </th>

        <th class="table-cell-hover p-0" scope="col">
          ${pwOrder<"/api/v1/users">({ name: "type", title: msg("Type") })}
        </th>

        <th class="table-cell-hover">${msg("Actions")}</th>
      </tr>

      <tr>
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
            value=${ifDefined(f_type === null ? undefined : f_type)}
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
                <td>
                  <a
                    class="btn btn-secondary"
                    href="/users/edit/${value.id}"
                    @click=${aClick}
                    role="button"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-pen"
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001zm-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708l-1.585-1.585z"
                      />
                    </svg>
                  </a>
                </td>
              </tr>`
            )
          : html`<tr>
              <td colspan="4">
                <div class="alert alert-danger" role="alert">
                  ${msg("Some errors occurred!")}<br />
                  ${Object.entries(result.error).map(
                    ([k, v]) => html`${k}: ${v}<br />`
                  )}
                </div>
              </td>
            </tr>`;
      },
      initial: () => {
        return html`hi`;
      },
    })}`;
  }
}

customElements.define("pw-users", PwUsers);
