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

const defaultValue: z.infer<
  typeof entityRoutes["/api/v1/sessions"]["request"]
> = {
  sorting: [],
  filters: {},
  paginationDirection: "forwards",
  paginationLimit: 100,
};

export const pwSessionsPreloaded = async (url: URL) => {
  const result = await taskFunction(
    "/api/v1/sessions",
    url,
    "sessions",
    defaultValue
  );
  return pwSessions({
    initial: result,
    prefix: "sessions",
  });
};

// workaround see https://github.com/runem/lit-analyzer/issues/149#issuecomment-1006162839
export function pwSessions<X extends string>(
  props: Pick<PwSessions<X>, "initial" | "prefix">
) {
  const { initial, prefix, ...rest } = props;
  let _ = rest;
  _ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
  return html`<pw-sessions
    .initial=${initial}
    .prefix=${prefix}
  ></pw-sessions>`;
}

export class PwSessions<X extends string> extends PwEntityList<
  "/api/v1/sessions",
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

    this.url = "/api/v1/sessions";

    this.defaultValue = defaultValue;
  }

  override get title() {
    return msg("Sessions");
  }

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
          <th class="table-cell-hover" scope="col">session_id</th>

          <th class="table-cell-hover" scope="col">created_at</th>

          <th class="table-cell-hover" scope="col">updated_at</th>

          <th class="table-cell-hover">${msg("Actions")}</th>
        </tr>

        <tr>
          <th scope="col"></th>

          <th scope="col"></th>

          <th scope="col"></th>

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
                    <p>${value.session_id}</p>
                  </th>
                  <td>
                    <p>${value.created_at}</p>
                  </td>
                  <td>
                    <p>${value.updated_at}</p>
                  </td>
                  <td>
                    <a
                      class="btn btn-secondary"
                      href="/sessions/delete/${value.session_id}"
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
          return html`initial state`;
        },
      })}
    </tbody>`;
  }
}

customElements.define("pw-sessions", PwSessions);
