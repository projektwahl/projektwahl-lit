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

export let PwUsers = class extends LitElement {
  /** @override */ static get properties() {
    return {};
  }

  constructor() {
    super();

    /**
     * @private
     */
    this.history = new HistoryController(this);

    /**
     * @private
     */
    this._apiTask = new Task(
      this,
      ([searchParams]) =>
        fetch(`/api/v1/users?${searchParams}`).then((response) =>
          response.json()
        ),
      () => [this.history.url.searchParams]
    );
  }

  /** @override */ static styles = css`
  .table-cell-hover:hover {
		--bs-table-accent-bg: var(--bs-table-hover-bg);
		color: var(--bs-table-hover-color);
	}
  `
  
  /** @override */ render() {
    return html`
      ${bootstrapCss}

      <div class="container">

      <pw-entitylist title="Nutzende">
        <div slot="response">
          <table class="table">
            <thead>
              <tr>

<th class="table-cell-hover" scope="col">
                <pw-order title="ID"></pw-order>
                </th>


<th class="table-cell-hover" scope="col">
                <pw-order title="Name"></pw-order>
                </th>


<th class="table-cell-hover" scope="col">
                <pw-order title="Typ"></pw-order>
                </th>

                <th class="">Aktionen</th>
              </tr>

              <tr>
                <th scope="col">
                  <input
                    bind:value="{$query.filters[name]}"
                    type="text"
                    class="form-control"
                    id="projects-filter-{name}"
                  />
                </th>

                <th scope="col">
                  <input
                    bind:value="{$query.filters[name]}"
                    type="text"
                    class="form-control"
                    id="projects-filter-{name}"
                  />
                </th>

                <th scope="col">
                  <input
                    bind:value="{$query.filters[name]}"
                    type="text"
                    class="form-control"
                    id="projects-filter-{name}"
                  />
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
                        <p>
                          ${value.id}
                        </p>
                      </th>
                      <td>
                        <p>
                          ${value.username}
                        </p>
                      </td>
                      <td>
                        <p>
                          ${value.type}
                        </p>
                      </td>
                      <td>
                        <a
                          class="btn btn-secondary"
                          href="/users/edit/{entity.id}"
                          role="button"
                        >
                          <i class="bi bi-pen"></i>
                        </a>

                        <button
                          class="btn btn-secondary"
                          type="button"
                        >
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
        </div>
      </pw-entitylist>

      </div>
    `;
  }
};

setupHmr(PwUsers, import.meta.url);

customElements.define("pw-users", PwUsers);
