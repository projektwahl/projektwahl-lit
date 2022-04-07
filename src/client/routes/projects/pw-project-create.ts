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
import { html, noChange } from "lit";
import "../../form/pw-form.js";
import { Task } from "@lit-labs/task";
import { myFetch } from "../../utils.js";
import { PwForm } from "../../form/pw-form.js";
import { HistoryController } from "../../history-controller.js";
import { msg } from "@lit/localize";
import type { z } from "zod";
import type { routes, MinimalSafeParseError } from "../../../lib/routes.js";
import { ref } from "lit/directives/ref.js";
import { pwInputText } from "../../form/pw-input-text.js";
import { pwInputNumber } from "../../form/pw-input-number.js";
import { pwInputCheckbox } from "../../form/pw-input-checkbox.js";
import { aClick } from "../../pw-a.js";
import { LoggedInUserController } from "../../user-controller.js";
import { pwProjectUsers } from "../projects/pw-project-users.js";

export async function pwProjectCreatePreloaded(id: number, viewOnly = false) {
  const result = await taskFunction([id]);
  return pwProjectCreate({
    disabled: viewOnly,
    initial: result,
    url: "/api/v1/projects/update",
  });
}

// workaround see https://github.com/runem/lit-analyzer/issues/149#issuecomment-1006162839
export function pwProjectCreate(
  props: Pick<PwProjectCreate, "disabled" | "initial" | "url">
) {
  const { disabled, initial, url, ...rest } = props;
  let _ = rest;
  _ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
  return html`<pw-project-create
    ?disabled=${disabled}
    .initial=${initial}
    .url=${url}
  ></pw-project-create>`;
}

const taskFunction = async ([id]: [number]) => {
  const response = await myFetch<"/api/v1/projects">(
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
  );
  if (response.success) {
    return {
      success: true as const,
      data: response.data.entities[0],
    };
  }
  return response;
};

export class PwProjectCreate extends PwForm<
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

  protected willUpdate(changedProperties: Map<PropertyKey, unknown>): void {
    super.willUpdate(changedProperties)
    if (this.hasUpdated && changedProperties.has("initial")) {
      console.log("THIS HERE2", this.initial);

      // because fields are resettable we need to set this to undefined

      // @ts-expect-error impossible
      this.formData = {
        ...(this.initial?.success
          ? { id: this.initial.data.id }
          : { id: undefined }), // TODO FIXME
      };
    }
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

  initialTask: Task<
    [],
    | z.SafeParseSuccess<
        z.infer<
          typeof routes["/api/v1/projects"]["response"]
        >["entities"][number]
      >
    | MinimalSafeParseError
    | undefined
  >;

  userController: LoggedInUserController;

  constructor() {
    super();

    this.userController = new LoggedInUserController(this);

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

    this.initialTask = new Task(
      this,
      async () => {
        if (!this.hasUpdated) {
          // TODO FIXME normally this undefined data here would be sent
          if (this.initial !== undefined) {
            return this.initial;
          }
        }

        if (this.initial?.success) {
          return await taskFunction([this.initial?.data.id]);
        } else {
          return undefined;
        }
      },
      () => []
    );
  }

  override render() {
    if (!this.hasUpdated) {
      console.log("THIS HERE", this.initial);
      // @ts-expect-error impossible

      // TODO FIXME maybe replace by hidden input?
      this.formData = {
        ...(this.initial?.success
          ? { id: this.initial.data.id }
          : { id: undefined }), // TODO FIXME
      };
    }

    return html` <div
        style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1337;"
      >
        ${this._task.render({
          pending: () => html`<div
            class="spinner-grow text-primary"
            role="status"
          >
            <span class="visually-hidden">${msg("Loading...")}</span>
          </div>`,
        })}
      </div>

      ${this.initialTask.render({
        complete: (value) => {
          if (value === undefined || value?.success) {
            if (this.actionText === undefined) {
              throw new Error(msg("component not fully initialized"));
            }

            return html`
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

                        // we need to wait for submission

                        await this.initialTask.run();
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
                        // setting it like this is probably suboptimal as resettable is probably not working like that
                        initial: value?.data,
                        defaultValue: "",
                        resettable: value !== undefined,
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
                        initial: value?.data,
                        defaultValue: "",
                        resettable: value !== undefined,
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
                        initial: value?.data,
                        defaultValue: "",
                        resettable: value !== undefined,
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
                        initial: value?.data,
                        defaultValue: 0,
                        resettable: value !== undefined,
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
                        initial: value?.data,
                        defaultValue: 5,
                        resettable: value !== undefined,
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
                        initial: value?.data,
                        defaultValue: 13,
                        resettable: value !== undefined,
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
                        initial: value?.data,
                        defaultValue: 5,
                        resettable: value !== undefined,
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
                        initial: value?.data,
                        defaultValue: 15,
                        resettable: value !== undefined,
                      })}
                      <div class="form-text mb-3">
                        Bitte erstellen Sie keine Projekte mit mehr als 15
                        möglichen Teilnehmenden.
                      </div>
                      ${pwInputCheckbox<
                        "/api/v1/projects/create" | "/api/v1/projects/update"
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
                        initial: value?.data,
                        resettable: value !== undefined,
                      })}
                      ${pwInputCheckbox<
                        "/api/v1/projects/create" | "/api/v1/projects/update"
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
                        initial: value?.data,
                        resettable: value !== undefined,
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
                            href="/projects/edit/${value?.data.id}"
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
                      ${value
                        ? pwProjectUsers({
                            projectId: value.data.id,
                            name: "project_leader_id",
                            title: msg("Project leaders"),
                            prefix: "leaders",
                          })
                        : html``}
                      ${value &&
                      (this.userController.type === "admin" ||
                        this.userController.type === "helper")
                        ? pwProjectUsers({
                            projectId: value.data.id,
                            name: "force_in_project_id",
                            title: msg("Guaranteed project members"),
                            prefix: "members",
                          })
                        : html``}
                    </form>
                  </div>
                </div>
              </main>
            `;
          } else {
            return html`
              <main class="container">
                <h1 class="text-center">${this.actionText}</h1>
                
                <div class="alert alert-danger" role="alert">
                ${msg("Some errors occurred!")}<br />
                ${value?.error.issues.map(
                  (issue) => html` ${issue.path}: ${issue.message}<br /> `
                )}
              </div>
              
              </div>
            </main>`;
          }
        },
        error: (error) => {
          throw error;
        },
        initial: () => html`initial`,
        pending: () => noChange,
      })}`;
  }
}

customElements.define("pw-project-create", PwProjectCreate);
