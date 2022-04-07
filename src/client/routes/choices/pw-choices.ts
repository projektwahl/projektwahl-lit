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
import "./pw-rank-select.js";
import "../../form/pw-form.js";
import { html } from "lit";
import { noChange } from "lit";
import { aClick } from "../../pw-a.js";
import { msg } from "@lit/localize";
import {
  parseRequestWithPrefix,
  PwEntityList,
  taskFunction,
} from "../../entity-list/pw-entitylist.js";
import { pwOrder } from "../../entity-list/pw-order.js";
import { animate } from "@lit-labs/motion";
import { repeat } from "lit/directives/repeat.js";
import { pwInputNumber } from "../../form/pw-input-number.js";
import { pwInputText } from "../../form/pw-input-text.js";
import type { z } from "zod";
import type { entityRoutes } from "../../../lib/routes.js";
import { pwRankSelect } from "./pw-rank-select.js";

const defaultValue: z.infer<typeof entityRoutes["/api/v1/choices"]["request"]> =
  {
    sorting: [["rank", "ASC", null]],
    filters: {},
    paginationDirection: "forwards",
    paginationLimit: 100,
  };

export const pwChoicesPreloaded = async (url: URL) => {
  const result = await taskFunction(
    "/api/v1/choices",
    url,
    "choices",
    defaultValue
  );
  return pwChoices({
    initial: result,
    prefix: "choices",
  });
};

// workaround see https://github.com/runem/lit-analyzer/issues/149#issuecomment-1006162839
export function pwChoices<X extends string>(
  props: Pick<PwChoices<X>, "initial" | "prefix">
) {
  const { initial, prefix, ...rest } = props;
  let _ = rest;
  _ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
  return html`<pw-choices .initial=${initial} .prefix=${prefix}></pw-choices>`;
}

class PwChoices<X extends string> extends PwEntityList<"/api/v1/choices", X> {
  constructor() {
    super();

    this.url = "/api/v1/choices";

    this.defaultValue = defaultValue;
  }

  override get title() {
    return msg("Choices");
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

      return html`
        <tr>
          <th class="table-cell-hover p-0" scope="col">
            ${pwOrder({
              url: "/api/v1/choices",
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
              url: "/api/v1/choices",
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

          <th class="table-cell-hover" scope="col">Jahrgang</th>

          <th class="table-cell-hover p-0" scope="col">
            ${pwOrder({
              url: "/api/v1/choices",
              name: ["sorting", "rank"],
              orderBy: "rank",
              prefix: this.prefix,
              title: msg("Rank"),
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
            ${pwInputNumber<"/api/v1/choices", number | undefined>({
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
            ${pwInputText<"/api/v1/choices", string | undefined>({
              enabled: true,
              url: this.url,
              label: null,
              name: ["filters", "title"],
              get: (o) => o.filters.title,
              set: (o, v) => (o.filters.title = v),
              task: this._task,
              type: "text",
              initial,
              defaultValue: "",
              resettable: false,
            })}
          </th>

          <th scope="col"></th>

          <th scope="col">
            ${pwInputNumber<"/api/v1/choices", number | undefined | null>({
              enabled: true,
              url: this.url,
              label: null,
              name: ["filters", "rank"],
              get: (o) => o.filters.rank,
              set: (o, v) => (o.filters.rank = v),
              task: this._task,
              type: "number",
              defaultValue: undefined,
              initial,
              resettable: false,
            })}
          </th>
        </tr>
      `;
    } catch (error) {
      console.error(error);
      return html`<div class="alert alert-danger" role="alert">
        Ungültige URL! Bitte melden Sie diesen Fehler.
      </div>`;
    }
  }
  override get body() {
    return html`
      ${this._task.render({
        pending: () => {
          return noChange;
        },
        complete: (result) => {
          return result.success
            ? repeat(
                result.data.entities,
                (value) => value.id,
                (value) => html`<tr ${animate()}>
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
                  <td>${value.min_age} - ${value.max_age}</td>
                  <td>
                    ${pwRankSelect({
                      // TODO FIXME this should error
                      choice: value
                    })}
                  </td>
                </tr>`
              )
            : undefined;
        },
        initial: () => {
          return html`initial state`;
        },
      })}
    `;
  }
}

customElements.define("pw-choices", PwChoices);
