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
import type { routes, MinimalSafeParseError } from "../../../lib/routes.js";
import { setupHmr } from "../../hmr.js";
import { bootstrapCss } from "../../index.js";
import { ref } from "lit/directives/ref.js";
import { pwInputText } from "../../form/pw-input-text.js";
import { pwInputNumber } from "../../form/pw-input-number.js";
import { pwInputCheckbox } from "../../form/pw-input-checkbox.js";
import { aClick } from "../../pw-a.js";

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
        actionText: { type: String },
        _task: {
          state: true,
          hasChanged: () => {
            return true;
          },
        },
        _initialTask: {
          state: true,
          hasChanged: () => {
            return true;
          },
        },
        type: { state: true },
        initial: { attribute: false },
      };
    }

    override get actionText() {
      return this.disabled
        ? msg("View project")
        : this.initial
        ? msg("Update project")
        : msg("Create project");
    }

    initial:
      | z.SafeParseSuccess<
          z.infer<
            typeof routes["/api/v1/projects"]["response"]
          >["entities"][number]
        >
      | MinimalSafeParseError
      | undefined;

    constructor() {
      super();

      /**
       * @override
       */
      this._task = new Task(this, async () => {
        const result = await myFetch<
          "/api/v1/projects/create" | "/api/v1/projects/update"
        >("POST", this.url, this.formData, {});

        if (result.success) {
          HistoryController.goto(
            new URL(`/projects/edit/${result.data.id}`, window.location.href),
            { random: Math.random() },
            true
          );
        }

        return result;
      });
    }

    override render() {
      if (!this.hasUpdated) {
        // @ts-expect-error impossible
        this.formData = {
          ...(this.initial?.success
            ? { id: this.initial.data.id }
            : { id: undefined }), // TODO FIXME
        };
      }

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

                    //console.log("SUBMIT");

                    await this._task.run();
                  }}
                >
                  ${pwInputText<
                    "/api/v1/projects/create" | "/api/v1/projects/update",
                    string | undefined
                  >({
                    url: this.url,
                    type: "text",
                    disabled: this.disabled,
                    label: msg("Title"),
                    name: ["title"],
                    get: (o) => o.title,
                    set: (o, v) => (o.title = v),
                    task: this._task,
                    initial: this.initial?.data,
                    defaultValue: "",
                    resettable: this.initial !== undefined,
                  })}
                  ${pwInputText<
                    "/api/v1/projects/create" | "/api/v1/projects/update",
                    string | undefined
                  >({
                    url: this.url,
                    type: "textarea",
                    disabled: this.disabled,
                    label: msg("Info"),
                    name: ["info"],
                    get: (o) => o.info,
                    set: (o, v) => (o.info = v),
                    task: this._task,
                    initial: this.initial?.data,
                    defaultValue: "",
                    resettable: this.initial !== undefined,
                  })}
                  ${pwInputText<
                    "/api/v1/projects/create" | "/api/v1/projects/update",
                    string | undefined
                  >({
                    url: this.url,
                    type: "text",
                    disabled: this.disabled,
                    label: msg("Place"),
                    name: ["place"],
                    get: (o) => o.place,
                    set: (o, v) => (o.place = v),
                    task: this._task,
                    initial: this.initial?.data,
                    defaultValue: "",
                    resettable: this.initial !== undefined,
                  })}
                  ${pwInputNumber<
                    "/api/v1/projects/create" | "/api/v1/projects/update",
                    number | undefined
                  >({
                    url: this.url,
                    type: "number",
                    disabled: this.disabled,
                    label: msg("Costs"),
                    name: ["costs"],
                    get: (o) => o.costs,
                    set: (o, v) => (o.costs = v),
                    task: this._task,
                    initial: this.initial?.data,
                    defaultValue: 0,
                    resettable: this.initial !== undefined,
                  })}
                  ${pwInputNumber<
                    "/api/v1/projects/create" | "/api/v1/projects/update",
                    number | undefined
                  >({
                    url: this.url,
                    type: "number",
                    disabled: this.disabled,
                    label: msg("Minimum age"),
                    name: ["min_age"],
                    get: (o) => o.min_age,
                    set: (o, v) => (o.min_age = v),
                    task: this._task,
                    initial: this.initial?.data,
                    defaultValue: 5,
                    resettable: this.initial !== undefined,
                  })}
                  ${pwInputNumber<
                    "/api/v1/projects/create" | "/api/v1/projects/update",
                    number | undefined
                  >({
                    url: this.url,
                    type: "number",
                    disabled: this.disabled,
                    label: msg("Maximum age"),
                    name: ["max_age"],
                    get: (o) => o.max_age,
                    set: (o, v) => (o.max_age = v),
                    task: this._task,
                    initial: this.initial?.data,
                    defaultValue: 13,
                    resettable: this.initial !== undefined,
                  })}
                  ${pwInputNumber<
                    "/api/v1/projects/create" | "/api/v1/projects/update",
                    number | undefined
                  >({
                    url: this.url,
                    type: "number",
                    disabled: this.disabled,
                    label: msg("Minimum participants"),
                    name: ["min_participants"],
                    get: (o) => o.min_participants,
                    set: (o, v) => (o.min_participants = v),
                    task: this._task,
                    initial: this.initial?.data,
                    defaultValue: 5,
                    resettable: this.initial !== undefined,
                  })}
                  ${pwInputNumber<
                    "/api/v1/projects/create" | "/api/v1/projects/update",
                    number | undefined
                  >({
                    url: this.url,
                    type: "number",
                    disabled: this.disabled,
                    label: msg("Maximum participants"),
                    name: ["max_participants"],
                    get: (o) => o.max_participants,
                    set: (o, v) => (o.max_participants = v),
                    task: this._task,
                    initial: this.initial?.data,
                    defaultValue: 15,
                    resettable: this.initial !== undefined,
                  })}
                  <div class="form-text mb-3">
                    Bitte erstellen Sie keine Projekte mit mehr als 15 möglichen
                    Teilnehmenden.
                  </div>
                  ${pwInputCheckbox<
                    "/api/v1/projects/create" | "/api/v1/projects/update",
                    boolean | undefined
                  >({
                    url: this.url,
                    type: "checkbox",
                    trueValue: true,
                    falseValue: false,
                    defaultValue: true,
                    disabled: this.disabled,
                    label: msg("Allow random assignments"),
                    name: ["random_assignments"],
                    get: (o) => o.random_assignments,
                    set: (o, v) => (o.random_assignments = v),
                    task: this._task,
                    initial: this.initial?.data,
                    resettable: this.initial !== undefined,
                  })}
                  ${pwInputCheckbox<
                    "/api/v1/projects/create" | "/api/v1/projects/update",
                    boolean | undefined
                  >({
                    url: this.url,
                    type: "checkbox",
                    trueValue: true,
                    falseValue: false,
                    defaultValue: false,
                    disabled: this.disabled,
                    label: msg("Mark this project as deleted"),
                    name: ["deleted"],
                    get: (o) => o.deleted,
                    set: (o, v) => (o.deleted = v),
                    task: this._task,
                    initial: this.initial?.data,
                    resettable: this.initial !== undefined,
                  })}
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
                    : html`<a
                        class="btn btn-secondary"
                        @click=${aClick}
                        href="/projects/edit/${this.initial?.data.id}"
                        role="button"
                        >Edit project</a
                      >`}
                  <button
                    type="button"
                    class="btn btn-secondary"
                    @click=${() => window.history.back()}
                  >
                    ${msg(`Back`)}
                  </button>

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
