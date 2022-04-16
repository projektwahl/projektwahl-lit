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
import "../projects/pw-project-user-checkbox.js";
import "../../form/pw-input.js";
import { aClick } from "../../pw-a.js";
import { pwOrder } from "../../entity-list/pw-order.js";
import { parseRequestWithPrefix } from "../../entity-list/pw-entitylist.js";
import { pwInputCheckbox } from "../../form/pw-input-checkbox.js";
import { pwInputNumber } from "../../form/pw-input-number.js";
import { pwInputText } from "../../form/pw-input-text.js";
import type { entityRoutes, routes } from "../../../lib/routes.js";
import type { z } from "zod";
import { PwProjects } from "../projects/pw-projects.js";
import { pwProjectUserCheckbox } from "../projects/pw-project-user-checkbox.js";

const defaultValue: z.infer<
  typeof entityRoutes["/api/v1/projects"]["request"]
> = {
  sorting: [],
  filters: {},
  paginationDirection: "forwards",
  paginationLimit: 100,
};

// workaround see https://github.com/runem/lit-analyzer/issues/149#issuecomment-1006162839
export function pwUserProjects<X extends string>(
  props: Pick<
    PwUserProjects<X>,
    "initial" | "prefix" | "user" | "name" | "title"
  > & {
    refreshentitylist?: () => void;
  }
) {
  const { initial, prefix, refreshentitylist, user, name, title, ...rest } =
    props;
  let _ = rest;
  _ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
  return html`<pw-user-projects
    title=${title}
    name=${name}
    .user=${user}
    @refreshentitylist=${refreshentitylist}
    .initial=${initial}
    .prefix=${prefix}
  ></pw-user-projects>`;
}

export class PwUserProjects<X extends string> extends PwProjects<X> {
  static override get properties() {
    return {
      ...super.properties,
      user: { attribute: false },
      name: { type: String },
    };
  }

  constructor() {
    super();

    this.defaultValue = defaultValue;
  }

  name!: "project_leader_id" | "force_in_project_id";

  user!: z.infer<
    typeof routes["/api/v1/users"]["response"]
  >["entities"][number];

  override get buttons() {
    return html``;
  }

  override get head() {
    if (this.user === undefined) {
      throw new Error("this.user not set");
    }

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
              url: "/api/v1/projects",
              name: ["sorting", `${this.name}_eq`],
              orderBy: `${this.name}_eq`,
              prefix: this.prefix,
              title: "",
              value: this.user[this.name] ?? null,
              get: (o) => o.sorting,
              set: (o, v) => (o.sorting = v),
              initial,
              defaultValue: [],
            })}
          </th>

          <th class="table-cell-hover p-0" scope="col">
            ${pwOrder({
              url: "/api/v1/projects",
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
              url: "/api/v1/projects",
              name: ["sorting", "title"],
              orderBy: "title",
              prefix: this.prefix,
              title: msg("Title"),
              value: null,
              get: (o) => o.sorting,
              set: (o, v) => (o.sorting = v),
              initial,
              defaultValue: [],
            })}
          </th>

          <th class="table-cell-hover p-0" scope="col">
            ${pwOrder({
              url: "/api/v1/projects",
              name: ["sorting", "info"],
              orderBy: "info",
              prefix: this.prefix,
              title: msg("Info"),
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
            ${pwInputCheckbox<"/api/v1/projects">({
              url: this.url,
              label: null,
              name: ["filters", "id"],
              get: (o) => {
                console.log(o.filters);
                console.log(this.user);
                const val = this.user[this.name];
                return o.filters.id === (val === null ? undefined : val);
              },
              set: (o, v) => {
                const val = this.user[this.name];
                return (o.filters.id = v
                  ? val === null
                    ? undefined
                    : val
                  : undefined);
              },
              task: this._task,
              type: "checkbox",
              // TODO FIXME can we remove these everywhere and do this in get and set?
              trueValue: true,
              falseValue: false,
              defaultValue: undefined,
              initial: initial,
              resettable: false,
            })}
          </th>

          <th scope="col">
            ${pwInputNumber<"/api/v1/projects", number | undefined>({
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
            ${pwInputText<"/api/v1/projects", string | undefined>({
              enabled: true,
              url: this.url,
              label: null,
              name: ["filters", "title"],
              get: (o) => o.filters.title,
              set: (o, v) => (o.filters.title = v),
              task: this._task,
              type: "text",
              initial,
              defaultValue: undefined,
              resettable: false,
            })}
          </th>

          <th scope="col">
            ${pwInputText<"/api/v1/projects", string | undefined>({
              enabled: true,
              url: this.url,
              label: null,
              name: ["filters", "info"],
              get: (o) => o.filters.info,
              set: (o, v) => (o.filters.info = v),
              task: this._task,
              type: "text",
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
    return html`<tbody>
      ${this._task.render({
        pending: () => {
          return noChange;
        },
        complete: (result) => {
          return result.success
            ? result.data.entities.map(
                (value) => html`<tr>
                  <td>
                    ${pwProjectUserCheckbox({
                      type: "radio",
                      projectId: value.id,
                      user: this.user,
                      name: this.name,
                    })}
                  </td>
                  <th scope="row">
                    <p>
                      ${value.deleted
                        ? html`<del
                            ><a
                              @click=${aClick}
                              href="/projects/view/${value.id}"
                              >${value.id}</a
                            ></del
                          >`
                        : html`<a
                            @click=${aClick}
                            href="/projects/view/${value.id}"
                            >${value.id}</a
                          >`}
                    </p>
                  </th>
                  <td>
                    <p>
                      ${value.deleted
                        ? html`<del
                            ><a
                              @click=${aClick}
                              href="/projects/view/${value.id}"
                              >${value.title}</a
                            ></del
                          >`
                        : html`<a
                            @click=${aClick}
                            href="/projects/view/${value.id}"
                            >${value.title}</a
                          >`}
                    </p>
                  </td>
                  <td>
                    <p>
                      ${value.deleted
                        ? html`<del>${value.info}</del>`
                        : html`${value.info}`}
                    </p>
                  </td>
                </tr>`
              )
            : result.error;
        },
        initial: () => {
          return html`initial state`;
        },
      })}
    </tbody>`;
  }
}

customElements.define("pw-user-projects", PwUserProjects);
