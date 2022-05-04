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
import { msg } from "@lit/localize";
import "../../form/pw-input.js";
import type { MinimalSafeParseError, routes } from "../../../lib/routes.js";
import type { z } from "zod";
import { ref } from "lit/directives/ref.js";
import { pwInputText } from "../../form/pw-input-text.js";

// workaround see https://github.com/runem/lit-analyzer/issues/149#issuecomment-1006162839
export function pwSettingsUpdate(
  props: Pick<PwSettingsUpdate, "disabled" | "url">
) {
  const { disabled, url, ...rest } = props;
  let _ = rest;
  _ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
  return html`<pw-settings-update
    ?disabled=${disabled}
    .url=${url}
  ></pw-settings-update>`;
}

const taskFunction = async (): Promise<
  | MinimalSafeParseError
  | z.SafeParseSuccess<
      z.infer<typeof routes["/api/v1/settings"]["response"]>["entities"][number]
    >
> => {
  const response = await myFetch<"/api/v1/settings">(
    "GET",
    `/api/v1/settings`,
    {
      filters: {},
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

function database2datetimelocal(unix_time: number) {
  if (typeof unix_time !== "number") {
    throw new Error("not a number")
  }
  // 2022-05-04T20:58
  const d = new Date(unix_time);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDay()}T${d.getHours()}:${d.getMinutes()}`
}

// https://stackoverflow.com/questions/64440010/trying-to-set-datetime-local-using-javascript
// what the hell
function datetimelocal2database(input: string) {
  // 2022-05-03T15:43
  return new Date(Number(input.slice(0, 4)), Number(input.slice(5, 7))-1, Number(input.slice(8, 10)),
  Number(input.slice(11, 13)), Number(input.slice(14, 16))).getTime();
}

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
    return this.disabled ? msg("View settings") : msg("Update settings");
  }

  initialTask: Task<
    [],
    | z.SafeParseSuccess<
        z.infer<
          typeof routes["/api/v1/settings"]["response"]
        >["entities"][number]
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
        return await taskFunction();
      },
      () => []
    );

    this.formData = {};
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
                      ${pwInputText<"/api/v1/settings/update", string|undefined>({
                        // 1010-10-10T22:10
                        url: this.url,
                        type: "datetime-local",
                        disabled: this.disabled,
                        label: msg("Open date"),
                        name: ["open_date"],
                        get: (o) => o.open_date !== undefined ? value?.data.open_date : database2datetimelocal(o.open_date), // gets initial data
                        set: (o, v) => (o.open_date = v === undefined ? o.open_date : datetimelocal2database(v)), // gets default or inputvalue
                        task: this._task,
                        defaultValue: "",
                        // TODO FIXME loading the initial data doesn't work because the format of the open_date is wrong. we probably need to convert it to the local timezone (maybe already on the server side) and truncate the + at the start etc.
                        initial: value?.data,
                        resettable: value !== undefined,
                      })}
                      ${pwInputText<"/api/v1/settings/update", string>({
                        url: this.url,
                        type: "datetime-local",
                        disabled: this.disabled,
                        label: msg("Voting start date"),
                        name: ["voting_start_date"],
                        get: (o) => o.voting_start_date,
                        set: (o, v) => (o.voting_start_date = v),
                        task: this._task,
                        defaultValue: "",
                        initial: value?.data,
                        resettable: value !== undefined,
                      })}
                      ${pwInputText<"/api/v1/settings/update", string>({
                        url: this.url,
                        type: "datetime-local",
                        disabled: this.disabled,
                        label: msg("Voting end date"),
                        name: ["voting_end_date"],
                        get: (o) => o.voting_end_date,
                        set: (o, v) => (o.voting_end_date = v),
                        task: this._task,
                        defaultValue: "",
                        initial: value?.data,
                        resettable: value !== undefined,
                      })}
                      ${pwInputText<"/api/v1/settings/update", string>({
                        url: this.url,
                        type: "datetime-local",
                        disabled: this.disabled,
                        label: msg("Results date"),
                        name: ["results_date"],
                        get: (o) => o.results_date,
                        set: (o, v) => (o.results_date = v),
                        task: this._task,
                        defaultValue: "",
                        initial: value?.data,
                        resettable: value !== undefined,
                      })}

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

customElements.define("pw-settings-update", PwSettingsUpdate);
