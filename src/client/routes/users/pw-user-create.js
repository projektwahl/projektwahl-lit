// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html } from "lit";
import "../../form/pw-input.js";
import "../../form/pw-form.js";
import { Task } from "@lit-labs/task";
import { myFetch } from "../../utils.js";
import { PwForm } from "../../form/pw-form.js";
import { HistoryController } from "../../history-controller.js";
import { isOk } from "../../../lib/result.js";
import { setupHmr } from "../../hmr.js";

// TODO FIXME implement edit

/**
 * @extends PwForm<"/api/v1/users/create">
 */
export class PwUserCreate extends PwForm {
  /** @override */ static get properties() {
    return {
      url: { attribute: false },
      actionText: { type: String },
      _task: { state: true },
      forceTask: { state: true },
      type: { state: true },
    };
  }

  constructor() {
    super();

    /** @type {number|undefined} */
    this.forceTask = undefined;

    this.actionText = "Account erstellen/aktualisieren";

    /**
     * @private
     */
    this.history = new HistoryController(this, /.*/);

    this.type = "voter";

    /**
     * @private
     */
    this._task = new Task(
      this,
      async () => {
        const formData = new FormData(this.form.value);

        // @ts-expect-error bad typings
        let jsonData = Object.fromEntries(formData.entries());

        let result = await myFetch("/api/v1/users/create", {
          method: "POST",
          headers: {
            "content-type": "text/json",
          },
          body: JSON.stringify(jsonData),
        });

        if (isOk(result)) {
          HistoryController.goto(new URL("/", window.location.href), {});
        }

        return result;
      },
      () => [this.forceTask]
    );
  }

  /** @override */ getInputs = () => {
    return html`
      <pw-input
        type="text"
        label="Name"
        name="username"
        .task=${this._task}
      ></pw-input>

      <pw-input
        .value=${this.type}
        @change=${(event) => (this.type = event.target.value)}
        type="select"
        label="Nutzerart"
        name="type"
        .options=${html`<option value="voter">Schüler</option>
          <option value="helper">Helfer</option>
          <option value="admin">Admin</option>`}
        .task=${this._task}
      >
      </pw-input>

      ${this.type === "voter"
        ? html`<pw-input
              type="text"
              label="Klasse"
              name="group"
              .task=${this._task}
            ></pw-input>

            <pw-input
              type="number"
              label="Jahrgang"
              name="age"
              .task=${this._task}
            ></pw-input>`
        : undefined}

      <pw-input
        type="checkbox"
        label="Abwesend"
        name="away"
        .task=${this._task}
      ></pw-input>
    `;
  };
}
customElements.define("pw-user-create", PwUserCreate);

setupHmr(PwUserCreate, import.meta.url);
