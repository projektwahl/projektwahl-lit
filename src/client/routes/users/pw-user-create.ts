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
import { rawUserSchema } from "../../../lib/routes.js";
import type { z } from "zod";

const schema = rawUserSchema(id => id, id => id);

export async function pwUser(id: number) {
  let result = await taskFunction([id]);
  return html`<pw-user-create .initial=${result}></pw-user-create>`
}

const taskFunction = async ([id]: [number]
  ) => {
    let response = await fetch(
      new URL(`/api/v1/users/?f_id=${id}`, window.location.href).toString(),
      {
        //agent: new Agent({rejectUnauthorized: false})
      }
    );
    return (await response.json()).entities[0];
  };

export class PwUserCreate extends PwForm<"/api/v1/users/create-or-update"> {
  static override get properties() {
    return {
      url: { attribute: false },
      actionText: { type: String },
      _task: { state: true },
      forceTask: { state: true },
      type: { state: true },
      initial: { attribute: false },
    };
  }

  override get actionText() {
    return this.initial ? msg("Update account") : msg("Create account");
  }

  type;

  initial: z.infer<typeof schema> | undefined;

  constructor() {
    super();

    /** @type {number|undefined} */
    this.forceTask = undefined;

    this.type = this.initial?.type ?? "voter";

    /**
     * @override
     */
    this._task = new Task(
      this,
      async () => {
        const formDataEvent = new CustomEvent("myformdata", {
          bubbles: true,
          composed: true,
          detail: {},
        });
        this.form.value?.dispatchEvent(formDataEvent);

        let result = await myFetch("/api/v1/users/create-or-update", {
          method: "POST",
          headers: {
            "content-type": "text/json",
          },
          body: JSON.stringify(formDataEvent.detail),
        });

        if (result.success) {
          HistoryController.goto(new URL("/", window.location.href), {});
        }

        return result;
      },
      () => [this.forceTask]
    );
  }

  override getInputs = () => {
    return html`
      <pw-text-input
        label=${msg("Username")}
        name="username"
        .task=${this._task}
        .initial=${this.initial}
      ></pw-text-input>

      <pw-select-input
        @change=${(event: Event) => (this.type = (event.target as HTMLSelectElement).value)}
        label=${msg("User type")}
        name="type"
        .options=${html`<option value="voter">Schüler</option>
          <option value="helper">Helfer</option>
          <option value="admin">Admin</option>`}
        .task=${this._task}
        .value=${this.type}
      >
      </pw-select-input>

      ${this.type === "voter"
        ? html`<pw-text-input
              label=${msg("Group")}
              name="group"
              .task=${this._task}
              .initial=${this.initial}
            ></pw-text-input>

            <pw-number-input
              label=${msg("Age")}
              name="age"
              .task=${this._task}
              .initial=${this.initial}
            ></pw-number-input>`
        : undefined}

      <pw-checkbox-input
        label=${msg("Away")}
        name="away"
        .task=${this._task}
        .initial=${this.initial}
      ></pw-checkbox-input>
    `;
  };
}
customElements.define("pw-user-create", PwUserCreate);

