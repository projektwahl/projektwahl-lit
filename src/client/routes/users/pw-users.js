// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import "../../form/pw-form.js";
import "../../entity-list/pw-entitylist.js";
import "../../entity-list/pw-order.js";
import { html, LitElement } from "lit";
import { bootstrapCss } from "../../index.js";
import { HistoryController } from "../../history-controller.js";
import { setupHmr } from "../../hmr.js";
import { Task, TaskStatus } from "@lit-labs/task";
import { css } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import { noChange } from "lit";

export const pwUsers = async (/** @type {URL} */ url) => {
  let result = await taskFunction([url.searchParams]);
  console.log(result);
  return html`<pw-users .initial=${result}></pw-users>`;
};

const taskFunction = async (
  /** @type {[URLSearchParams]} */ [searchParams]
) => {
  console.log(window.location.href);
  let response = await fetch(
    new URL(`/api/v1/users?${searchParams}`, window.location.href),
    {
      //agent: new Agent({rejectUnauthorized: false})
    }
  );
  return await response.json();
};

export let PwUsers = class extends LitElement {
  /** @override */ static get properties() {
    return {
      task: { attribute: false },
      initial: { attribute: false },
      initialRender: { state: true },
      debouncedUrl: { state: true },
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
    this.initialRender = false;

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
    if (!this.initialRender) {
      this.initialRender = true;

      // TODO FIXME somehow debounce (as we currently do a full navigation this probably has to be done somewhere else)
      this._apiTask = new Task(
        this,
        taskFunction,
        () => /** @type {[URLSearchParams]} */ ([this.history.url.searchParams])
      );

      if (this.initial !== undefined) {
        // TODO FIXME goddammit the private attributes get minified
        this._apiTask.status = TaskStatus.COMPLETE;
        this._apiTask.P = this.initial;
      }
    }
    console.log(this._apiTask);

    return html`
      ${bootstrapCss}

      <div class="container">
        <pw-entitylist title="Nutzende">
          <div slot="response">
            <form
              ${ref(this.formRef)}
              @input=${() => {
                const urlSearchParams = new URLSearchParams(
                  new FormData(this.formRef.value)
                );
                urlSearchParams.delete("order");
                this.history.url.searchParams
                  .getAll("order")
                  .forEach((v) => urlSearchParams.append("order", v));
                HistoryController.goto(
                  new URL(`?${urlSearchParams}`, window.location.href)
                );
              }}
              @submit=${(e) => e.preventDefault()}
            >
              <table class="table">
                <thead>
                  <tr>
                    <!--
                      do not support this without javascript because there is literally zero useful ways to do this useful.
                      the only nice way is probably submit buttons that do things like "oder_by_id_asc" and then redirect to the new state (because you need to remove the old state)
                    -->
                    <th class="table-cell-hover p-0" scope="col">
                      <pw-order name="id" title="ID"></pw-order>
                    </th>

                    <th class="table-cell-hover p-0" scope="col">
                      <pw-order name="username" title="Name"></pw-order>
                    </th>

                    <th class="table-cell-hover p-0" scope="col">
                      <pw-order name="type" title="Typ"></pw-order>
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
                        value=${this.history.url.searchParams.get("f_id")}
                      />
                    </th>

                    <th scope="col">
                      <input
                        name="f_username"
                        type="text"
                        class="form-control"
                        id="projects-filter-{name}"
                        value=${this.history.url.searchParams.get("f_username")}
                      />
                    </th>

                    <th scope="col">
                      <input
                        name="f_type"
                        type="text"
                        class="form-control"
                        id="projects-filter-{name}"
                        value=${this.history.url.searchParams.get("f_type")}
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
                    pending: () => {
                      return noChange;
                    },
                    complete: (result) => {
                      return result.map(
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
                      );
                    },
                    error: () => {
                      return html`error`;
                    },
                    initial: () => {
                      return html`hi`;
                    },
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
