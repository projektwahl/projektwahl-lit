// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { css, html, LitElement, TemplateResult } from "lit";
import { bootstrapCss } from "../index.js";
import { HistoryController } from "../history-controller.js";
import { setupHmr } from "../hmr.js";
import { msg, str } from "@lit/localize";
import { createRef, ref } from "lit/directives/ref.js";
import { Task, TaskStatus } from "@lit-labs/task";
import type { routes } from "../../lib/routes.js";
import type { z } from "zod";
import { classMap } from "lit/directives/class-map.js";

export class PwEntityList<P extends keyof typeof routes> extends LitElement {
  static override get properties() {
    return {
      task: { attribute: false },
      initial: { attribute: false },
      initialRender: { state: true },
      debouncedUrl: { state: true },
    };
  }

  static override styles = css`
    .table-cell-hover:hover {
      --bs-table-accent-bg: var(--bs-table-hover-bg);
      color: var(--bs-table-hover-color);
    }
  `;

  get title(): string {
    throw new Error("not implemented");
  }

  get buttons(): TemplateResult {
    throw new Error("not implemented");
  }

  get head(): TemplateResult {
    throw new Error("not implemented");
  }

  get body(): TemplateResult {
    throw new Error("not implemented");
  }

  protected _apiTask!: Task<
    [URLSearchParams],
    z.infer<typeof routes[P]["response"]>
  >;

  formRef;

  initialRender: boolean;

  initial: Promise<z.infer<typeof routes[P]["response"]>> | undefined;

  protected history;

  taskFunction: ([searchParams]: [URLSearchParams]) => Promise<any>;

  constructor(
    taskFunction: ([searchParams]: [URLSearchParams]) => Promise<any>
  ) {
    super();

    this.taskFunction = taskFunction;

    this.history = new HistoryController(this, /.*/);

    this.formRef = createRef();

    this.initialRender = false;
  }

  override render() {
    if (!this.initialRender) {
      this.initialRender = true;

      // TODO FIXME because of page navigation this currently loads twice
      // TODO FIXME somehow debounce (as we currently do a full navigation this probably has to be done somewhere else)
      // TODO FIXME probably just completely remove and let page navigation do this
      this._apiTask = new Task(
        this,
        this.taskFunction,
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
        <div
          style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);"
        >
          ${
            /*true
          ? ""
          : html`<div class="spinner-grow text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
        </div>`*/ ""
          }
        </div>
        <h1 class="text-center">${this.title}</h1>
        <div class="row justify-content-between">
          <div class="col-auto">${this.buttons}</div>
          <div class="col-3">
            <select
              @change=${(event: Event) => {
                const url = new URL(window.location.href);
                url.searchParams.set(
                  "p_limit",
                  (event.target as HTMLSelectElement).value
                );
                HistoryController.goto(url, {});
              }}
              .value=${this.history.url.searchParams.get("p_limit")}
              class="form-select"
              aria-label="Default select example"
            >
              <option value="10">
                ${((count: number) => msg(str`${count} per page`))(10)}
              </option>
              <option value="25">
                ${((count: number) => msg(str`${count} per page`))(25)}
              </option>
              <option value="50">
                ${((count: number) => msg(str`${count} per page`))(50)}
              </option>
              <option selected value="100">
                ${((count: number) => msg(str`${count} per page`))(100)}
              </option>
            </select>
          </div>
        </div>

        <form
          ${ref(this.formRef)}
          @input=${() => {
            // TODO FIXME convert to the better form api (then it needs urlsearchparams support)
            const urlSearchParams = new URLSearchParams( // @ts-expect-error probably wrong typings
              new FormData(this.formRef.value)
            );
            urlSearchParams.delete("order");
            this.history.url.searchParams
              .getAll("order")
              .forEach((v) => urlSearchParams.append("order", v));
            // @ts-expect-error terrible quick hack - don't look at this
            if (this.projectId) {
              if (urlSearchParams.has("f_project_leader_id")) {
                // @ts-expect-error you know
                urlSearchParams.set("f_project_leader_id", this.projectId)
              }
            }
            HistoryController.goto(
              new URL(`?${urlSearchParams}`, window.location.href),
              {}
            );
          }}
          @submit=${(e: Event) => e.preventDefault()}
        >
          <table class="table">
            <thead>
              ${this.head}
            </thead>

            <!-- TODO FIXME add loading indicator overlay -->

            <tbody>
              ${this.body}
            </tbody>
          </table>
        </form>

        <nav aria-label="${msg("navigation of user list")}">
          <ul class="pagination justify-content-center">
            <li
              class="page-item ${classMap({
                disabled: this._apiTask.value?.previousCursor === null,
              })}"
            >
              <a
                @click=${(e: Event) => {
                  e.preventDefault();
                  const url = new URL(window.location.href);
                  url.searchParams.set(
                    "p_cursor",
                    JSON.stringify(this._apiTask.value?.previousCursor)
                  );
                  url.searchParams.set("p_direction", "backwards");
                  HistoryController.goto(url, {});
                }}
                class="page-link"
                href="/"
                aria-label="${msg("previous page")}"
                tabindex=${this._apiTask.value?.previousCursor === null
                  ? undefined
                  : -1}
                aria-disabled=${this._apiTask.value?.previousCursor === null}
              >
                <span aria-hidden="true">&laquo;</span>
              </a>
            </li>
            <li
              class="page-item ${classMap({
                disabled: this._apiTask.value?.nextCursor === null,
              })}"
            >
              <a
                @click=${(e: Event) => {
                  e.preventDefault();
                  const url = new URL(window.location.href);
                  url.searchParams.set(
                    "p_cursor",
                    JSON.stringify(this._apiTask.value?.nextCursor)
                  );
                  url.searchParams.set("p_direction", "forwards");
                  HistoryController.goto(url, {});
                }}
                class="page-link"
                href="/"
                aria-label="${msg("next page")}"
                tabindex=${this._apiTask.value?.nextCursor === null
                  ? undefined
                  : -1}
                aria-disabled=${this._apiTask.value?.nextCursor === null}
              >
                <span aria-hidden="true">&raquo;</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    `;
  }
}

customElements.define("pw-entitylist", PwEntityList);
