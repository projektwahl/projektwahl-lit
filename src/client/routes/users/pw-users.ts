// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
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
import type { routes } from "../../../lib/routes.js";
import type { z } from "zod";
import { PwEntityList } from "../../entity-list/pw-entitylist.js";

export const pwUsers = async (url: URL) => {
  let result = await taskFunction([url.searchParams]);
  return html`<pw-users .initial=${result}></pw-users>`;
};

const taskFunction = async ([searchParams]: [URLSearchParams]
) => {
  let response = await fetch(
    new URL(`/api/v1/users?${searchParams}`, window.location.href).toString(),
    {
      //agent: new Agent({rejectUnauthorized: false})
    }
  );
  return await response.json();
};

class PwUsers extends PwEntityList<"/api/v1/users"> {

  constructor() {
    super(taskFunction);
  }

  override get title() {
    return msg("Users");
  }

  override get buttons() {
    return html`
      <a
        @click=${aClick}
        class="btn btn-primary"
        href="/users/create"
        role="button"
        >${msg("Create account")}</a
      >`
  }

  override get response() {
    return html`<form
    ${ref(this.formRef)}
    @input=${() => {
      const urlSearchParams = new URLSearchParams( // @ts-expect-error probably wrong typings
        new FormData(this.formRef.value)
      );
      urlSearchParams.delete("order");
      this.history.url.searchParams
        .getAll("order")
        .forEach((v) => urlSearchParams.append("order", v));
      HistoryController.goto(
        new URL(`?${urlSearchParams}`, window.location.href), {}
      );
    }}
    @submit=${(e: Event) => e.preventDefault()}
  >
    <table class="table">
      <thead>
        <tr>
          <!--
            do not support this without javascript because there is literally zero useful ways to do this useful.
            the only nice way is probably submit buttons that do things like "oder_by_id_asc" and then redirect to the new state (because you need to remove the old state)
          -->
          <th class="table-cell-hover p-0" scope="col">
            <pw-order name="id" title=${msg("ID")}></pw-order>
          </th>

          <th class="table-cell-hover p-0" scope="col">
            <pw-order name="username" title=${msg("Name")}></pw-order>
          </th>

          <th class="table-cell-hover p-0" scope="col">
            <pw-order name="type" title=${msg("Type")}></pw-order>
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

          <th scope="col">
            
          </th>
        </tr>
      </thead>

      <!-- TODO FIXME add loading indicator overlay -->

      <tbody>
        ${this._apiTask.render({
          pending: () => {
            return noChange;
          },
          complete: (result) => {
            return result.entities.map(
              (value) => html`<tr>
                <th scope="row">
                  <p>${value.id}</p>
                </th>
                <td>
                  <p>${value.username}</p>
                </td>
                <td>
                  <p>${value.type}</p>
                </td>
                <td>
                  <a
                    class="btn btn-secondary"
                    href="/users/edit/{entity.id}"
                    role="button"
                  >
                    <i class="bi bi-pen"></i>
                  </a>

                  <button class="btn btn-secondary" type="button">
                    <i class="bi bi-box-arrow-in-right"></i>
                  </button>
                </td>
              </tr>`
            );
          },
          error: () => {
            return html`error`;
          },
          initial: () => {
            return html`hi`;
          },
        })}
      </tbody>
    </table>
  </form>`
  }
};

customElements.define("pw-users", PwUsers);
