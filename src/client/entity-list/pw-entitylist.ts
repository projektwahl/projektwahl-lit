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
import { msg } from "@lit/localize";
import { ifDefined } from "lit/directives/if-defined.js";
import { myFetch } from "../utils.js";
import { pwInputSelect } from "../form/pw-input-select.js";
import { mappedFunctionCall, mappedIndexingSet } from "../../lib/result.js";

export type parseRequestWithPrefixType<PREFIX extends string> = {
  [P in keyof typeof entityRoutes]: z.infer<
    z.ZodObject<
      { [k in PREFIX]: typeof entityRoutes[P]["request"] },
      "passthrough",
      z.ZodTypeAny,
      { [k in PREFIX]: z.infer<typeof entityRoutes[P]["request"]> },
      Record<string, unknown>
    >
  >;
};

export type parseRequestWithPrefixSchemaType<PREFIX extends string> = {
  [P in keyof typeof entityRoutes]: z.ZodObject<
    { [k in PREFIX]: typeof entityRoutes[P]["request"] },
    "passthrough",
    z.ZodTypeAny,
    { [k in PREFIX]: z.infer<typeof entityRoutes[P]["request"]> },
    Record<string, unknown>
  >;
};

export const parseRequestWithPrefix = <
  P extends keyof typeof entityRoutes,
  PREFIX extends string
>(
  apiUrl: P,
  prefix: PREFIX,
  url: URL
): parseRequestWithPrefixType<PREFIX>[P] => {
  const schema: parseRequestWithPrefixSchemaType<PREFIX>[P] = z
    .object({})
    // @ts-expect-error wrong typings I assume
    .setKey(prefix, entityRoutes[apiUrl]["request"].default({ filters: {} }))
    .passthrough();
  const data: parseRequestWithPrefixType<PREFIX>[P] = mappedFunctionCall(
    schema,
    JSON.parse(
      decodeURIComponent(url.search == "" ? "{}" : url.search.substring(1))
    )
  );
  /*const a: z.infer<z.ZodObject<{[k in PREFIX]: typeof entityRoutes[P]["request"]}, "strict", z.ZodTypeAny, {[k in PREFIX]:  z.infer<typeof entityRoutes[P]["request"]>}, Record<string, unknown>>>[PREFIX] = data[prefix];
  const b: z.infer<typeof entityRoutes[P]["request"]> = a;*/
  return data;
};

export const taskFunction = async <
  P extends keyof typeof entityRoutes,
  PREFIX extends string
>(
  apiUrl: P,
  url: URL,
  prefix: PREFIX
) => {
  const result = await myFetch<P>(
    "GET",
    apiUrl,
    parseRequestWithPrefix(apiUrl, prefix, url)[prefix],
    {}
  );
  return result;
};

export class PwEntityList<
  P extends keyof typeof entityRoutes,
  X extends string
> extends PwForm<P> {
  static override get properties() {
    return {
      ...super.properties,
      task: {
        attribute: false,
        hasChanged: () => {
          return true;
        },
      },
      initial: { attribute: false },
      debouncedUrl: { state: true },
      prefix: { type: String },
    };
  }

  connectedCallback(): void {
    super.connectedCallback();
    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel("updateloginstate");
      bc.onmessage = (event) => {
        if (event.data === "login") {
          void this._task.run();
        }
      };
    }
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

  initial: ResponseType<P> | undefined;

  protected history;

  prefix!: X;

  constructor() {
    super();

    this.history = new HistoryController(this, /.*/);
  }

  override render() {
    console.log(`rerender pw-entitylist ${this.url} ${Math.random()}`);
    if (this.prefix === undefined) {
      throw new Error("prefix not set");
    }

    if (this.actionText === undefined) {
      throw new Error(msg("component not fully initialized"));
    }

    const data = parseRequestWithPrefix(
      this.url,
      this.prefix,
      this.history.url
    );

    if (!this.hasUpdated) {
      this.formData =
        parseRequestWithPrefix(this.url, this.prefix, this.history.url)[
          this.prefix
        ] ?? {};

      this._task = new Task(this, {
        task: async () => {
          HistoryController.goto(
            new URL(
              `?${encodeURIComponent(
                JSON.stringify({
                  ...data,
                  [this.prefix]: this.formData,
                })
              )}`,
              window.location.href
            ),
            this.history.state,
            true
          );

          const result = await myFetch<P>("GET", this.url, this.formData, {});

          return result;
        },
        autoRun: false, // TODO FIXME this breaks if you navigate to the same page (as it doesnt cause an update) - maybe we should autorun on url change?
        initialStatus:
          this.initial !== undefined ? TaskStatus.COMPLETE : TaskStatus.INITIAL,
        initialValue: this.initial,
      });

      if (this.initial === undefined) {
        void this._task.run();
      }
    }

    return html`
      ${bootstrapCss}
      <main class="container">
        <h1 class="text-center">${this.title}</h1>

        <form
          ${ref(this.form)}
          @refreshentitylist=${async () => {
            await this._task.run();
          }}
          @submit=${(e: Event) => e.preventDefault()}
        >
          <div class="row justify-content-start">
            <div class="col-auto">${this.buttons}</div>
          </div>

          <div class="row justify-content-end">
            <div class="col-4">
              ${pwInputSelect<P, number>({
                url: this.url,
                label: "Elemente pro Seite",
                name: ["paginationLimit"],
                get: (o) => o.paginationLimit,
                set: (o, v) => (o.paginationLimit = v),
                task: this._task,
                type: "select",
                initial: data[this.prefix],
                options: [
                  {
                    text: "10",
                    value: 10,
                  },
                  {
                    text: "25",
                    value: 25,
                  },
                  {
                    text: "50",
                    value: 50,
                  },
                  {
                    text: "100",
                    value: 100,
                  },
                ],
                defaultValue: 10,
              })}
            </div>
          </div>

          ${this.getErrors()}

          <div class="table-responsive">
            <table class="table">
              <thead>
                ${this.head}
              </thead>
              <tbody>
                ${this.body}
              </tbody>
            </table>
          </div>
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

                        const data = parseRequestWithPrefix(
                          this.url,
                          this.prefix,
                          this.history.url
                        );

                        if (!data[this.prefix]) {
                          mappedIndexingSet(data, this.prefix, {
                            filters: {},
                            paginationDirection: "forwards",
                            paginationLimit: 100,
                            sorting: [],
                            paginationCursor: null,
                          });
                        }
                        if (this._task.value?.success) {
                          data[this.prefix].paginationCursor =
                            this._task.value?.data.previousCursor;
                          data[this.prefix].paginationDirection = "backwards";
                        }
                        HistoryController.goto(
                          new URL(
                            `?${encodeURIComponent(JSON.stringify(data))}`,
                            window.location.href
                          ),
                          this.history.state,
                          true
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

                        const data = parseRequestWithPrefix(
                          this.url,
                          this.prefix,
                          this.history.url
                        );

                        if (!data[this.prefix]) {
                          mappedIndexingSet(data, this.prefix, {
                            filters: {},
                            paginationDirection: "forwards",
                            paginationLimit: 100,
                            sorting: [],
                            paginationCursor: null,
                          });
                        }
                        if (this._task.value?.success) {
                          data[this.prefix].paginationCursor =
                            this._task.value?.data.nextCursor;
                          data[this.prefix].paginationDirection = "forwards";
                        }
                        HistoryController.goto(
                          new URL(
                            `?${encodeURIComponent(JSON.stringify(data))}`,
                            window.location.href
                          ),
                          this.history.state,
                          true
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
