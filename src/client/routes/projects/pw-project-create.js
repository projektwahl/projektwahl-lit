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
 * @extends PwForm<"/api/v1/projects/create">
 */
export class PwProjectCreate extends PwForm {
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

    this.actionText = "Projekt erstellen/aktualisieren";

    this.type = "voter";

    /**
     * @override
     */
    this._task = new Task(
      this,
      async () => {
        const formData = new FormData(this.form.value);

        // @ts-expect-error bad typings
        let jsonData = Object.fromEntries(formData.entries());

        let result = await myFetch("/api/v1/projects/create", {
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
        label="Titel"
        name="title"
        .task=${this._task}
      ></pw-input>

      <pw-input
        type="text"
        label="Info"
        name="info"
        .task=${this._task}
      ></pw-input>

      <pw-input
        type="text"
        label="Ort/Raum"
        name="location"
        .task=${this._task}
      ></pw-input>

      <pw-input
        type="number"
        label="Kosten"
        name="costs"
        .task=${this._task}
      ></pw-input>

      <pw-input
        type="number"
        label="minimale Jahrgangsstufe"
        name="min_age"
        .task=${this._task}
      ></pw-input>

      <pw-input
        type="number"
        label="maximale Jahrgangsstufe"
        name="max_age"
        .task=${this._task}
      ></pw-input>

      <pw-input
        type="number"
        label="minimale Teilnehmer"
        name="min_participants"
        .task=${this._task}
      ></pw-input>

      <pw-input
        type="number"
        label="maximale Teilnehmer"
        name="max_participants"
        .task=${this._task}
      ></pw-input>

      <!-- Betreuer, Projektleiter (Schüler) -->

      <pw-input
        type="checkbox"
        label="Abwesend"
        name="away"
        .task=${this._task}
      ></pw-input>
    `;
  };
}
customElements.define("pw-project-create", PwProjectCreate);

setupHmr(PwProjectCreate, import.meta.url);
