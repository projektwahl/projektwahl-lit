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
import { routes, ResponseType, MinimalSafeParseError } from "../../../lib/routes.js";
import type { z } from "zod";
import { pwInput } from "../../form/pw-input.js";
import { result } from "../../../lib/result.js";
import { bootstrapCss } from "../../index.js";
import { ref } from "lit/directives/ref.js";

export async function pwUser(id: number, viewOnly = false) {
  const result = await taskFunction([id]);
  // TODO FIXME the types aren't checked correctly here - maybe they are with lit-analyzer
  return html`<pw-user-create
    ?disabled=${viewOnly}
    .initial=${result}
  ></pw-user-create>`;
}

const initialResult = result(
  routes["/api/v1/users"]["response"]["shape"]["entities"]["element"]
);

const taskFunction = async ([id]: [number]) => {
  const response = await myFetch<"/api/v1/users">(
    `/api/v1/users/?${JSON.stringify({
      filters: {
        id
      },
      paginationCursor: null,
      sorting: []
    })}`,
    {}
  );
  if (response.success) {
    return {
      success: true,
      data: response.data.entities[0],
    };
  }
  return response;
};

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

  initial: z.SafeParseSuccess<z.infer<typeof routes["/api/v1/users"]["response"]>["entities"][number]>
  | MinimalSafeParseError<z.infer<typeof routes["/api/v1/users"]["request"]>> | undefined;

  constructor() {
    super();

    this._task = new Task(this, async () => {
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
      formDataEvent.detail.id = this.initial?.success
        ? this.initial.data.id
        : undefined;
      if (this.initial?.success && !this.initial.data.id) {
        formDataEvent.detail.project_leader_id = null;
        formDataEvent.detail.force_in_project_id = null;
      }

      const result = await myFetch<"/api/v1/users/create-or-update">(
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
    });
  }

  override render() {
    if (this.initial === undefined || this.initial.success) {
      if (this.actionText === undefined) {
        throw new Error(msg("component not fully initialized"));
      }

      return html`
        ${bootstrapCss}
        <main class="container">
          <h1 class="text-center">${this.actionText}</h1>

          <div class="row justify-content-center">
            <div class="col-md-7 col-lg-8">
              ${this.getErrors()}

              <form
                ${ref(this.form)}
                method="POST"
                action="/no-javascript"
                @submit=${async (event: Event) => {
                  event.preventDefault();

                  await this._task.run();
                }}
              >
                ${pwInput<"/api/v1/users/create-or-update", ["username"]>({
                  type: "text",
                  disabled: this.disabled,
                  label: msg("Username"),
                  name: ["username"],
                  task: this._task,
                  initial: this.initial?.data,
                })}
                ${pwInput<"/api/v1/users/create-or-update", ["type"]>({
                  type: "select",
                  disabled: this.disabled,
                  onchange: (event: Event) =>
                    (this.type = (event.target as HTMLSelectElement).value as
                      | "helper"
                      | "admin"
                      | "voter"),
                  label: msg("User type"),
                  name: ["type"],
                  options: [
                    { value: "voter", text: "Schüler" },
                    { value: "helper", text: "Helfer" },
                    { value: "admin", text: "Admin" },
                  ],
                  task: this._task,
                  initial: {
                    type: this.type ?? this.initial?.data.type ?? "voter",
                  },
                })}
                ${(this.type ?? this.initial?.data.type ?? "voter") === "voter"
                  ? html`${pwInput<"/api/v1/users/create-or-update", ["group"]>(
                      {
                        type: "text",
                        disabled: this.disabled,
                        label: msg("Group"),
                        name: ["group"],
                        task: this._task,
                        initial: this.initial?.data,
                      }
                    )}
                    ${pwInput<"/api/v1/users/create-or-update", ["age"]>({
                      type: "number",
                      disabled: this.disabled,
                      label: msg("Age"),
                      name: ["age"],
                      task: this._task,
                      initial: this.initial?.data,
                    })}`
                  : undefined}
                ${!this.disabled
                  ? html`
                      ${pwInput<"/api/v1/users/create-or-update", ["password"]>(
                        {
                          type: "password",
                          disabled: this.disabled,
                          label: msg("Password"),
                          name: ["password"],
                          task: this._task,
                          autocomplete: "new-password",
                          initial: this.initial?.data,
                        }
                      )}
                    `
                  : undefined}
                ${pwInput<"/api/v1/users/create-or-update", ["away"]>({
                  type: "checkbox",
                  disabled: this.disabled,
                  label: msg("Away"),
                  name: ["away"],
                  task: this._task,
                  initial: this.initial?.data,
                })}
                ${pwInput<"/api/v1/users/create-or-update", ["deleted"]>({
                  type: "checkbox",
                  disabled: this.disabled,
                  label: msg("Mark this user as deleted"),
                  name: ["deleted"],
                  task: this._task,
                  initial: this.initial?.data,
                })}
                ${!this.disabled
                  ? html`
                      <button
                        type="submit"
                        ?disabled=${this._task.render({
                          pending: () => true,
                          complete: () => false,
                          initial: () => false,
                        }) as boolean}
                        class="btn btn-primary"
                      >
                        ${this.actionText}
                      </button>
                    `
                  : undefined}
              </form>
            </div>
          </div>
        </main>
      `;
    } else {
      /*const errors = Object.entries(data.error)
          .filter(([k]) => !this.getCurrentInputElements().includes(k))
          .map(([k, v]) => html`${k}: ${v}<br />`);*/
          if (this.initial.error.issues.length > 0) {
            return html`${bootstrapCss}
            <main class="container">
              <h1 class="text-center">${this.actionText}</h1>
              
              <div class="alert alert-danger" role="alert">
              ${msg("Some errors occurred!")}<br />
              ${this.initial.error.issues.map(
                (issue) => html` ${issue.path}: ${issue.message}<br /> `
              )}
            </div>
            
            </div>
          </main>`;
          }
    }
  }
}

customElements.define("pw-user-create", PwUserCreate);
