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
import "../../form/pw-input.js";
import type {
  MinimalSafeParseError,
  updateUserAction,
} from "../../../lib/routes.js";
import type { z } from "zod";
import { createRef, Ref, ref } from "lit/directives/ref.js";
import { pwInputText } from "../../form/pw-input-text.js";
import { PwInputSelect, pwInputSelect } from "../../form/pw-input-select.js";
import { pwInputNumber } from "../../form/pw-input-number.js";
import { pwInputCheckbox } from "../../form/pw-input-checkbox.js";
import { aClick } from "../../pw-a.js";
import "./pw-user-projects.js";

export async function pwUser(id: number, viewOnly = false) {
  const result = await taskFunction([id]);
  return pwUserCreate({
    disabled: viewOnly,
    initial: result,
    url: "/api/v1/users/create-or-update"
  });
}

// workaround see https://github.com/runem/lit-analyzer/issues/149#issuecomment-1006162839
export function pwUserCreate(
  props: Pick<
    PwUserCreate,
    "disabled" | "initial" | "url"
  >
) {
  const {
    disabled,
    initial,
    url,
    ...rest
  } = props;
  let _ = rest;
  _ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
  return html`<pw-user-create
  ?disabled=${disabled}
  .initial=${initial}
  .url=${url}
  ></pw-user-create>`;
}

const taskFunction = async ([id]: [number]) => {
  const response = await myFetch<"/api/v1/users">(
    "GET",
    `/api/v1/users`,
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
      success: true,
      data:
        response.data.entities.length == 1
          ? [{ action: "update", ...response.data.entities[0] }]
          : [],
    };
  }
  return response;
};

