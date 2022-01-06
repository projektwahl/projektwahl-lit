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
import "../../form/pw-input.js";
import type {
  routes,
} from "../../../lib/routes.js";
import type { z } from "zod";
import { pwInput } from "../../form/pw-input.js";

export async function pwUser(id: number, viewOnly: boolean = false) {
  let result = await taskFunction([id]);
  return html`<pw-user-create
    ?disabled=${viewOnly}
    .initial=${result}
  ></pw-user-create>`;
}

const taskFunction = async ([id]: [number]) => {
  let response = await myFetch<"/api/v1/users">(`/api/v1/users/?f_id=${id}`, {
    //agent: new Agent({rejectUnauthorized: false})
  });
  return response.success ? response.data.entities[0] : null; // TODO FIXME error handling, PwForm already has some form of error handling
};

// maybe extending actually breaks shit
class PwUserCreate extends PwForm<"/api/v1/users/create-or-update"> {
  static get properties() {
    return {
      ...super.properties,
      url: { attribute: false },
      actionText: { type: String },
      _task: { state: true },
      type: { state: true },
      initial: { attribute: false },
    };
  }

  override get actionText() {
    return this.disabled
      ? msg("View account")
      : this.initial
      ? msg("Update account")
      : msg("Create account");
  }

  type?: "voter" | "admin" | "helper";

  initial:
    | z.infer<
        typeof routes["/api/v1/users"]["response"]["options"]["0"]["shape"]["data"]
      >["entities"][number]
    | undefined;

  constructor() {
    super();

    /**
     * @override
     */
    this._task = new Task(
      this,
      async () => {
        const formDataEvent = new CustomEvent<
          z.infer<typeof routes["/api/v1/users/create-or-update"]["request"]>
        >("myformdata", {
          bubbles: true,
          composed: true,
          detail: {
            id: -1,
          },
        });
        this.form.value?.dispatchEvent(formDataEvent);
        formDataEvent.detail.id = this.initial?.id ?? null;
        if (!this.initial?.id) {
          formDataEvent.detail.project_leader_id = null;
          formDataEvent.detail.force_in_project_id = null;
        }

        let result = await myFetch<"/api/v1/users/create-or-update">(
          "/api/v1/users/create-or-update",
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
      }
    );
  }

  override getInputs() {
    return html`
      ${pwInput({
        type:"text",
        disabled:this.disabled,
        label:msg("Username"),
        name:"username",
        task:this._task,
        initial:this.initial
      })}

      ${pwInput({
        type: "select",
        disabled: this.disabled,
        onchange: (event: Event) =>
          (this.type = (event.target as HTMLSelectElement).value as
            | "helper"
            | "admin"
            | "voter"),
        label: msg("User type"),
        name: "type",
        options: [
          { value: "voter", text: "Schüler" },
          { value: "helper", text: "Helfer" },
          { value: "admin", text: "Admin" },
        ],
        task: this._task,
        initial: { type: this.type ?? this.initial?.type ?? "voter" },
      })}

      ${(this.type ?? this.initial?.type ?? "voter") === "voter"
        ? html`${pwInput({
              type:"text",
              disabled:this.disabled,
              label:msg("Group"),
              name:"group",
              task:this._task,
              initial:this.initial,
            })}

            ${pwInput({
              type:"number",
              disabled:this.disabled,
              label:msg("Age"),
              name:"age",
              task:this._task,
              initial:this.initial
            })}`
        : undefined}
      ${!this.disabled
        ? html`
            ${pwInput({
              type:"password",
              disabled:this.disabled,
              label:msg("Password"),
              name:"password",
              task:this._task,
              initial:this.initial,
            })}
          `
        : undefined}

      ${pwInput({
        type:"checkbox",
        disabled:this.disabled,
        label:msg("Away"),
        name:"away",
        task:this._task,
        initial:this.initial,
      })}

      ${pwInput({
        type:"checkbox",
        disabled:this.disabled,
        label:msg("Mark this user as deleted"),
        name:"deleted",
        task:this._task,
        initial:this.initial
      })}
    `;
  }
}

customElements.define("pw-user-create", PwUserCreate);
