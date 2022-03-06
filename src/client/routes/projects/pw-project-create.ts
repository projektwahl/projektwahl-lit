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
import { Task } from "@dev.mohe/task";
import { myFetch } from "../../utils.js";
import { PwForm } from "../../form/pw-form.js";
import { HistoryController } from "../../history-controller.js";
import { msg } from "@lit/localize";
import type { z } from "zod";
import type { routes, MinimalSafeParseError } from "../../../lib/routes.js";
import { setupHmr } from "../../hmr.js";
import { pwInput } from "../../form/pw-input.js";
import { result } from "../../../lib/result.js";
import { bootstrapCss } from "../../index.js";
import { ref } from "lit/directives/ref.js";

export async function pwProject(id: number, viewOnly = false) {
  const result = await taskFunction([id]);
  // TODO FIXME typecheck
  return html`<pw-project-create
    ?disabled=${viewOnly}
    .initial=${result}
    .url=${"/api/v1/projects/update"}
  ></pw-project-create>`;
}

const taskFunction = async ([id]: [number]) => {
  const [_, response] = await Promise.all([
    import("../projects/pw-project-users.js"),
    await myFetch<"/api/v1/projects">(
      "GET",
      `/api/v1/projects`,
      {
        filters: {
          id,
        },
        paginationCursor: null,
        paginationDirection: "forwards",
        paginationLimit: 100,
        sorting: [],
      },
      {}
    ),
  ]);
  if (response.success) {
    return {
      success: true,
      data: response.data.entities[0],
    };
  }
  return response;
};

export const PwProjectCreate = setupHmr(
  "PwProjectCreate",
  class PwProjectCreate extends PwForm<
    "/api/v1/projects/create" | "/api/v1/projects/update"
  > {
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
      | z.SafeParseSuccess<
          z.infer<
            typeof routes["/api/v1/projects"]["response"]
          >["entities"][number]
        >
      | MinimalSafeParseError
      | undefined;

    url!: "/api/v1/projects/create" | "/api/v1/projects/update";

    constructor() {
      super();

      this.initialRender = false;

      /**
       * @override
       */
      this._task = new Task(this, async () => {
        const formDataEvent = new CustomEvent<
          z.infer<
            typeof routes[
              | "/api/v1/projects/create"
              | "/api/v1/projects/update"]["request"]
          >
        >("myformdata", {
          bubbles: false,
          detail: {
            ...(this.initial?.success
              ? { id: this.initial.data.id }
              : { id: -1 }), // TODO FIXME
          },
        });
        this.form.value?.dispatchEvent(formDataEvent);

        const result = await myFetch<
          "/api/v1/projects/create" | "/api/v1/projects/update"
        >("POST", this.url, formDataEvent.detail, {});

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
                  ${pwInput({
                    url: this.url,
                    type: "text",
                    disabled: this.disabled,
                    label: msg("Title"),
                    name: ["title"],
                    get: (o) => o.title,
                    set: (o, v) => (o.title = v),
                    task: this._task,
                    initial: this.initial?.data,
                  })}
                  ${pwInput({
                    url: this.url,
                    type: "text",
                    disabled: this.disabled,
                    label: msg("Info"),
                    name: ["info"],
                    get: (o) => o.info,
                    set: (o, v) => (o.info = v),
                    task: this._task,
                    initial: this.initial?.data,
                  })}
                  ${pwInput({
                    url: this.url,
                    type: "text",
                    disabled: this.disabled,
                    label: msg("Place"),
                    name: ["place"],
                    get: (o) => o.place,
                    set: (o, v) => (o.place = v),
                    task: this._task,
                    initial: this.initial?.data,
                  })}
                  ${pwInput({
                    url: this.url,
                    type: "number",
                    disabled: this.disabled,
                    label: msg("Costs"),
                    name: ["costs"],
                    get: (o) => o.costs,
                    set: (o, v) => (o.costs = v),
                    task: this._task,
                    initial: this.initial?.data,
                  })}
                  ${pwInput({
                    url: this.url,
                    type: "number",
                    disabled: this.disabled,
                    label: msg("Minimum age"),
                    name: ["min_age"],
                    get: (o) => o.min_age,
                    set: (o, v) => (o.min_age = v),
                    task: this._task,
                    initial: this.initial?.data,
                  })}
                  ${pwInput({
                    url: this.url,
                    type: "number",
                    disabled: this.disabled,
                    label: msg("Maximum age"),
                    name: ["max_age"],
                    get: (o) => o.max_age,
                    set: (o, v) => (o.max_age = v),
                    task: this._task,
                    initial: this.initial?.data,
                  })}
                  ${pwInput({
                    url: this.url,
                    type: "number",
                    disabled: this.disabled,
                    label: msg("Minimum participants"),
                    name: ["min_participants"],
                    get: (o) => o.min_participants,
                    set: (o, v) => (o.min_participants = v),
                    task: this._task,
                    initial: this.initial?.data,
                  })}
                  ${pwInput({
                    url: this.url,
                    type: "number",
                    disabled: this.disabled,
                    label: msg("Maximum participants"),
                    name: ["max_participants"],
                    get: (o) => o.max_participants,
                    set: (o, v) => (o.max_participants = v),
                    task: this._task,
                    initial: this.initial?.data,
                  })}
                  ${pwInput({
                    url: this.url,
                    type: "checkbox",
                    value: true,
                    defaultValue: false,
                    disabled: this.disabled,
                    label: msg("Allow random assignments"),
                    name: ["random_assignments"],
                    get: (o) => o.random_assignments,
                    set: (o, v) => (o.random_assignments = v),
                    task: this._task,
                    initial: this.initial?.data,
                  })}
                  ${pwInput({
                    url: this.url,
                    type: "checkbox",
                    value: true,
                    defaultValue: false,
                    disabled: this.disabled,
                    label: msg("Mark this project as deleted"),
                    name: ["deleted"],
                    get: (o) => o.deleted,
                    set: (o, v) => (o.deleted = v),
                    task: this._task,
                    initial: this.initial?.data,
                  })}

                  <!-- Projektleitende -->
                  <!-- TODO FIXME view only -->
                  ${this.initial
                    ? html`<pw-project-users
                        projectId=${this.initial.data.id}
                        name=${"project_leader_id"}
                        title=${msg("Project leaders")}
                        prefix="leaders"
                      ></pw-project-users>`
                    : html``}
                  ${this.initial
                    ? html`<pw-project-users
                        projectId=${this.initial.data.id}
                        name=${"force_in_project_id"}
                        title=${msg("Guaranteed project members")}
                        prefix="members"
                      ></pw-project-users>`
                    : html``}
                  ${!this.disabled
                    ? html`
                        <button
                          type="submit"
                          ?disabled=${this._task.render({
                            pending: () => true,
                            complete: () => false,
                            initial: () => false,
                          })}
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
);

customElements.define("pw-project-create", PwProjectCreate);
