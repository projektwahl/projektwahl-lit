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

// TODO FIXME implement edit

export class PwUserCreate extends PwForm<"/api/v1/users/create"> {
  static override get properties() {
    return {
      url: { attribute: false },
      actionText: { type: String },
      _task: { state: true },
      forceTask: { state: true },
      type: { state: true },
    };
  }

  override get actionText() {
    return msg("Create/Update account");
  }

  type;

  constructor() {
    super();

    /** @type {number|undefined} */
    this.forceTask = undefined;

    this.type = "voter";

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

        let result = await myFetch("/api/v1/users/create", {
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
      ></pw-text-input>

      <pw-select-input
        .value=${this.type}
        @change=${(event: Event) => (this.type = (event.target as HTMLSelectElement).value)}
        label=${msg("User type")}
        name="type"
        .options=${html`<option value="voter">Schüler</option>
          <option value="helper">Helfer</option>
          <option value="admin">Admin</option>`}
        .task=${this._task}
      >
      </pw-select-input>

      ${this.type === "voter"
        ? html`<pw-text-input
              label=${msg("Group")}
              name="group"
              .task=${this._task}
            ></pw-text-input>

            <pw-number-input
              label=${msg("Age")}
              name="age"
              .task=${this._task}
            ></pw-number-input>`
        : undefined}

      <pw-checkbox-input
        label=${msg("Away")}
        name="away"
        .task=${this._task}
      ></pw-checkbox-input>
    `;
  };
}
customElements.define("pw-user-create", PwUserCreate);

