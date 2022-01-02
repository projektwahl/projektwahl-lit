// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html } from "lit";
import "../../form/pw-form.js";
import { Task } from "@lit-labs/task";
import { myFetch } from "../../utils.js";
import { PwForm } from "../../form/pw-form.js";
import { HistoryController } from "../../history-controller.js";
import { setupHmr } from "../../hmr.js";
import { msg } from "@lit/localize";
import "../../form/pw-checkbox-input.js";
import "../../form/pw-number-input.js";
import "../../form/pw-select-input.js";
import "../../form/pw-text-input.js";
import type {
  rawUserSchema,
  rawUserVoterSchema,
  rawUserHelperOrAdminSchema,
  routes,
} from "../../../lib/routes.js";
import type { z } from "zod";

export async function pwUser(id: number, viewOnly: boolean = false) {
  let result = await taskFunction([id]);
  return html`<pw-user-create ?disabled=${viewOnly} .initial=${result}></pw-user-create>`;
}

const taskFunction = async ([id]: [number]) => {
  let response = await myFetch<"/api/v1/users">(`/api/v1/users/?f_id=${id}`, {
    //agent: new Agent({rejectUnauthorized: false})
  });
  return response.success ? response.data.entities[0] : null; // TODO FIXME error handling, PwForm already has some form of error handling
};

export const PwUserCreate = setupHmr(
  import.meta.url,
  "PwUserCreate",
class PwUserCreate extends PwForm<"/api/v1/users/create-or-update"> {
  static override get properties() {
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
    return this.disabled ? msg("View account") : (this.initial ? msg("Update account") : msg("Create account"));
  }

  type?: "voter" | "admin" | "helper";

  initial:
    | z.infer<typeof routes["/api/v1/users/create-or-update"]["request"]>
    | undefined;

  constructor() {
    super();

    /** @type {number|undefined} */
    this.forceTask = undefined;

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
      },
      () => [this.forceTask]
    );
  }

  override getInputs() {
    return html`
      <pw-text-input
        ?disabled=${this.disabled}
        label=${msg("Username")}
        name="username"
        .task=${this._task}
        .initial=${this.initial}
      ></pw-text-input>

      <pw-select-input
        ?disabled=${this.disabled}
        @change=${(event: Event) =>
          (this.type = (event.target as HTMLSelectElement).value as
            | "helper"
            | "admin"
            | "voter")}
        label=${msg("User type")}
        name="type"
        .options=${[
          { value: "voter", text: "Schüler" },
          { value: "helper", text: "Helfer" },
          { value: "admin", text: "Admin" },
        ]}
        .task=${this._task}
        .initial=${{ type: this.type ?? this.initial?.type ?? "voter" }}
      >
      </pw-select-input>

      ${(this.type ?? this.initial?.type ?? "voter") === "voter"
        ? html`<pw-text-input
              ?disabled=${this.disabled}
              label=${msg("Group")}
              name="group"
              .task=${this._task}
              .initial=${this.initial}
            ></pw-text-input>

            <pw-number-input
              ?disabled=${this.disabled}
              label=${msg("Age")}
              name="age"
              .task=${this._task}
              .initial=${this.initial}
            ></pw-number-input>`
        : undefined}

        ${!this.disabled ? html`
      <pw-text-input
        ?disabled=${this.disabled}
        label=${msg("Password")}
        name="password"
        type="password"
        .task=${this._task}
        .initial=${this.initial}
      ></pw-text-input>
      ` : undefined}

      <pw-checkbox-input
        ?disabled=${this.disabled}
        label=${msg("Away")}
        name="away"
        .task=${this._task}
        .initial=${this.initial}
      ></pw-checkbox-input>
    `;
  };
})

customElements.define("pw-user-create", PwUserCreate);
