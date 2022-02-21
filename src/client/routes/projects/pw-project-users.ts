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
import type { routes } from "../../../lib/routes.js";
import type { z } from "zod";
import { taskFunction } from "../../entity-list/pw-entitylist.js";

export const pwProjectUsers = async (url: URL, prefix: string) => {
  const result = await taskFunction("/api/v1/users", url, prefix);
  return html`<pw-project-users .initial=${result} prefix=${prefix}></pw-project-users>`;
};

export const PwProjectUsers = setupHmr(
  "PwProjectUsers",
  class PwProjectUsers<X extends string> extends PwUsers<X> {
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
      try {
        // TODO FIXME this use of any / untyped makes lots of problems
        // We need some client-side routing that stores the query parameters 
        const search: {
          [key in X]: z.infer<typeof routes["/api/v1/users"]["request"]>
         } = 
          JSON.parse(
            decodeURIComponent(
              this.history.url.search == ""
                ? "{}"
                : this.history.url.search.substring(1)
            )
          );
        const initial = search[this.prefix];

        return html`<tr>
            <th class="table-cell-hover" scope="col">${msg(html`&#x2713;`)}</th>

            <th class="table-cell-hover p-0" scope="col">
              ${pwOrder<"/api/v1/users">({
                refreshEntityList: () => this._task.run(),
                name: "id",
                path: [this.prefix],
                title: msg("ID"),
              })}
            </th>

            <th class="table-cell-hover p-0" scope="col">
              ${pwOrder<"/api/v1/users">({
                refreshEntityList: () => this._task.run(),
                name: "username",
                path: [this.prefix],
                title: msg("Name"),
              })}
            </th>

            <th class="table-cell-hover p-0" scope="col">
              ${pwOrder<"/api/v1/users">({
                refreshEntityList: () => this._task.run(),
                name: "type",
                path: [this.prefix],
                title: msg("Type"),
              })}
            </th>
          </tr>

          <tr>
            <th scope="col">
              ${pwInput<
                "/api/v1/users",
                ["filters", "project_leader_id" | "force_in_project_id"]
              >({
                label: null,
                name: ["filters", this.name],
                task: this._task,
                type: "checkbox",
                value: this.projectId,
                defaultValue: undefined,
                initial: initial,
              })}
            </th>

            <th scope="col">
              ${pwInput<"/api/v1/users", ["filters", "id"]>({
                label: null,
                name: ["filters", "id"],
                task: this._task,
                type: "number",
                defaultValue: undefined,
                initial,
              })}
            </th>

            <th scope="col">
              ${pwInput<"/api/v1/users", ["filters", "username"]>({
                label: null,
                name: ["filters", "username"],
                task: this._task,
                type: "text",
                initial,
              })}
            </th>

            <th scope="col">
              ${pwInput<"/api/v1/users", ["filters", "type"]>({
                label: null,
                name: ["filters", "type"],
                task: this._task,
                type: "text",
                defaultValue: undefined,
                initial,
              })}
            </th>

            <th scope="col"></th>
          </tr>`;
      } catch (error) {
        console.error(error);
        return html`<div class="alert alert-danger" role="alert">
          Ungültige URL! Bitte melden Sie diesen Fehler.
        </div>`;
      }
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
