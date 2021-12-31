import "../../form/pw-checkbox-input.js";
import { Task } from "@lit-labs/task";
import { html, LitElement } from "lit";
import { HistoryController } from "../../history-controller.js";
import { myFetch } from "../../utils.js";
import { createRef, ref } from "lit/directives/ref.js";

// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

class PwProjectLeaderCheckbox extends LitElement {

    static override get properties() {
        return {
          _task: { state: true },
          forceTask: { state: true },
        };
      }

      forceTask: number | undefined;

      _task!: import("@lit-labs/task").Task<
    any,
    any
  >;

  form: import("lit/directives/ref").Ref<HTMLFormElement>;

  constructor() {
    super();

    this.form = createRef();

    this.forceTask = undefined;

    this._task = new Task(
      this,
      async () => {
        const formDataEvent = new CustomEvent("myformdata", {
          bubbles: true,
          composed: true,
          detail: {},
        });
        this.form.value?.dispatchEvent(formDataEvent);

        let result = await myFetch("/api/v1/login", {
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

  render() {
    return html`<form ${ref(this.form)}>
      <pw-checkbox-input
        name="is_project_leader"
        label="test"
        .task=${"hi"}
      ></pw-checkbox-input>
    </form>`;
  }
}

customElements.define("pw-project-leader-checkbox", PwProjectLeaderCheckbox);
