import "../../form/pw-checkbox-input.js";
import { Task, TaskStatus } from "@lit-labs/task";
import { html, LitElement } from "lit";
import { HistoryController } from "../../history-controller.js";
import { myFetch } from "../../utils.js";
import { createRef, ref } from "lit/directives/ref.js";
import { msg } from "@lit/localize";
import { bootstrapCss } from "../../index.js";

// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

class PwProjectLeaderCheckbox extends LitElement {
    static override get properties() {
        return {
          _task: { state: true },
          forceTask: { state: true },
          disabled: { state: true },
          userId: { type: Number },
          projectId: { type: Number }
        };
      }

      forceTask: number | undefined;

      _task!: import("@lit-labs/task").Task<
    any,
    any
  >;

  userId!: number;

  projectId!: number;

  disabled: boolean;

  form: import("lit/directives/ref").Ref<HTMLFormElement>;

  constructor() {
    super();

    this.disabled = false;

    this.form = createRef();

    this.forceTask = undefined;

    this._task = new Task(
      this,
      async () => {
        let result = await myFetch("/api/v1/users/create-or-update", {
          method: "POST",
          headers: {
            "content-type": "text/json",
          },
          body: JSON.stringify({
            id: this.userId,
            project_leader_id: this.projectId
          }),
        });

        return result;
      },
      () => [this.forceTask] // TODO FIXME ensure this is working and update to the new method
    );
  }

  render() {
    return html`
          ${bootstrapCss}
          <form ${ref(this.form)}>
             ${this._task.render({
              complete: (data) => {
                if (!data.success) {
                  const errors = Object.entries(data.error)
                    .map(([k, v]) => html`${k}: ${v}<br />`);
                  if (errors.length > 0) {
                    return html`<div class="alert alert-danger" role="alert">
                      ${msg("Some errors occurred!")}<br />
                      ${errors}
                    </div>`;
                  }
                }
                return html``;
              },
              error: (error) => html`<div
                class="alert alert-danger"
                role="alert"
              >
                ${error}
              </div>`,
            })}

        <input
          @change=${() => {
            this.forceTask = (this.forceTask || 0) + 1;
          }}
          type="checkbox"
          ?disabled=${this._task.status === TaskStatus.PENDING}
          checked=${true/* TODO FIXME */}
          class="form-check-input"
        />
    </form>`;
  }
}

customElements.define("pw-project-leader-checkbox", PwProjectLeaderCheckbox);
