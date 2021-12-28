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
import { aClick } from "../../pw-a.js";
import { msg } from "@lit/localize";
import "./pw-projects.js";
import type { routes } from "../../../lib/routes.js";
import type { z } from "zod";

export const pwProjects = async (url: URL) => {
  let result = await taskFunction([url.searchParams]);
  return html`<pw-projects .initial=${result}></pw-projects>`;
};

const taskFunction = async ([searchParams]: [URLSearchParams]
) => {
  let response = await fetch(
    new URL(`/api/v1/projects?${searchParams}`, window.location.href).toString(),
    {
      //agent: new Agent({rejectUnauthorized: false})
    }
  );
  return await response.json();
};

class PwProjects<T> extends LitElement {
  static override get properties() {
    return {
      task: { attribute: false },
      initial: { attribute: false },
      initialRender: { state: true },
      debouncedUrl: { state: true },
    };
  }

  private history;

  private _apiTask!: Task<[URLSearchParams], z.infer<typeof routes["/api/v1/projects"]["response"]>>;

  formRef;

  initialRender: boolean;

  initial: Promise<import("lit").TemplateResult> | undefined;

  constructor() {
    super();

    this.history = new HistoryController(this, /\/projects/);

    this.formRef = createRef<HTMLFormElement>();

    this.initialRender = false;

    this.initial;
  }

  static override styles = css`
    .table-cell-hover:hover {
      --bs-table-accent-bg: var(--bs-table-hover-bg);
      color: var(--bs-table-hover-color);
    }
  `;

  override render() {
    if (!this.initialRender) {
      this.initialRender = true;

      // TODO FIXME somehow debounce (as we currently do a full navigation this probably has to be done somewhere else)
      this._apiTask = new Task(
        this,
        taskFunction,
        () => [this.history.url.searchParams] as [URLSearchParams]
      );

      if (this.initial !== undefined) {
        // TODO FIXME goddammit the private attributes get minified
        this._apiTask.status = TaskStatus.COMPLETE;
        // @ts-expect-error See https://github.com/lit/lit/issues/2367
        this._apiTask.P = this.initial;
      }
    }

    return html`
      ${bootstrapCss}

      <div class="container">
        <pw-entitylist title=${msg("Projects")}>
          <div slot="buttons">
            <a
              @click=${aClick}
              class="btn btn-primary"
              href="/projects/create"
              role="button"
              >${msg("Create project")}</a
            >
          </div>
          <div slot="response">
            <form
              ${ref(this.formRef)}
              @input=${() => {
                const urlSearchParams = new URLSearchParams( // @ts-expect-error probably wrong typings
                  new FormData(this.formRef.value)
                );
                urlSearchParams.delete("order");
                this.history.url.searchParams
                  .getAll("order")
                  .forEach((v) => urlSearchParams.append("order", v));
                HistoryController.goto(
                  new URL(`?${urlSearchParams}`, window.location.href), {}
                );
              }}
              @submit=${(e: Event) => e.preventDefault()}
            >
              <table class="table">
                <thead>
                  <tr>
                    <!--
                      do not support this without javascript because there is literally zero useful ways to do this useful.
                      the only nice way is probably submit buttons that do things like "oder_by_id_asc" and then redirect to the new state (because you need to remove the old state)
                    -->
                    <th class="table-cell-hover p-0" scope="col">
                      <pw-order name="id" title=${msg("ID")}></pw-order>
                    </th>

                    <th class="table-cell-hover p-0" scope="col">
                      <pw-order name="title" title=${msg("Title")}></pw-order>
                    </th>

                    <th class="table-cell-hover p-0" scope="col">
                      <pw-order name="info" title=${msg("Info")}></pw-order>
                    </th>

                    <th class="table-cell-hover">${msg("Actions")}</th>
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
                        name="f_title"
                        type="text"
                        class="form-control"
                        id="projects-filter-{name}"
                        value=${this.history.url.searchParams.get("f_title")}
                      />
                    </th>

                    <th scope="col">
                      <input
                        name="f_info"
                        type="text"
                        class="form-control"
                        id="projects-filter-{name}"
                        value=${this.history.url.searchParams.get("f_info")}
                      />
                    </th>

                    <th scope="col">
                      
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
                            <p>${value.title}</p>
                          </td>
                          <td>
                            <p>${value.info}</p>
                          </td>
                          <td>
                            <a
                              class="btn btn-secondary"
                              href="/projects/edit/{entity.id}"
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


customElements.define("pw-projects", PwProjects);
