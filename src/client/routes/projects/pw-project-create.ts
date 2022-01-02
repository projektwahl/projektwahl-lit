// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html } from "lit";
import "../../form/pw-form.js";
import { Task } from "@lit-labs/task";
import { myFetch } from "../../utils.js";
import { PwForm } from "../../form/pw-form.js";
import { HistoryController } from "../../history-controller.js";
import { msg } from "@lit/localize";
import "../../form/pw-number-input.js";
import "../../form/pw-text-input.js";
import "../../form/pw-checkbox-input.js";
import type { z } from "zod";
import type { routes } from "../../../lib/routes.js";
import "./pw-project-users.js";

export async function pwProject(id: number) {
  let result = await taskFunction([id]);
  return html`<pw-project-create .initial=${result}></pw-project-create>`;
}

const taskFunction = async ([id]: [number]) => {
  let response = await myFetch<"/api/v1/projects">(
    `/api/v1/projects/?f_id=${id}`,
    {
      //agent: new Agent({rejectUnauthorized: false})
    }
  );
  return response.success ? response.data.entities[0] : null; // TODO FIXME error handling, PwForm already has some form of error handling
};

export class PwProjectCreate extends PwForm<"/api/v1/projects/create-or-update"> {
  static override get properties() {
    return {
      url: { attribute: false },
      actionText: { type: String },
      _task: { state: true },
      _initialTask: { state: true },
      forceTask: { state: true },
      type: { state: true },
      initial: { attribute: false },
      initialRender: { state: true },
    };
  }

  override get actionText() {
    return this.initial ? msg("Update project") : msg("Create project");
  }

  initialRender: boolean;

  initial: z.infer<typeof routes["/api/v1/projects/create-or-update"]["request"]> | undefined;

  constructor() {
    super();

    this.initialRender = false;

    /** @type {number|undefined} */
    this.forceTask = undefined;

    /**
     * @override
     */
    this._task = new Task(
      this,
      async () => {
        const formDataEvent = new CustomEvent<
        z.infer<typeof routes["/api/v1/projects/create-or-update"]["request"]>
        >("myformdata", {
          bubbles: true,
          composed: true,
          detail: {
            id: -1
          },
        });
        this.form.value?.dispatchEvent(formDataEvent);
        formDataEvent.detail.id = this.initial?.id ?? null;

        let result = await myFetch<"/api/v1/projects/create-or-update">(
          "/api/v1/projects/create-or-update",
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

  override getInputs = () => {
    return html`
      <pw-text-input
        label=${msg("Title")}
        name="title"
        .task=${this._task}
        .initial=${this.initial}
      ></pw-text-input>

      <pw-text-input
        label=${msg("Info")}
        name="info"
        .task=${this._task}
        .initial=${this.initial}
      ></pw-text-input>

      <pw-text-input
        label=${msg("Place")}
        name="place"
        .task=${this._task}
        .initial=${this.initial}
      ></pw-text-input>

      <pw-number-input
        label=${msg("Costs")}
        name="costs"
        .task=${this._task}
        .initial=${this.initial}
      ></pw-number-input>

      <pw-number-input
        label=${msg("Minimum age")}
        name="min_age"
        .task=${this._task}
        .initial=${this.initial}
      ></pw-number-input>

      <pw-number-input
        label=${msg("Maximum age")}
        name="max_age"
        .task=${this._task}
        .initial=${this.initial}
      ></pw-number-input>

      <pw-number-input
        label=${msg("Minimum participants")}
        name="min_participants"
        .task=${this._task}
        .initial=${this.initial}
      ></pw-number-input>

      <pw-number-input
        label=${msg("Maximum participants")}
        name="max_participants"
        .task=${this._task}
        .initial=${this.initial}
      ></pw-number-input>

      <!-- Projektleitende -->
      ${this.initial
        ? html`<pw-project-users
            projectId=${this.initial.id!}
            name=${"project_leader_id"}
            title=${msg("Project leaders")}
          ></pw-project-users>`
        : html``}
      ${this.initial
        ? html`<pw-project-users
            projectId=${this.initial.id!}
            name=${"force_in_project_id"}
            title=${msg("Guaranteed project members")}
          ></pw-project-users>`
        : html``}

      <pw-checkbox-input
        label=${msg("Allow random assignments")}
        name="random_assignments"
        .task=${this._task}
        .initial=${this.initial}
      ></pw-checkbox-input>
    `;
  };
}
customElements.define("pw-project-create", PwProjectCreate);
