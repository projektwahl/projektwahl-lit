/*
projektwahl-lit is a software to manage choosing projects and automatically assigning people to projects.
Copyright (C) 2021 Moritz Hedtke

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see https://www.gnu.org/licenses/.
*/
/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import { css, html, TemplateResult } from "lit";
import { HistoryController } from "../history-controller.js";
import { createRef, ref } from "lit/directives/ref.js";
import { Task, TaskStatus } from "@lit-labs/task";
import type { entityRoutes, routes, ResponseType } from "../../lib/routes.js";
import type { z } from "zod";
import { PwForm } from "../form/pw-form.js";
import { bootstrapCss } from "../index.js";
import { msg, str } from "@lit/localize";
import { ifDefined } from "lit/directives/if-defined.js";
import { myFetch } from "../utils.js";

export class PwEntityList<
  P extends keyof typeof entityRoutes
> extends PwForm<P> {
  static override get properties() {
    return {
      task: { attribute: false },
      initial: { attribute: false },
      initialRender: { state: true },
      debouncedUrl: { state: true },
      ...super.properties,
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

  get actionText(): string {
    return "blub";
  }

  get url(): P {
    throw new Error("not implemented");
  }

  initialRender: boolean;

  initial: Promise<ResponseType<P>> | undefined;

  protected history;

  constructor() {
    super();

    this.history = new HistoryController(this, /.*/);

    this.initialRender = true;
  }

  override render() {
    if (this.initialRender) {
      this.initialRender = false;

      this._task = new Task(this, {
        task: async () => {
          const formDataEvent = new CustomEvent<
            z.infer<typeof entityRoutes[P]["request"]>
          >("myformdata", {
            bubbles: true,
            composed: true,
            detail: {
              // TODO FIXME put old data from url in here (at least for some of them)
              sorting: [],
              paginationCursor: null,
              filters: {},
              paginationDirection: "forwards",
              paginationLimit: 100,
            } as z.infer<typeof entityRoutes[P]["request"]>,
          });
          this.form.value?.dispatchEvent(formDataEvent);

          console.log(JSON.stringify(formDataEvent.detail));

          const result = await myFetch<P>(
            `${this.url}?${encodeURIComponent(
              JSON.stringify(formDataEvent.detail)
            )}`,
            {
              method: "GET",
            }
          );

          HistoryController.goto(
            new URL(
              `?${encodeURIComponent(JSON.stringify(formDataEvent.detail))}`,
              window.location.href
            ),
            {}
          );

          return result;
        },
        autoRun: false, // TODO FIXME this would be way simpler if there would be a no first run or so
      });

      if (this.initial !== undefined) {
        // TODO FIXME goddammit the private attributes get minified
        this._task.status = TaskStatus.COMPLETE;
        // @ts-expect-error See https://github.com/lit/lit/issues/2367
        this._task.p = this.initial;
        // TODO FIXMe if we set the currentArgs here somehow I think this may work
      } else {
        this._task.run()
      }
    }

    if (this.actionText === undefined) {
      throw new Error(msg("component not fully initialized"));
    }

    return html`
      ${bootstrapCss}
      <main class="container">
        <div
          style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1337;"
        >
          ${this._task.render({
            pending: () => html`<div
              class="spinner-grow text-primary"
              role="status"
            >
              <span class="visually-hidden">${msg("Loading...")}</span>
            </div>`,
          })}
        </div>

        <h1 class="text-center">${this.title}</h1>
        <div class="row justify-content-between">
          <div class="col-auto">${this.buttons}</div>
          <div class="col-3">
            <select
              @change=${async (event: Event) => {
                const url = new URL(window.location.href);
                const value = JSON.parse(url.search);
                value.limit = (event.target as HTMLSelectElement).value;
                url.search = JSON.stringify(value);
                HistoryController.goto(url, {});
                await this._task.run();
              }}
              .value=${this.history.url.searchParams.get("p_limit") ?? "10"}
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

        ${this.getErrors()}

        <form
          ${ref(this.form)}
          @input=${async () => {
            await this._task.run();
          }}
          @submit=${(e: Event) => e.preventDefault()}
        >
          <table class="table">
            <thead>
              ${this.head}
            </thead>
            <tbody>
              ${this.body}
            </tbody>
          </table>
        </form>

        ${this._task.value?.success
          ? html`
              <nav aria-label="${msg("navigation of user list")}">
                <ul class="pagination justify-content-center">
                  <li
                    class="page-item ${this._task.value?.data.previousCursor ===
                    null
                      ? "disabled"
                      : ""}"
                  >
                    <a
                      @click=${async (e: Event) => {
                        e.preventDefault();
                        const url = new URL(window.location.href);
                        if (this._task.value?.success) {
                          url.searchParams.set(
                            "p_cursor",
                            JSON.stringify(
                              this._task.value?.data.previousCursor
                            )
                          );
                        }
                        url.searchParams.set("p_direction", "backwards");
                        HistoryController.goto(url, {});
                        await this._task.run();
                      }}
                      class="page-link"
                      href="/"
                      aria-label="${msg("previous page")}"
                      tabindex=${ifDefined(
                        this._task.value?.data.previousCursor === null
                          ? undefined
                          : -1
                      )}
                      aria-disabled=${this._task.value?.data.previousCursor ===
                      null}
                    >
                      <span aria-hidden="true">&laquo;</span>
                    </a>
                  </li>
                  <li
                    class="page-item ${this._task.value?.data.nextCursor ===
                    null
                      ? "disabled"
                      : ""}"
                  >
                    <a
                      @click=${async (e: Event) => {
                        e.preventDefault();
                        const url = new URL(window.location.href);
                        if (this._task.value?.success) {
                          url.searchParams.set(
                            "p_cursor",
                            JSON.stringify(this._task.value?.data.nextCursor)
                          );
                        }
                        url.searchParams.set("p_direction", "forwards");
                        HistoryController.goto(url, {});
                        await this._task.run();
                      }}
                      class="page-link"
                      href="/"
                      aria-label="${msg("next page")}"
                      tabindex=${ifDefined(
                        this._task.value?.data.nextCursor === null
                          ? undefined
                          : -1
                      )}
                      aria-disabled=${this._task.value?.data.nextCursor ===
                      null}
                    >
                      <span aria-hidden="true">&raquo;</span>
                    </a>
                  </li>
                </ul>
              </nav>
            `
          : undefined}
      </main>
    `;
  }
}
