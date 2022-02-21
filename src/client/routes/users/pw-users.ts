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
import { pwOrder } from "../../entity-list/pw-order.js";
import { pwInput } from "../../form/pw-input.js";
import type { routes } from "../../../lib/routes.js";
import { taskFunction } from "../../entity-list/pw-entitylist.js";
import type { z } from "zod";

export const pwUsers = async (url: URL) => {
  const result = await taskFunction("/api/v1/users", url, "users");
  return html`<pw-users .initial=${result} prefix="users"></pw-users>`;
};

export class PwUsers<X extends string> extends PwEntityList<
  "/api/v1/users",
  X
> {
  static override get properties() {
    return {
      ...super.properties,
      title: { type: String },
    };
  }

  constructor() {
    super();
  }

  override get url() {
    return "/api/v1/users" as const;
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
    try {
      // TODO FIXME deduplicate
      const search: {
        [key in X]: z.infer<typeof routes["/api/v1/users"]["request"]>;
      } = JSON.parse(
        decodeURIComponent(
          this.history.url.search == ""
            ? "{}"
            : this.history.url.search.substring(1)
        )
      );
      const initial = search[this.prefix];

      return html`<tr>
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

          <th class="table-cell-hover">${msg("Actions")}</th>
        </tr>

        <tr>
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
              type: "select",
              disabled: this.disabled,
              label: msg("Type"),
              name: ["filters", "type"],
              options: [
                { value: undefined, text: "Alle" },
                { value: "voter", text: "Schüler" },
                { value: "helper", text: "Helfer" },
                { value: "admin", text: "Admin" },
              ],
              task: this._task,
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
          : undefined;
      },
      initial: () => {
        return html`hi`;
      },
    })}`;
  }
}

customElements.define("pw-users", PwUsers);
