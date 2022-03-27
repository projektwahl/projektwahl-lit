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
import "../../form/pw-input.js";
import { Task, TaskStatus } from "@lit-labs/task";
import { html } from "lit";
import { myFetch } from "../../utils.js";
import { createRef, ref } from "lit/directives/ref.js";
import { msg } from "@lit/localize";
import { bootstrapCss } from "../../index.js";
import type { routes, ResponseType } from "../../../lib/routes.js";
import type { z } from "zod";
import { PwElement } from "../../pw-element.js";

class PwRankSelect extends PwElement {
  static override get properties() {
    return {
      _task: {
        state: true,
        hasChanged: () => {
          return true;
        },
      },
      disabled: { state: true },
      choice: { attribute: false },
      url: { type: String },
    };
  }

  _task;

  choice!: z.infer<
    typeof routes["/api/v1/choices"]["response"]
  >["entities"][number];

  form: import("lit/directives/ref").Ref<HTMLFormElement>;

  constructor() {
    super();

    this.form = createRef();

    this._task = new Task<[number], ResponseType<"/api/v1/choices/update">>(
      this,
      async (args: [number]) => {
        const result = await myFetch<"/api/v1/choices/update">(
          "POST",
          "/api/v1/choices/update",
          {
            project_id: this.choice.id, // project id
            rank: args[0] === 0 ? null : args[0],
          },
          {}
        );

        this.form.value?.dispatchEvent(
          new CustomEvent("refreshentitylist", {
            bubbles: true,
            composed: true,
          })
        );

        return result;
      }
    );
  }

  render() {
    return html` ${bootstrapCss}
      <form ${ref(this.form)}>
        ${this._task.render({
          complete: (data) => {
            if (!data.success) {
              const errors = data.error.issues.map(
                (i) => html`${i.path}: ${i.message}<br />`
              );
              if (errors.length > 0) {
                return html`<div class="alert alert-danger" role="alert">
                  ${msg("Some errors occurred!")}<br />
                  ${errors}
                </div>`;
              }
            }
            return html``;
          },
        })}

        <div class="btn-group" role="group" aria-label="Basic example">
          <!--TODO FIXME foreach?-->
          <button
            @click=${async () => {
              await this._task.run([1]);
            }}
            ?disabled=${this._task.status === TaskStatus.PENDING}
            type="button"
            class="btn ${this._task.status === TaskStatus.PENDING
              ? "btn-secondary"
              : this.choice.rank == 1
              ? "btn-primary"
              : "btn-outline-primary"}"
          >
            1
          </button>
          <button
            @click=${async () => {
              await this._task.run([2]);
            }}
            ?disabled=${this._task.status === TaskStatus.PENDING}
            type="button"
            class="btn ${this._task.status === TaskStatus.PENDING
              ? "btn-secondary"
              : this.choice.rank == 2
              ? "btn-primary"
              : "btn-outline-primary"}"
          >
            2
          </button>
          <button
            @click=${async () => {
              await this._task.run([3]);
            }}
            ?disabled=${this._task.status === TaskStatus.PENDING}
            type="button"
            class="btn ${this._task.status === TaskStatus.PENDING
              ? "btn-secondary"
              : this.choice.rank == 3
              ? "btn-primary"
              : "btn-outline-primary"}"
          >
            3
          </button>
          <button
            @click=${async () => {
              await this._task.run([4]);
            }}
            ?disabled=${this._task.status === TaskStatus.PENDING}
            type="button"
            class="btn ${this._task.status === TaskStatus.PENDING
              ? "btn-secondary"
              : this.choice.rank == 4
              ? "btn-primary"
              : "btn-outline-primary"}"
          >
            4
          </button>
          <button
            @click=${async () => {
              await this._task.run([5]);
            }}
            ?disabled=${this._task.status === TaskStatus.PENDING}
            type="button"
            class="btn ${this._task.status === TaskStatus.PENDING
              ? "btn-secondary"
              : this.choice.rank == 5
              ? "btn-primary"
              : "btn-outline-primary"}"
          >
            5
          </button>
          <button
            @click=${async () => {
              await this._task.run([0]);
            }}
            ?disabled=${this._task.status === TaskStatus.PENDING}
            type="button"
            class="btn ${this._task.status === TaskStatus.PENDING
              ? "btn-secondary"
              : this.choice.rank == null
              ? "btn-primary"
              : "btn-outline-primary"}"
          >
            X
          </button>
        </div>
      </form>`;
  }
}

customElements.define("pw-rank-select", PwRankSelect);
