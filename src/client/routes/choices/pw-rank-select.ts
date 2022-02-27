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
import { html, LitElement } from "lit";
import { HistoryController } from "../../history-controller.js";
import { myFetch } from "../../utils.js";
import { createRef, ref } from "lit/directives/ref.js";
import { msg } from "@lit/localize";
import { bootstrapCss } from "../../index.js";
import type { routes } from "../../../lib/routes.js";
import type { z } from "zod";
import { live } from "lit/directives/live.js";

class PwRankSelect extends LitElement {
  static override get properties() {
    return {
      _task: { state: true },
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

  input: import("lit/directives/ref").Ref<HTMLElement>;

  constructor() {
    super();

    this.form = createRef();

    this.input = createRef();

    this._task = new Task(this, async () => {
      const result = await myFetch<"/api/v1/choices/update">(
        "/api/v1/choices/update",
        {
          method: "POST",
          headers: {
            "content-type": "text/json",
          },
          body: JSON.stringify({
            id: this.choice.id,
          }),
        }
      );

      this.input.value?.dispatchEvent(
        new CustomEvent("refreshentitylist", {
          bubbles: true,
          composed: true,
        })
      );

      return result;
    });
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
              await this._task.run();
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
              await this._task.run();
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
              await this._task.run();
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
              await this._task.run();
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
              await this._task.run();
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
              await this._task.run();
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
