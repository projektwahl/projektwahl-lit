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

export let PwUsers = class extends LitElement {
  /** @override */ static get properties() {
    return {
      abortController: { state: true }
    };
  }

  constructor() {
    super();

    /**
     * @private
     */
    this.history = new HistoryController(this);

    /** @type {AbortController} */
    this.abortController = new AbortController();

    /**
     * @private
     */
    this._apiTask = new Task(
      this,
      // TODO FIXME it seems like the types here are wrong
      async ([searchParams, /** @type {AbortController} */ abortController]) => {
        // TODO FIXME this doesn't work for initial render
        // TODO FIXME we probably need debounce for the input parameters
        await sleep();

        if (abortController.signal.aborted) {
          console.log("aborted")
          return;
        }

        let response = await fetch(`/api/v1/users?${searchParams}`);
        return await response.json();
      },
      () => [this.history.url.searchParams, this.abortController]
    );

    this.formRef = createRef();
  }

  /** @override */ static styles = css`
    .table-cell-hover:hover {
      --bs-table-accent-bg: var(--bs-table-hover-bg);
      color: var(--bs-table-hover-color);
    }
  `;

  /** @override */ render() {
    return html`
      ${bootstrapCss}

      <div class="container">
        <pw-entitylist title="Nutzende">
          <div slot="response">
            <form ${ref(this.formRef)} @input=${(e) => {
              const urlSearchParams = new URLSearchParams(new FormData(this.formRef.value));

              this.abortController.abort();
              this.abortController = new AbortController();
              HistoryController.goto(new URL(`?${urlSearchParams}`, window.location.href))
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

                <tbody>
                  ${this._apiTask.render({
                    pending: () =>
                      repeat(
                        Array.from(
                          Array(
                            parseInt(
                              this.history.url.searchParams.get("count") || "25"
                            )
                          ),
                          (_, i) => i
                        ),
                        (item, index) => {
                          return html`<tr class="placeholder-glow">
                            <th scope="row">
                              <p>
                                <span class="placeholder rounded">1337</span>
                              </p>
                            </th>
                            <td>
                              <p>
                                <span class="placeholder rounded"
                                  >Long Full Name</span
                                >
                                <span class="placeholder rounded"
                                  >Long Full Name</span
                                >
                              </p>
                            </td>
                            <td>
                              <p>
                                <span class="placeholder rounded">helper</span>
                              </p>
                            </td>
                            <td>
                              <a
                                class="btn btn-secondary disabled"
                                aria-disabled="true"
                                href="/users/edit/{entity.id}"
                                role="button"
                              >
                                <i class="bi bi-pen"></i>
                              </a>

                              <button
                                disabled
                                class="btn btn-secondary"
                                type="button"
                              >
                                <i class="bi bi-box-arrow-in-right"></i>
                              </button>
                            </td>
                          </tr>`;
                        }
                      ),
                    complete: (result) =>
                      result.map(
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
                      ),
                    error: () => html`error`,
                    initial: () => html`hi`,
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
