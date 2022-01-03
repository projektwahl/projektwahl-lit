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
import { html, LitElement } from "lit";
import { bootstrapCss } from "../../index.js";
import { HistoryController } from "../../history-controller.js";
import { setupHmr } from "../../hmr.js";
import { Task, TaskStatus } from "@lit-labs/task";
import { css } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import { noChange } from "lit";
import { aClick } from "../../pw-a.js";
import { msg } from "@lit/localize";
import "./pw-projects.js";
import type { routes } from "../../../lib/routes.js";
import type { z } from "zod";
import { PwEntityList } from "../../entity-list/pw-entitylist.js";

export const pwProjects = async (url: URL) => {
  let result = await taskFunction([url.searchParams]);
  return html`<pw-projects .initial=${result}></pw-projects>`;
};

const taskFunction = async ([searchParams]: [URLSearchParams]) => {
  let response = await fetch(
    new URL(
      `/api/v1/projects?${searchParams}`,
      window.location.href
    ).toString(),
    {
      //agent: new Agent({rejectUnauthorized: false})
    }
  );
  return await response.json();
};

class PwProjects<T> extends PwEntityList<"/api/v1/projects"> {
  constructor() {
    super(taskFunction);
  }

  override get title() {
    return msg("Projects");
  }

  override get buttons() {
    return html` <a
      @click=${aClick}
      class="btn btn-primary"
      href="/projects/create"
      role="button"
      >${msg("Create project")}</a
    >`;
  }

  override get head() {
    return html`
      <tr>
        <!--
                      do not support this without javascript because there is literally zero useful ways to do this useful.
                      the only nice way is probably submit buttons that do things like "oder_by_id_asc" and then redirect to the new state (because you need to remove the old state)
                    -->
        <th class="table-cell-hover p-0" scope="col">
          <pw-order name="id" title=${msg("ID")}></pw-order>
        </th>

        <th class="table-cell-hover p-0" scope="col">
          <pw-order name="title" title=${msg("Title")}></pw-order>
        </th>

        <th class="table-cell-hover p-0" scope="col">
          <pw-order name="info" title=${msg("Info")}></pw-order>
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
            value=${this.history.url.searchParams.get("f_id")}
          />
        </th>

        <th scope="col">
          <input
            name="f_title"
            type="text"
            class="form-control"
            id="projects-filter-{name}"
            value=${this.history.url.searchParams.get("f_title")}
          />
        </th>

        <th scope="col">
          <input
            name="f_info"
            type="text"
            class="form-control"
            id="projects-filter-{name}"
            value=${this.history.url.searchParams.get("f_info")}
          />
        </th>

        <th scope="col"></th>
      </tr>
    `;
  }
  override get body() {
    return html`
      ${this._apiTask.render({
        pending: () => {
          return noChange;
        },
        complete: (result) => {
          return result.success
            ? result.data.entities.map(
                (value) => html`<tr>
                  <th scope="row">
                    <p>
                      <a @click=${aClick} href="/projects/view/${value.id}"
                        >${value.id}</a
                      >
                    </p>
                  </th>
                  <td>
                    <p>
                      <a @click=${aClick} href="/projects/view/${value.id}"
                        >${value.title}</a
                      >
                    </p>
                  </td>
                  <td>
                    <p>${value.info}</p>
                  </td>
                  <td>
                    <a
                      class="btn btn-secondary"
                      @click=${aClick}
                      href="/projects/edit/${value.id}"
                      role="button"
                    >
                      <i class="bi bi-pen"></i>
                    </a>

                    <button class="btn btn-secondary" type="button">
                      <i class="bi bi-box-arrow-in-right"></i>
                    </button>
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
      })}
    `;
  }
}

customElements.define("pw-projects", PwProjects);
