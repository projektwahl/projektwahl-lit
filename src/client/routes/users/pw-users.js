// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import "../../form/pw-form.js";
import "../../entity-list/pw-entitylist.js";
import "../../entity-list/pw-order.js";
import { html, LitElement } from "lit";
import { bootstrapCss } from "../../index.js";
import { HistoryController } from "../../history-controller.js";
import { repeat } from "lit/directives/repeat.js";
import { setupHmr } from "../../hmr.js";
import { Task, TaskStatus } from "@lit-labs/task";
import { css } from "lit";
import {createRef, ref} from 'lit/directives/ref.js';
import { sleep } from "../../utils.js";
import { noChange } from "lit";

export const pwUsers = async (/** @type {URL} */ url) => {
  return html`<pw-users .initial=${await taskFunction([url.searchParams])}></pw-users>`
}

const taskFunction = async (/** @type {[URLSearchParams]} */ [searchParams]) => {
  let response = await fetch(new URL(`/api/v1/users?${searchParams}`, window.location.href));
  return await response.json();
}

export let PwUsers = class extends LitElement {
  /** @override */ static get properties() {
    return {
      task: { attribute: false },
      initial: { attribute: false },
      initialUsed: { state: true }
    };
  }
  
  constructor() {
    super();

    /**
     * @private
     */
    this.history = new HistoryController(this);

    /** @type {Timeout} */
    this.timer;

    /**
     * @private
     */
    this._apiTask;

    this.formRef = createRef();

    /** @type {boolean} */
    this.initialUsed = false;

    /**
     * @type {Promise<import("lit").TemplateResult> | undefined}
     */
    this.initial;
  }

  /** @override */ static styles = css`
    .table-cell-hover:hover {
      --bs-table-accent-bg: var(--bs-table-hover-bg);
      color: var(--bs-table-hover-color);
    }
  `;

  /** @override */ render() {
    this._apiTask = new Task(
      this,
      taskFunction,
      () => /** @type {[URLSearchParams]} */ ([this.history.url.searchParams])
    );
    if (this.initial !== undefined && !this.initialUsed) {
      this.initialUsed = true;
      this._apiTask.status = TaskStatus.COMPLETE;
      this._apiTask._value = this.initial;
    }
    return html`
      ${bootstrapCss}

      <div class="container">
        <pw-entitylist title="Nutzende">
          <div slot="response">
            <form ${ref(this.formRef)} @input=${(e) => {
              const urlSearchParams = new URLSearchParams(new FormData(this.formRef.value));

              clearTimeout(this.timer)
              this.timer = setTimeout(() => {
                HistoryController.goto(new URL(`?${urlSearchParams}`, window.location.href))
              }, 250);
            }}>
              <table class="table">
                <thead>
                  <tr>
                    <th class="table-cell-hover p-0" scope="col">
                      <pw-order name="o_id" title="ID"></pw-order>
                    </th>

                    <th class="table-cell-hover p-0" scope="col">
                      <pw-order name="o_name" title="Name"></pw-order>
                    </th>

                    <th class="table-cell-hover p-0" scope="col">
                      <pw-order name="o_type" title="Typ"></pw-order>
                    </th>

                    <th class="table-cell-hover">Aktionen</th>
                  </tr>

                  <tr>
                    <th scope="col">
                      <input
                        name="f_id"
                        type="text"
                        class="form-control"
                        id="projects-filter-{name}"
                      />
                    </th>

                    <th scope="col">
                      <input
                        name="f_name"
                        type="text"
                        class="form-control"
                        id="projects-filter-{name}"
                      />
                    </th>

                    <th scope="col">
                      <input
                        name="f_type"
                        type="text"
                        class="form-control"
                        id="projects-filter-{name}"
                      />
                    </th>

                    <th scope="col">
                      <button class="btn btn-secondary" type="submit">
                        <i class="bi bi-arrow-clockwise"></i>
                      </button>
                    </th>
                  </tr>
                </thead>

<!-- TODO FIXME add loading indicator overlay -->

                <tbody>
                  ${this._apiTask.render({
                    pending: () => { return noChange },
                    complete: (result) => { return result.map(
                        (value) => html`<tr>
                          <th scope="row">
                            <p>${value.id}</p>
                          </th>
                          <td>
                            <p>${value.username}</p>
                          </td>
                          <td>
                            <p>${value.type}</p>
                          </td>
                          <td>
                            <a
                              class="btn btn-secondary"
                              href="/users/edit/{entity.id}"
                              role="button"
                            >
                              <i class="bi bi-pen"></i>
                            </a>

                            <button class="btn btn-secondary" type="button">
                              <i class="bi bi-box-arrow-in-right"></i>
                            </button>
                          </td>
                        </tr>`
                      )},
                    error: () => {return html`error` },
                    initial: () => {return html`hi`},
                  })}
                </tbody>
              </table>
            </form>
          </div>
        </pw-entitylist>
      </div>
    `;
  }
};

setupHmr(PwUsers, import.meta.url);

customElements.define("pw-users", PwUsers);
