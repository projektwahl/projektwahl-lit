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
import type { routes } from "../../../lib/routes.js";
import type { z } from "zod";
import { live } from "lit/directives/live.js";
import { PwElement } from "../../pw-element.js";

class PwUserProjectCheckbox extends PwElement {
  static override get properties() {
    return {
      _task: {
        state: true,
        hasChanged: () => {
          return true;
        },
      },
      disabled: { state: true },
      project: { attribute: false },
      userId: { type: Number },
      url: { type: String },
      name: { type: String },
    };
  }

  name!: "project_leader_id" | "force_in_project_id";

  _task;

  project!: z.infer<
    typeof routes["/api/v1/projects"]["response"]
  >["entities"][number];

  userId!: number;

  disabled: boolean;

  form: import("lit/directives/ref").Ref<HTMLFormElement>;

  input: import("lit/directives/ref").Ref<HTMLElement>;

  constructor() {
    super();

    this.disabled = false;

    this.form = createRef();

    this.input = createRef();

    this._task = new Task(this, async () => {
      const result = await myFetch<"/api/v1/users/update">(
        "POST",
        "/api/v1/users/update",
          {
            id: this.project.id,
            [this.name]:
              this.project[this.name] === this.userId ? null : this.userId,
          },
        {}
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

        <input
          ${ref(this.input)}
          @change=${async () => {
            await this._task.run();
          }}
          type="checkbox"
          ?disabled=${this._task.status === TaskStatus.PENDING}
          .checked=${live(this.project[this.name] === this.userId)}
          class="form-check-input"
        />
      </form>`;
  }
}

customElements.define("pw-user-project-checkbox", PwUserProjectCheckbox);
