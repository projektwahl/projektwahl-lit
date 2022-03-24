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
import { html, TemplateResult } from "lit";
import { bootstrapCss } from "../index.js";
import { HistoryController } from "../history-controller.js";
import { msg, str } from "@lit/localize";
import type { entityRoutes } from "../../lib/routes.js";
import type { z } from "zod";
import { parseRequestWithPrefix } from "./pw-entitylist.js";
import { PwElement } from "../pw-element.js";

// workaround see https://github.com/runem/lit-analyzer/issues/149#issuecomment-1006162839
export function pwOrder<P extends keyof typeof entityRoutes, X extends string>(
  props: Pick<
    PwOrder<P, X>,
    "url" | "name" | "prefix" | "title" | "refreshEntityList" | "value"
  >
) {
  const { url, name, title, refreshEntityList, prefix, value, ...rest } = props;
  let _ = rest;
  _ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
  return html`<pw-order
    .name=${name}
    .url=${url}
    prefix=${prefix}
    .title=${title}
    .value=${value}
    .refreshEntityList=${refreshEntityList}
  ></pw-order>`;
}

// TODO FIXME with prefix this doesnt work
// TODO FIXME paginationLimit also doesnt work with this
export class PwOrder<
  P extends keyof typeof entityRoutes,
  X extends string
> extends PwElement {
  static override get properties() {
    return {
      title: { attribute: false },
      name: { attribute: false },
      path: { attribute: false },
      refreshEntityList: { attribute: false },
      url: { attribute: false },
      prefix: { type: String },
    };
  }

  // because forms in shadow root are garbage
  protected override createRenderRoot() {
    return this;
  }

  prefix!: X;

  name!: z.infer<typeof entityRoutes[P]["request"]>["sorting"][number][0];

  value!: z.infer<typeof entityRoutes[P]["request"]>["sorting"][number][2];

  title!: string;

  randomId;

  history;

  refreshEntityList!: () => Promise<void>;

  url!: P;

  constructor() {
    super();

    this.randomId = "id" + Math.random().toString().replace(".", "");

    this.history = new HistoryController(this, /.*/);
  }

  override render() {
    if (
      this.title === undefined ||
      this.name === undefined ||
      this.prefix === undefined
    ) {
      throw new Error(msg("component not fully initialized"));
    }

    return html`
      ${bootstrapCss}
      <button
        @click=${async () => {
          // TODO FIXME put this into the history implementation?
          const data = parseRequestWithPrefix(
            this.url,
            this.prefix,
            this.history.url
          );

          const oldElementIndex = data[this.prefix]["sorting"].findIndex(
            ([e]) => e === this.name
          );
          
          if (oldElementIndex !== -1) {
            let oldElement: z.infer<typeof entityRoutes[P]["request"]>["sorting"][number] = data[this.prefix]["sorting"].splice(
              oldElementIndex,
              1
            )[0];

            switch (oldElement?.[1]) {
              case "DESC":
                break;
              case "ASC":
                data[this.prefix]["sorting"] = [
                  ...data[this.prefix]["sorting"],
                  ([[this.name, "DESC", this.value]]),
                ];
                break;
            }
          } else {
            data[this.prefix]["sorting"] = [
              ...data[this.prefix]["sorting"],
              ...([[this.name, "ASC", this.value]]),
            ];;
          }
        

          HistoryController.goto(
            new URL(
              `?${encodeURIComponent(JSON.stringify(data))}`,
              window.location.href
            ),
            {},
            true
          );
          // TODO FIXME use refreshentitylist / dont do this at all because we navigated anyways
          await this.refreshEntityList();
        }}
        name="${this.name.toString()}"
        type="button"
        class="btn w-100 text-start"
        id=${this.randomId}
      >
        ${(() => {
          const data = parseRequestWithPrefix(
            this.url,
            this.prefix,
            this.history.url
          );

          // @ts-expect-error mapped types probably needed
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
          const value = (data[this.prefix]["sorting"] ?? []).find(
            ([e]: [string, string]) => e === `${this.name}`
          )?.[1];
          return value === "ASC"
            ? html`<svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-arrow-up"
                viewBox="0 0 16 16"
                aria-label="${msg(str`sort by ${this.title}`)}"
              >
                <path
                  fill-rule="evenodd"
                  d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"
                />
              </svg>`
            : value === "DESC"
            ? html`<svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-arrow-down"
                viewBox="0 0 16 16"
                aria-label="${msg(str`sort by ${this.title}`)}"
              >
                <path
                  fill-rule="evenodd"
                  d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"
                />
              </svg>`
            : html`<svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-arrow-down-up"
                viewBox="0 0 16 16"
                aria-label="${msg(str`sort by ${this.title}`)}"
              >
                <path
                  fill-rule="evenodd"
                  d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5zm-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5z"
                />
              </svg>`;
        })()}
        ${this.title}
      </button>
    `;
  }
}
customElements.define("pw-order", PwOrder);
