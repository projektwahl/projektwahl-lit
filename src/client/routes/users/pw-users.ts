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
import {
  parseRequestWithPrefix,
  PwEntityList,
} from "../../entity-list/pw-entitylist.js";
import { pwOrder } from "../../entity-list/pw-order.js";
import { taskFunction } from "../../entity-list/pw-entitylist.js";
import { pwInputNumber } from "../../form/pw-input-number.js";
import { pwInputText } from "../../form/pw-input-text.js";
import { pwInputSelect } from "../../form/pw-input-select.js";
import type { z } from "zod";
import type { entityRoutes, routes } from "../../../lib/routes.js";
import { pwInputCheckbox } from "../../form/pw-input-checkbox.js";
import { myFetch } from "../../utils.js";
import { HistoryController } from "../../history-controller.js";
import { LoggedInUserController } from "../../user-controller.js";

const defaultValue: z.infer<typeof entityRoutes["/api/v1/users"]["request"]> = {
  sorting: [],
  filters: {
    deleted: false,
  },
  paginationDirection: "forwards",
  paginationLimit: 100,
};

export const pwUsersPreloaded = async (url: URL) => {
  const result = await taskFunction(
    "/api/v1/users",
    url,
    "users",
    defaultValue
  );
  return pwUsers({
    initial: result,
    prefix: "users",
  });
};

// workaround see https://github.com/runem/lit-analyzer/issues/149#issuecomment-1006162839
export function pwUsers<X extends string>(
  props: Pick<PwUsers<X>, "initial" | "prefix">
) {
  const { initial, prefix, ...rest } = props;
  let _ = rest;
  _ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
  return html`<pw-users .initial=${initial} .prefix=${prefix}></pw-users>`;
}

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

  userController: LoggedInUserController;

  constructor() {
    super();

    this.url = "/api/v1/users";

    this.defaultValue = defaultValue;

    this.userController = new LoggedInUserController(this);
  }

  override get title() {
    return msg("Users");
  }

  override get buttons() {
    return html`<div class="row justify-content-start">
      <div class="col-auto">
        <a
          @click=${aClick}
          class="btn btn-primary mr-1 mb-1"
          href="/users/create"
          role="button"
          >${msg("Create account")}</a
        >
        <a
          @click=${aClick}
          class="btn btn-primary mr-1 mb-1"
          href="/users/${`import`}"
          role="button"
          >${msg("Import accounts")}</a
        >
      </div>
    </div>`;
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

          <th class="table-cell-hover">${msg("Show deleted")}</th>

          <th class="table-cell-hover">${msg("Actions")}</th>
        </tr>

        <tr>
          <th scope="col">
            ${pwInputNumber<"/api/v1/users", false, number | undefined>({
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
            ${pwInputText<"/api/v1/users", false, string | undefined>({
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
              false,
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

          ${pwInputCheckbox<"/api/v1/users", false>({
            url: this.url,
            label: null,
            name: ["filters", "deleted"],
            get: (o) => o.filters.deleted,
            set: (o, v) => (o.filters.deleted = v ? undefined : false),
            task: this._task,
            type: "checkbox",
            defaultValue: undefined,
            initial: initial,
            resettable: false,
          })}

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
                        ? html`<del
                            >${value.type === "admin"
                              ? msg("Admin")
                              : value.type === "helper"
                              ? msg("Lehrer")
                              : msg("Schüler")}</del
                          >`
                        : html`${value.type === "admin"
                            ? msg("Admin")
                            : value.type === "helper"
                            ? msg("Lehrer")
                            : msg("Schüler")}`}
                    </p>
                  </td>
                  <td>
                    <p>${value.deleted ? msg("deleted") : ""}</p>
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
                    ${this.userController.type === "admin"
                      ? html` <a
                          class="btn btn-secondary"
                          role="button"
                          @click=${async () => {
                            const result = await myFetch<"/api/v1/sudo">(
                              "POST",
                              "/api/v1/sudo",
                              {
                                id: value.id,
                              },
                              {}
                            );

                            if (result.success) {
                              if ("BroadcastChannel" in window) {
                                const bc = new BroadcastChannel(
                                  "updateloginstate"
                                );
                                bc.postMessage("login");
                                bc.close();
                              }

                              HistoryController.goto(
                                new URL("/", window.location.href),
                                {},
                                true
                              );
                            } else {
                              // TODO FIXME do this cleaner
                              console.log(result.error);
                              throw new Error(String(result.error));
                            }
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-box-arrow-in-right"
                            viewBox="0 0 16 16"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0v-2z"
                            />
                            <path
                              fill-rule="evenodd"
                              d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"
                            />
                          </svg>
                        </a>`
                      : undefined}
                  </td>
                </tr>`
              )
            : undefined;
        },
        initial: () => {
          return html`initial state`;
        },
      })}
    </tbody>`;
  }
}

customElements.define("pw-users", PwUsers);
