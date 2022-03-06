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
import { Task, TaskStatus } from "@dev.mohe/task";
import { entityRoutes, ResponseType } from "../../lib/routes.js";
import { z } from "zod";
import { PwForm } from "../form/pw-form.js";
import { bootstrapCss } from "../index.js";
import { msg, str } from "@lit/localize";
import { ifDefined } from "lit/directives/if-defined.js";
import { myFetch } from "../utils.js";
import { pwInput } from "../form/pw-input.js";

export const taskFunction = async <
  P extends keyof typeof entityRoutes,
  PREFIX extends string
>(
  apiUrl: P,
  url: URL,
  prefix: PREFIX
) => {
  // @ts-expect-error https://github.com/colinhacks/zod/issues/153#issuecomment-863569536
  const schema: z.ZodObject<{[k in PREFIX]: typeof entityRoutes[P]["request"]}, "strict", z.ZodTypeAny, {[k in PREFIX]: z.infer<typeof entityRoutes[P]["request"]>}, Record<string, unknown>> = z
    .object({
    }).strict().setKey(prefix, entityRoutes[apiUrl]["request"]).strict();
  const data: z.infer<z.ZodObject<{[k in PREFIX]: typeof entityRoutes[P]["request"]}, "strict", z.ZodTypeAny, {[k in PREFIX]: z.infer<typeof entityRoutes[P]["request"]>}, Record<string, unknown>>> = schema.parse(
      JSON.parse(
        decodeURIComponent(url.search == "" ? "{}" : url.search.substring(1))
      )
    );
  const a: z.infer<z.ZodObject<{[k in PREFIX]: typeof entityRoutes[P]["request"]}, "strict", z.ZodTypeAny, {[k in PREFIX]:  z.infer<typeof entityRoutes[P]["request"]>}, Record<string, unknown>>>[PREFIX] = data[prefix];
  const b: z.infer<typeof entityRoutes[P]["request"]> = a;
  const result = await myFetch<P>("GET", apiUrl, b, {});
  return result;
};

export class PwEntityList<
  P extends keyof typeof entityRoutes,
  X extends string
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

  connectedCallback(): void {
    super.connectedCallback();
    const bc = new BroadcastChannel("updateloginstate");
    bc.onmessage = (event) => {
      if (event.data === "login") {
        void this._task.run();
      }
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

  prefix!: X;

  constructor() {
    super();

    this.history = new HistoryController(this, /.*/);

    this.initialRender = true;
  }

  override render() {
    if (this.prefix === undefined) {
      throw new Error("prefix not set");
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
            detail: data[this.prefix] ?? {},
          });
          this.form.value?.dispatchEvent(formDataEvent);

          console.log(JSON.stringify(formDataEvent.detail));

          const result = await myFetch<P>(
            "GET",
            this.url,
            formDataEvent.detail,
            {}
          );

          HistoryController.goto(
            new URL(
              `?${encodeURIComponent(
                JSON.stringify({
                  ...data,
                  [this.prefix]: formDataEvent.detail,
                })
              )}`,
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
          @refreshentitylist=${async () => {
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

        ${this._task.status !== TaskStatus.COMPLETE || this._task.value?.success
          ? html`
              <nav aria-label="${msg("navigation of user list")}">
                <ul class="pagination justify-content-center">
                  <li
                    class="page-item ${this._task.render({
                      pending: () => "disabled",
                      complete: (result) =>
                        result.success && result.data.previousCursor === null
                          ? "disabled"
                          : "",
                    })}"
                  >
                    <a
                      @click=${async (e: Event) => {
                        e.preventDefault();

                        const data = JSON.parse(
                          decodeURIComponent(
                            this.history.url.search == ""
                              ? "{}"
                              : this.history.url.search.substring(1)
                          )
                        );
                        if (!data[this.prefix]) {
                          data[this.prefix] = {};
                        }
                        if (this._task.value?.success) {
                          data[this.prefix].paginationCursor =
                            this._task.value?.data.previousCursor;
                          data[this.prefix].paginationDirection = "backwards";
                        }
                        console.log(data);
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
                        this._task.render({
                          pending: () => undefined,
                          complete: (result) =>
                            result.success &&
                            result.data?.previousCursor === null
                              ? undefined
                              : -1,
                        })
                      )}
                      aria-disabled=${this._task.render({
                        pending: () => true,
                        complete: (result) =>
                          result.success &&
                          result.data?.previousCursor === null,
                      })}
                    >
                      <span aria-hidden="true">&laquo;</span>
                    </a>
                  </li>
                  <li
                    class="page-item ${this._task.render({
                      pending: () => "disabled",
                      complete: (result) =>
                        result.success && result.data?.nextCursor === null
                          ? "disabled"
                          : "",
                    })}"
                  >
                    <a
                      @click=${async (e: Event) => {
                        e.preventDefault();

                        const data = JSON.parse(
                          decodeURIComponent(
                            this.history.url.search == ""
                              ? "{}"
                              : this.history.url.search.substring(1)
                          )
                        );
                        if (!data[this.prefix]) {
                          data[this.prefix] = {};
                        }
                        if (this._task.value?.success) {
                          data[this.prefix].paginationCursor =
                            this._task.value?.data.nextCursor;
                          data[this.prefix].paginationDirection = "forwards";
                        }
                        console.log(data);
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
                        this._task.render({
                          pending: () => undefined,
                          complete: (result) =>
                            result.success && result.data?.nextCursor === null
                              ? undefined
                              : -1,
                        })
                      )}
                      aria-disabled=${this._task.render({
                        pending: () => true,
                        complete: (result) =>
                          result.success && result.data?.nextCursor === null,
                      })}
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
