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
import { ref } from "lit/directives/ref.js";
import { Task, TaskStatus } from "@lit-labs/task";
import type { entityRoutes, ResponseType } from "../../lib/routes.js";
import type { z } from "zod";
import { PwForm } from "../form/pw-form.js";
import { bootstrapCss } from "../index.js";
import { msg, str } from "@lit/localize";
import { ifDefined } from "lit/directives/if-defined.js";
import { myFetch } from "../utils.js";
import { pwInput } from "../form/pw-input.js";

export const taskFunction = async <P extends keyof typeof entityRoutes>(
  apiUrl: P,
  url: URL,
  prefix: string,
) => {
  const data = JSON.parse(
    decodeURIComponent(
      url.search == ""
        ? "{}"
        : url.search.substring(1)
    )
  );
  const result = await myFetch<P>(`${apiUrl}?${encodeURIComponent(JSON.stringify(
    data[prefix] ?? {}
  ))}`, {
    method: "GET",
  });
  return result;
};

export class PwEntityList<
  P extends keyof typeof entityRoutes
> extends PwForm<P> {
  static override get properties() {
    return {
      task: { attribute: false },
      initial: { attribute: false },
      initialRender: { state: true },
      debouncedUrl: { state: true },
      prefix: { type: String },
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

  initial: ResponseType<P> | undefined;

  protected history;

  prefix: string;

  constructor() {
    super();

    this.prefix = "";

    this.history = new HistoryController(this, /.*/);

    this.initialRender = true;
  }

  override render() {
    if (this.prefix === undefined) {
      throw new Error("prefix not set")
    }

    if (this.initialRender) {
      this.initialRender = false;

      this._task = new Task(this, {
        task: async () => {
          const data = JSON.parse(
            decodeURIComponent(
              this.history.url.search == ""
                ? "{}"
                : this.history.url.search.substring(1)
            )
          );

          const formDataEvent = new CustomEvent<
            z.infer<typeof entityRoutes[P]["request"]>
          >("myformdata", {
            bubbles: false,
            detail: data[this.prefix] ?? {} as z.infer<typeof entityRoutes[P]["request"]>,
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
              `?${encodeURIComponent(JSON.stringify({
                ...data,
                [this.prefix]: formDataEvent.detail
              }))}`,
              window.location.href
            ),
            {}
          );

          return result;
        },
        autoRun: false,
        initialStatus:
          this.initial !== undefined ? TaskStatus.COMPLETE : TaskStatus.INITIAL,
        initialValue: this.initial,
      });

      if (this.initial === undefined) {
        void this._task.run();
      }
    }

    if (this.actionText === undefined) {
      throw new Error(msg("component not fully initialized"));
    }

    const data = JSON.parse(
      decodeURIComponent(
        this.history.url.search == ""
          ? "{}"
          : this.history.url.search.substring(1)
      )
    );

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

        <form
          ${ref(this.form)}
          @input=${async () => {
            await this._task.run();
          }}
          @submit=${(e: Event) => e.preventDefault()}
        >
          <div class="row justify-content-between">
            <div class="col-auto">${this.buttons}</div>
            <div class="col-3">
              ${pwInput<P, ["paginationLimit"]>({
                label: "Elemente pro Seite",
                name: ["paginationLimit"],
                task: this._task,
                type: "select",
                initial: data,
                options: [
                  {
                    text: ((count: number) => msg(str`${count} per page`))(10),
                    value: 10,
                  },
                  {
                    text: ((count: number) => msg(str`${count} per page`))(25),
                    value: 25,
                  },
                  {
                    text: ((count: number) => msg(str`${count} per page`))(50),
                    value: 50,
                  },
                  {
                    text: ((count: number) => msg(str`${count} per page`))(100),
                    value: 100,
                  },
                ],
              })}
            </div>
          </div>

          ${this.getErrors()}

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
                        if (this._task.value?.success) {
                          data.paginationCursor =
                            this._task.value?.data.previousCursor;
                          data.paginationDirection = "backwards";
                        }
                        HistoryController.goto(
                          new URL(
                            `?${encodeURIComponent(JSON.stringify(data))}`,
                            window.location.href
                          ),
                          {}
                        );
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
                        if (this._task.value?.success) {
                          data.paginationCursor =
                            this._task.value?.data.nextCursor;
                          data.paginationDirection = "forwards";
                        }
                        HistoryController.goto(
                          new URL(
                            `?${encodeURIComponent(JSON.stringify(data))}`,
                            window.location.href
                          ),
                          {}
                        );
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
