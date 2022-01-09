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
import { html } from "lit";
import "../../form/pw-form.js";
import { Task } from "@lit-labs/task";
import { myFetch } from "../../utils.js";
import { PwForm } from "../../form/pw-form.js";
import { HistoryController } from "../../history-controller.js";
import { msg } from "@lit/localize";
import type { z } from "zod";
import type { routes } from "../../../lib/routes.js";
import { setupHmr } from "../../hmr.js";
import { pwInput } from "../../form/pw-input.js";

export async function pwProject(id: number, viewOnly = false) {
  const result = await taskFunction([id]);
  return html`<pw-project-create
    ?disabled=${viewOnly}
    .initial=${result}
  ></pw-project-create>`;
}

const taskFunction = async ([id]: [number]) => {
  const [_, response] = await Promise.all([
    import("../projects/pw-project-users.js"),
    await myFetch<"/api/v1/projects">(`/api/v1/projects/?f_id=${id}`, {}),
  ]);
  // TODO FIXME really fix this here
  return response.success ? response.data.entities[0] : null; // TODO FIXME error handling, PwForm already has some form of error handling
};

export const PwProjectCreate = setupHmr(
  "PwProjectCreate",
  class PwProjectCreate extends PwForm<"/api/v1/projects/create-or-update"> {
    static override get properties() {
      return {
        ...super.properties,
        url: { attribute: false },
        actionText: { type: String },
        _task: { state: true },
        _initialTask: { state: true },
        type: { state: true },
        initial: { attribute: false },
        initialRender: { state: true },
      };
    }

    override get actionText() {
      return this.disabled
        ? msg("View project")
        : this.initial
        ? msg("Update project")
        : msg("Create project");
    }

    initialRender: boolean;

    initial:
      | z.infer<typeof routes["/api/v1/projects/create-or-update"]["request"]>
      | undefined;

    constructor() {
      super();

      this.initialRender = false;

      /**
       * @override
       */
      this._task = new Task(this, async () => {
        const formDataEvent = new CustomEvent<
          z.infer<typeof routes["/api/v1/projects/create-or-update"]["request"]>
        >("myformdata", {
          bubbles: true,
          composed: true,
          detail: {
            id: -1,
          },
        });
        this.form.value?.dispatchEvent(formDataEvent);
        formDataEvent.detail.id = this.initial?.id ?? null;

        const result = await myFetch<"/api/v1/projects/create-or-update">(
          "/api/v1/projects/create-or-update",
          {
            method: "POST",
            headers: {
              "content-type": "text/json",
            },
            body: JSON.stringify(formDataEvent.detail),
          }
        );

        if (result.success) {
          HistoryController.goto(new URL("/", window.location.href), {});
        }

        return result;
      });
    }

    override getInputs() {
      return html`
        ${pwInput({
          type: "text",
          disabled: this.disabled,
          label: msg("Title"),
          name: "title",
          task: this._task,
          initial: this.initial,
        })}
        ${pwInput({
          type: "text",
          disabled: this.disabled,
          label: msg("Info"),
          name: "info",
          task: this._task,
          initial: this.initial,
        })}
        ${pwInput({
          type: "text",
          disabled: this.disabled,
          label: msg("Place"),
          name: "place",
          task: this._task,
          initial: this.initial,
        })}
        ${pwInput({
          type: "number",
          disabled: this.disabled,
          label: msg("Costs"),
          name: "costs",
          task: this._task,
          initial: this.initial,
        })}
        ${pwInput({
          type: "number",
          disabled: this.disabled,
          label: msg("Minimum age"),
          name: "min_age",
          task: this._task,
          initial: this.initial,
        })}
        ${pwInput({
          type: "number",
          disabled: this.disabled,
          label: msg("Maximum age"),
          name: "max_age",
          task: this._task,
          initial: this.initial,
        })}
        ${pwInput({
          type: "number",
          disabled: this.disabled,
          label: msg("Minimum participants"),
          name: "min_participants",
          task: this._task,
          initial: this.initial,
        })}
        ${pwInput({
          type: "number",
          disabled: this.disabled,
          label: msg("Maximum participants"),
          name: "max_participants",
          task: this._task,
          initial: this.initial,
        })}
        ${pwInput({
          type: "checkbox",
          disabled: this.disabled,
          label: msg("Allow random assignments"),
          name: "random_assignments",
          task: this._task,
          initial: this.initial,
        })}
        ${pwInput({
          type: "checkbox",
          disabled: this.disabled,
          label: msg("Mark this project as deleted"),
          name: "deleted",
          task: this._task,
          initial: this.initial,
        })}

        <!-- Projektleitende -->
        <!-- TODO FIXME view only -->
        ${this.initial
          ? html`<pw-project-users
              projectId=${this.initial.id!}
              name=${"project_leader_id"}
              title=${msg("Project leaders")}
            ></pw-project-users>`
          : html``}
        ${this.initial
          ? html`<pw-project-users
              projectId=${this.initial.id!}
              name=${"force_in_project_id"}
              title=${msg("Guaranteed project members")}
            ></pw-project-users>`
          : html``}
      `;
    }
  }
);

customElements.define("pw-project-create", PwProjectCreate);