class PwUserCreate extends PwForm<"/api/v1/users/create-or-update"> {
  static get properties() {
    return {
      ...super.properties,
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
      ? msg("View account")
      : this.initial
      ? msg("Update account")
      : msg("Create account");
  }

  initial:
    | z.SafeParseSuccess<z.infer<typeof updateUserAction>[]>
    | MinimalSafeParseError
    | undefined;

  initialTask: Task<
    [],
    | z.SafeParseSuccess<z.infer<typeof updateUserAction>[]>
    | MinimalSafeParseError
    | undefined
  >;

  typeRef!: Ref<
    PwInputSelect<
      "/api/v1/users/create-or-update",
      "voter" | "helper" | "admin" | undefined
    >
  >;

  constructor() {
    super();

    this.url = "/api/v1/users/create-or-update";

    this._task = new Task(this, async () => {
      const result = await myFetch<"/api/v1/users/create-or-update">(
        "POST",
        this.url,
        this.formData,
        {}
      );

      if (result.success) {
        HistoryController.goto(
          new URL(`/users/edit/${result.data[0].id}`, window.location.href),
          { random: Math.random() },
          true
        );
      }
      return result;
    });

    // @ts-expect-error TODO fix this
    this.initialTask = new Task(
      this,
      async () => {
        if (!this.hasUpdated) {
          if (this.initial !== undefined) {
            return this.initial;
          }
        }

        if (this.initial?.success) {
          return await taskFunction([this.initial?.data[0].id]);
        } else {
          return undefined;
        }
      },
      () => []
    );

    this.typeRef = createRef();
  }

  override render() {
    if (!this.hasUpdated) {
      this.formData = [
        // @ts-expect-error impossible
        this.initial?.success
          ? {
              action: "update",
              project_leader_id: undefined,
              force_in_project_id: undefined,
              id: this.initial.data[0].id,
            }
          : { action: "create" },
      ];
    }

    if (this.initial === undefined || this.initial.success) {
      if (this.actionText === undefined) {
        throw new Error(msg("component not fully initialized"));
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
                          "/api/v1/users/create-or-update",
                          string | undefined
                        >({
                          url: this.url,
                          type: "text",
                          disabled: this.disabled,
                          label: msg("Username"),
                          name: [0, "username"],
                          get: (o) => o[0].username,
                          set: (o, v) => (o[0].username = v),
                          task: this._task,
                          defaultValue: "",
                          initial: value?.data,
                          resettable: value !== undefined,
                        })}
                        ${pwInputText<
                          "/api/v1/users/create-or-update",
                          string | null | undefined
                        >({
                          url: this.url,
                          type: "text",
                          disabled: this.disabled,
                          label: msg("Third-party email address"),
                          name: [0, "openid_id"],
                          get: (o) => o[0].openid_id,
                          set: (o, v) => (o[0].openid_id = v),
                          task: this._task,
                          defaultValue: null,
                          initial: value?.data,
                          resettable: value !== undefined,
                        })}
                        ${pwInputSelect<
                          "/api/v1/users/create-or-update",
                          "voter" | "helper" | "admin" | undefined
                        >({
                          url: this.url,
                          type: "select",
                          disabled: this.disabled,
                          label: msg("User type"),
                          name: [0, "type"],
                          get: (o) => o[0].type,
                          set: (o, v) => {
                            o[0].type = v;
                            this.requestUpdate(); // hack to update on this
                          },
                          options: [
                            { value: "voter", text: "Schüler" },
                            { value: "helper", text: "Helfer" },
                            { value: "admin", text: "Admin" },
                          ],
                          task: this._task,
                          defaultValue: "voter",
                          pwRef: this.typeRef,
                          initial: value?.data,
                          resettable: value !== undefined,
                        })}
                        ${this.typeRef.value?.inputValue === "voter"
                          ? html`${pwInputText<
                              "/api/v1/users/create-or-update",
                              string | null | undefined
                            >({
                              url: this.url,
                              type: "text",
                              disabled: this.disabled,
                              label: msg("Group"),
                              name: [0, "group"],
                              get: (o) => o[0].group,
                              set: (o, v) => (o[0].group = v),
                              task: this._task,
                              defaultValue: "",
                              initial: value?.data,
                              resettable: value !== undefined,
                            })}
                            ${pwInputNumber<
                              "/api/v1/users/create-or-update",
                              number | undefined | null
                            >({
                              url: this.url,
                              type: "number",
                              disabled: this.disabled,
                              label: msg("Age"),
                              name: [0, "age"],
                              get: (o) => o[0].age,
                              set: (o, v) => (o[0].age = v),
                              task: this._task,
                              defaultValue: null,
                              initial: value?.data,
                              resettable: value !== undefined,
                            })}`
                          : undefined}
                        ${!this.disabled
                          ? html`
                              ${pwInputText<
                                "/api/v1/users/create-or-update",
                                string | undefined
                              >({
                                url: this.url,
                                type: "password",
                                disabled: this.disabled,
                                label: msg("Password"),
                                name: [0, "password"],
                                get: (o) => o[0].password,
                                set: (o, v) => (o[0].password = v),
                                task: this._task,
                                autocomplete: "new-password",
                                defaultValue: "",
                                initial: value?.data,
                                resettable: value !== undefined,
                              })}
                            `
                          : undefined}
                        ${pwInputCheckbox<"/api/v1/users/create-or-update">({
                          url: this.url,
                          type: "checkbox",
                          trueValue: true,
                          falseValue: false,
                          defaultValue: false,
                          disabled: this.disabled,
                          label: msg("Away"),
                          name: [0, "away"],
                          get: (o) => o[0].away,
                          set: (o, v) => (o[0].away = v),
                          task: this._task,
                          initial: value?.data,
                          resettable: value !== undefined,
                        })}
                        ${pwInputCheckbox<"/api/v1/users/create-or-update">({
                          url: this.url,
                          type: "checkbox",
                          trueValue: true,
                          falseValue: false,
                          defaultValue: false,
                          disabled: this.disabled,
                          label: msg("Mark this user as deleted"),
                          name: [0, "deleted"],
                          get: (o) => o[0].deleted,
                          set: (o, v) => (o[0].deleted = v),
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
                              href="/users/edit/${value?.data[0].id}"
                              @click=${aClick}
                              role="button"
                              >Edit user</a
                            >`}
                        <button
                          type="button"
                          class="btn btn-secondary"
                          @click=${() => window.history.back()}
                        >
                          ${msg(`Back`)}
                        </button>

                        ${value?.data[0].action == "update"
                          ? html`<pw-user-projects
                                @refreshentitylist=${() => {
                                  // TODO FIXME this may let you loose data?
                                  // I think it doesnt but not sure
                                  void this.initialTask.run();
                                }}
                                .user=${value?.data[0]}
                                name=${"project_leader_id"}
                                title=${msg("Project leader in")}
                                prefix="leaders"
                              ></pw-user-projects>

                              <pw-user-projects
                                @refreshentitylist=${() => {
                                  // TODO FIXME this may let you loose data?
                                  // I think it doesnt but not sure
                                  void this.initialTask.run();
                                }}
                                .user=${value?.data[0]}
                                name=${"force_in_project_id"}
                                title=${msg("Guaranteed project member in")}
                                prefix="members"
                              ></pw-user-projects>`
                          : undefined}
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
}

customElements.define("pw-user-create", PwUserCreate);
