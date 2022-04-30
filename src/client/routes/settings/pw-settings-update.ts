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
import type { MinimalSafeParseError, routes } from "../../../lib/routes.js";
import type { z } from "zod";
import { createRef, Ref, ref } from "lit/directives/ref.js";
import { pwInputText } from "../../form/pw-input-text.js";
import { PwInputSelect, pwInputSelect } from "../../form/pw-input-select.js";
import { pwInputNumber } from "../../form/pw-input-number.js";
import { pwInputCheckbox } from "../../form/pw-input-checkbox.js";
import { aClick } from "../../pw-a.js";
import "./pw-user-projects.js";

// workaround see https://github.com/runem/lit-analyzer/issues/149#issuecomment-1006162839
export function pwSettingsUpdate(
  props: Pick<PwSettingsUpdate, "disabled" | "url">
) {
  const { disabled, userId, url, ...rest } = props;
  let _ = rest;
  _ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
  return html`<pw-user-create
    ?disabled=${disabled}
    .url=${url}
  ></pw-user-create>`;
}

const taskFunction = async ([id]: [number]): Promise<
  | MinimalSafeParseError
  | z.SafeParseSuccess<
      (z.infer<
        typeof routes["/api/v1/settings"]["response"]
      >["entities"][number])[]
    >
> => {
  const response = await myFetch<"/api/v1/settings">(
    "GET",
    `/api/v1/settings`,
    {
      filters: {
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
      data:
        response.data.entities.length == 1
          ? response.data.entities
          : [],
    };
  }
  return response;
};

class PwSettingsUpdate extends PwForm<"/api/v1/settings/update"> {
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
    };
  }

  override get actionText() {
    return this.disabled
      ? msg("View settings")
      : msg("Update settings");
  }

  userId!: number | null;

  initialTask: Task<
    [number | null],
    | z.SafeParseSuccess<
        (z.infer<
          typeof routes["/api/v1/settings"]["response"]
        >["entities"][number])[]
      >
    | MinimalSafeParseError
    | undefined
  >;

  constructor() {
    super();

    this.url = "/api/v1/settings/update";

    this._task = new Task(this, async () => {
      const result = await myFetch<"/api/v1/settings/update">(
        "POST",
        this.url,
        this.formData,
        {}
      );

      return result;
    });

    this.initialTask = new Task(
      this,
      async () => {
        if (this.userId !== null) {
          return await taskFunction([this.userId]);
        } else {
          return undefined;
        }
      },
      () => [this.userId]
    );
  }

  protected willUpdate(changedProperties: Map<PropertyKey, unknown>): void {
    super.willUpdate(changedProperties);
    if (changedProperties.has("userId")) {
      // because fields are resettable we need to set this to undefined

      if (this.userId !== null) {
        this.formData = [
          {
            id: this.userId,
          },
        ];
      } else {
        // @ts-expect-error bruh
        this.formData = [];
      }
    }
  }

  override render() {
    if (this.actionText === undefined) {
      throw new Error(msg("component not fully initialized"));
    }

    return html` <div class="fully-centered">
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

            if (value?.data.length === 0) {
              return html`<main class="container">
              <h1 class="text-center">${this.actionText}</h1>
              
              <div class="alert alert-danger" role="alert">
              ${msg("Account nicht gefunden!")}<br />
            
            </div>
            
            </div>
          </main>`;
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

                        // only reset if this actually updated
                        if (this._task.value?.success) {
                          await this.initialTask.run();
                        }
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
                              defaultValue: undefined,
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
        initial: () => html``,
        pending: () => noChange,
      })}
      <div class="fully-centered">
        ${this.initialTask.render({
          pending: () => html`<div
            class="spinner-grow text-primary"
            role="status"
          >
            <span class="visually-hidden">${msg("Loading...")}</span>
          </div>`,
        })}
      </div>`;
  }
}

customElements.define("pw-user-create", PwUserCreate);
