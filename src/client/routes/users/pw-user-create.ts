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
import "../../form/pw-input.js";
import type { routes, MinimalSafeParseError } from "../../../lib/routes.js";
import type { z } from "zod";
import { bootstrapCss } from "../../index.js";
import { ref } from "lit/directives/ref.js";
import { pwInputText } from "../../form/pw-input-text.js";
import { pwInputSelect } from "../../form/pw-input-select.js";
import { pwInputNumber } from "../../form/pw-input-number.js";
import { pwInputCheckbox } from "../../form/pw-input-checkbox.js";

export async function pwUser(id: number, viewOnly = false) {
  const result = await taskFunction([id]);
  // TODO FIXME the types aren't checked correctly here - maybe they are with lit-analyzer
  return html`<pw-user-create
    ?disabled=${viewOnly}
    .initial=${result}
    uri="/api/v1/users/create-or-update"
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
      data: response.data.entities,
    };
  }
  return response;
};

class PwUserCreate extends PwForm<"/api/v1/users/create-or-update"> {
  static get properties() {
    return {
      ...super.properties,
      uri: { type: String },
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
    | z.SafeParseSuccess<
        z.infer<typeof routes["/api/v1/users"]["response"]>["entities"]
      >
    | MinimalSafeParseError
    | undefined;

  uri!: "/api/v1/users/create-or-update";

  constructor() {
    super();

    this._task = new Task(this, async () => {
      const formDataEvent = new CustomEvent<
        z.infer<typeof routes["/api/v1/users/create-or-update"]["request"]>
      >("myformdata", {
        bubbles: false,
        // @ts-expect-error not typecheckable with current design
        detail: [
          {
            action: this.initial !== undefined ? "update" : "create",
            project_leader_id: undefined,
            force_in_project_id: undefined,
            ...(this.initial?.success
              ? { id: this.initial.data[0].id }
              : { id: undefined }), // TODO FIXME
          },
        ],
      });
      this.form.value?.dispatchEvent(formDataEvent);

      const result = await myFetch<"/api/v1/users/create-or-update">(
        "POST",
        this.uri,
        formDataEvent.detail,
        {}
      );

      if (result.success) {
        HistoryController.goto(new URL("/", window.location.href), {}, false);
      }

      return result;
    });
  }

  override render() {
    console.log("initial", this.initial);
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
                  initial:
                    this.initial?.data.length == 1
                      ? [{ action: "update", ...this.initial?.data[0] }]
                      : undefined,
                  defaultValue: "",
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
                  initial:
                    this.initial?.data.length == 1
                      ? [{ action: "update", ...this.initial?.data[0] }]
                      : undefined,
                  defaultValue: undefined,
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
                    this.type = v;
                  },
                  options: [
                    { value: "voter", text: "Schüler" },
                    { value: "helper", text: "Helfer" },
                    { value: "admin", text: "Admin" },
                  ],
                  task: this._task,
                  initial:
                    this.initial?.data.length == 1
                      ? [
                          {
                            ...this.initial?.data[0],
                            action: "update",
                            type:
                              this.type ??
                              this.initial?.data[0].type ??
                              "voter",
                          },
                        ]
                      : undefined,
                  defaultValue: undefined,
                })}
                ${(this.type ?? this.initial?.data[0].type ?? "voter") ===
                "voter"
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
                      initial:
                        this.initial?.data.length == 1
                          ? [{ action: "update", ...this.initial?.data[0] }]
                          : undefined,
                      defaultValue: "",
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
                      initial:
                        this.initial?.data.length == 1
                          ? [{ action: "update", ...this.initial?.data[0] }]
                          : undefined,
                      defaultValue: undefined,
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
                        initial:
                          this.initial?.data.length == 1
                            ? [{ action: "update", ...this.initial?.data[0] }]
                            : undefined,
                        defaultValue: "",
                      })}
                    `
                  : undefined}
                ${pwInputCheckbox<
                  "/api/v1/users/create-or-update",
                  boolean | undefined
                >({
                  url: this.url,
                  type: "checkbox",
                  value: true,
                  defaultValue: false,
                  disabled: this.disabled,
                  label: msg("Away"),
                  name: [0, "away"],
                  get: (o) => o[0].away,
                  set: (o, v) => (o[0].away = v),
                  task: this._task,
                  initial:
                    this.initial?.data.length == 1
                      ? [{ action: "update", ...this.initial?.data[0] }]
                      : undefined,
                })}
                ${pwInputCheckbox<
                  "/api/v1/users/create-or-update",
                  boolean | undefined
                >({
                  url: this.url,
                  type: "checkbox",
                  value: true,
                  defaultValue: false,
                  disabled: this.disabled,
                  label: msg("Mark this user as deleted"),
                  name: [0, "deleted"],
                  get: (o) => o[0].deleted,
                  set: (o, v) => (o[0].deleted = v),
                  task: this._task,
                  initial:
                    this.initial?.data.length == 1
                      ? [{ action: "update", ...this.initial?.data[0] }]
                      : undefined,
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
                  : undefined}
              </form>
            </div>
          </div>
        </main>
      `;
    } else {
      // TODO FIXME
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
