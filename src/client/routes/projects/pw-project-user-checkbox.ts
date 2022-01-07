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

class PwProjectUserCheckbox extends LitElement {
  static override get properties() {
    return {
      _task: { state: true },
      disabled: { state: true },
      user: { attribute: false },
      projectId: { type: Number },
      name: { type: String },
    };
  }

  name!: "project_leader_id" | "force_in_project_id";

  _task;

  user!: z.infer<
    typeof routes["/api/v1/users"]["response"]["options"][0]
  >["data"]["entities"][number];

  projectId!: number;

  disabled: boolean;

  form: import("lit/directives/ref").Ref<HTMLFormElement>;

  constructor() {
    super();

    this.disabled = false;

    this.form = createRef();

    this._task = new Task(this, async () => {
      let result = await myFetch<"/api/v1/users/create-or-update">(
        "/api/v1/users/create-or-update",
        {
          method: "POST",
          headers: {
            "content-type": "text/json",
          },
          body: JSON.stringify({
            id: this.user.id,
            [this.name]:
              this.user[this.name] === this.projectId ? null : this.projectId,
          }),
        }
      );

      HistoryController.goto(new URL(window.location.href), {});

      return result;
    });
  }

  render() {
    return html` ${bootstrapCss}
      <form ${ref(this.form)}>
        ${this._task.render({
          complete: (data) => {
            if (!data.success) {
              const errors = Object.entries(data.error).map(
                ([k, v]) => html`${k}: ${v}<br />`
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

        <input
          @change=${(e: Event) => {
            this._task.run();
          }}
          type="checkbox"
          ?disabled=${this._task.status === TaskStatus.PENDING}
          .checked=${live(this.user[this.name] === this.projectId)}
          class="form-check-input"
        />
      </form>`;
  }
}

customElements.define("pw-project-user-checkbox", PwProjectUserCheckbox);
