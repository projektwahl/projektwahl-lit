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
import {
  parseRequestWithPrefix,
  taskFunction,
} from "../../entity-list/pw-entitylist.js";
import { pwInputCheckbox } from "../../form/pw-input-checkbox.js";
import { pwInputNumber } from "../../form/pw-input-number.js";
import { pwInputText } from "../../form/pw-input-text.js";
import type { entityRoutes, routes } from "../../../lib/routes.js";
import type { z } from "zod";
import { pwInputSelect } from "../../form/pw-input-select.js";

const defaultValue: z.infer<typeof entityRoutes["/api/v1/users"]["request"]> = {
  sorting: [],
  filters: {},
  paginationDirection: "forwards",
  paginationLimit: 100,
};

export const pwProjectUsers = async (url: URL, prefix: string) => {
  const result = await taskFunction("/api/v1/users", url, prefix, defaultValue);
  return html`<pw-project-users
    .initial=${result}
    prefix=${prefix}
  ></pw-project-users>`;
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

    constructor() {
      super();

      this.defaultValue = defaultValue;
    }

    name!: "project_leader_id" | "force_in_project_id";

    projectId!: number;

    override get buttons() {
      return html``;
    }

    override get head() {
      try {
        const data = parseRequestWithPrefix(
          this.url,
          this.prefix,
          this.history.url,
          defaultValue
        );

        const initial = data[this.prefix];

        return html`<tr>
            <th class="table-cell-hover p-0" scope="col">
              ${pwOrder({
                url: "/api/v1/users",
                name: ["sorting", `${this.name}_eq`],
                orderBy: `${this.name}_eq`,
                prefix: this.prefix,
                title: "",
                value: this.projectId,
                get: (o) => o.sorting,
                set: (o, v) => (o.sorting = v),
                initial,
                defaultValue: [],
              })}
            </th>

            <th class="table-cell-hover p-0" scope="col">
              ${pwOrder({
                url: "/api/v1/users",
                name: ["sorting", "id"],
                orderBy: "id",
                prefix: this.prefix,
                title: msg("ID"),
                value: null,
                get: (o) => o.sorting,
                set: (o, v) => (o.sorting = v),
                initial,
                defaultValue: [],
              })}
            </th>

            <th class="table-cell-hover p-0" scope="col">
              ${pwOrder({
                url: "/api/v1/users",
                name: ["sorting", "username"],
                orderBy: "username",
                prefix: this.prefix,
                title: msg("Name"),
                value: null,
                get: (o) => o.sorting,
                set: (o, v) => (o.sorting = v),
                initial,
                defaultValue: [],
              })}
            </th>

            <th class="table-cell-hover p-0" scope="col">
              ${pwOrder({
                url: "/api/v1/users",
                name: ["sorting", "type"],
                orderBy: "type",
                prefix: this.prefix,
                title: msg("Type"),
                value: null,
                get: (o) => o.sorting,
                set: (o, v) => (o.sorting = v),
                initial,
                defaultValue: [],
              })}
            </th>
          </tr>

          <tr>
            <th scope="col">
              ${pwInputCheckbox<"/api/v1/users">({
                url: this.url,
                label: null,
                name: ["filters", this.name],
                get: (o) => o.filters[this.name] == this.projectId,
                set: (o, v) =>
                  (o.filters[this.name] = v ? this.projectId : undefined),
                task: this._task,
                type: "checkbox",
                trueValue: true,
                falseValue: undefined,
                defaultValue: undefined,
                initial: initial,
                resettable: false,
              })}
            </th>

            <th scope="col">
              ${pwInputNumber<"/api/v1/users", number | undefined>({
                enabled: true,
                url: this.url,
                label: null,
                name: ["filters", "id"],
                get: (o) => o.filters.id,
                set: (o, v) => (o.filters.id = v),
                task: this._task,
                type: "number",
                defaultValue: undefined,
                initial,
                resettable: false,
              })}
            </th>

            <th scope="col">
              ${pwInputText<"/api/v1/users", string | undefined>({
                enabled: true,
                url: this.url,
                label: null,
                name: ["filters", "username"],
                get: (o) => o.filters.username,
                set: (o, v) => (o.filters.username = v),
                task: this._task,
                type: "text",
                initial,
                defaultValue: undefined,
                resettable: false,
              })}
            </th>

            <th scope="col">
              ${pwInputSelect<
                "/api/v1/users",
                z.infer<
                  typeof routes["/api/v1/users"]["request"]
                >["filters"]["type"]
              >({
                url: this.url,
                type: "select",
                disabled: this.disabled,
                enabled: true,
                label: null,
                name: ["filters", "type"],
                get: (o) => o.filters.type,
                set: (o, v) => (o.filters.type = v),
                options: [
                  { value: undefined, text: "Alle" },
                  { value: "voter", text: "Schüler" },
                  { value: "helper", text: "Helfer" },
                  { value: "admin", text: "Admin" },
                ],
                task: this._task,
                initial,
                defaultValue: undefined,
                resettable: false,
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
                      type="checkbox"
                      projectId=${this.projectId}
                      .user=${value}
                      name=${this.name}
                    ></pw-project-user-checkbox>
                  </td>
                  <th scope="row">
                    <p>
                      ${value.deleted
                        ? html`<del
                            ><a @click=${aClick} href="/users/view/${value.id}"
                              >${value.id}</a
                            ></del
                          >`
                        : html`<a
                            @click=${aClick}
                            href="/users/view/${value.id}"
                            >${value.id}</a
                          >`}
                    </p>
                  </th>
                  <td>
                    <p>
                      ${value.deleted
                        ? html`<del
                            ><a @click=${aClick} href="/users/view/${value.id}"
                              >${value.username}</a
                            ></del
                          >`
                        : html`<a
                            @click=${aClick}
                            href="/users/view/${value.id}"
                            >${value.username}</a
                          >`}
                    </p>
                  </td>
                  <td>
                    <p>
                      ${value.deleted
                        ? html`<del>${value.type}</del>`
                        : html`${value.type}`}
                    </p>
                  </td>
                </tr>`
              )
            : result.error;
        },
        initial: () => {
          return html`initial state`;
        },
      })}`;
    }
  }
);

customElements.define("pw-project-users", PwProjectUsers);
