// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import "../../form/pw-form.js";
import "../../entity-list/pw-order.js";
import { html } from "lit";
import { noChange } from "lit";
import { msg } from "@lit/localize";
import { PwUsers, taskFunction } from "../users/pw-users.js";
import "./pw-project-user-checkbox.js";
import "../../form/pw-checkbox-input.js";
import { setupHmr } from "../../hmr.js";

export const pwProjectUsers = async (url: URL) => {
  let result = await taskFunction([url.searchParams]);
  return html`<pw-project-users .initial=${result}></pw-project-users>`;
};

export const PwProjectUsers = setupHmr(
  import.meta.url,
  "PwProjectUsers",
  class PwProjectUsers extends PwUsers {
    static override get properties() {
      return {
        ...super.properties,
        projectId: { type: Number },
        name: { type: String },
        title: { type: String },
      };
    }

    name!: string; // f_project_leader

    projectId!: number;

    title!: string;

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
          return result.entities.map(
            (value) => html`<tr>
              <td>
                <pw-project-user-checkbox
                  projectId=${this.projectId}
                  .user=${value}
                  name=${this.name}
                ></pw-project-user-checkbox>
              </td>
              <th scope="row">
                <p>${value.id}</p>
              </th>
              <td>
                <p>${value.username}</p>
              </td>
              <td>
                <p>${value.type}</p>
              </td>
            </tr>`
          );
        },
        initial: () => {
          return html`hi`;
        },
      })}`;
    }
  }
);

customElements.define("pw-project-users", PwProjectUsers);
