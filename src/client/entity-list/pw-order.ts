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
import { html } from "lit";
import { HistoryController } from "../history-controller.js";
import { msg, str } from "@lit/localize";
import { entityRoutes, routes } from "../../lib/routes.js";
import type { z } from "zod";
import { mappedTuple } from "../../lib/result.js";
import { PwInput } from "../form/pw-input.js";

type EntitySorting0<K extends keyof (typeof entityRoutes)> = {
  [P in K]: z.infer<
    typeof entityRoutes[P]["request"]
  >["sorting"][number][0];
}[K];

type EntitySorting1<K extends keyof (typeof entityRoutes)> = {
  [P in K]: z.infer<
    typeof entityRoutes[P]["request"]
  >["sorting"][number][1];
}[K];

type EntitySorting2<K extends keyof (typeof entityRoutes)> = {
  [P in K]: z.infer<
    typeof entityRoutes[P]["request"]
  >["sorting"][number][2];
}[K];

type EntitySortingAll<K extends keyof (typeof entityRoutes)> = {
  [P in K]: z.infer<
    typeof entityRoutes[P]["request"]
  >["sorting"];
}[K];

type EntitySorting<K extends keyof (typeof entityRoutes)> = { [P in K]: [
  EntitySorting0<P>,
  EntitySorting1<P>,
  EntitySorting2<P>,
] }[K];

// workaround see https://github.com/runem/lit-analyzer/issues/149#issuecomment-1006162839
export function pwOrder<P extends keyof typeof entityRoutes, X extends string>(
  props: Pick<
    PwOrder<P, X>,
    | "url"
    | "name"
    | "prefix"
    | "title"
    | "value"
    | "orderBy"
    | "get"
    | "set"
    | "initial"
    | "defaultValue"
  >,
) {
  const {
    url,
    name,
    title,
    prefix,
    value,
    orderBy,
    get,
    set,
    initial,
    defaultValue,
    ...rest
  } = props;
  let _ = rest;
  _ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
  return html`<pw-order
    .name=${name}
    .url=${url}
    .get=${get}
    .set=${set}
    .prefix=${prefix}
    .title=${title}
    .value=${value}
    .orderBy=${orderBy}
    .initial=${initial}
    .defaultValue=${defaultValue}
  ></pw-order>`;
}

export class PwOrder<
  P extends keyof typeof entityRoutes,
  X extends string,
> extends PwInput<
  P,
  EntitySorting<P>[],
  HTMLButtonElement
> {
  static override get properties() {
    return {
      ...super.properties,
      title: { attribute: false },
      path: { attribute: false },
      url: { attribute: false },
      prefix: { attribute: false },
      orderBy: { attribute: false },
    };
  }

  prefix!: X;

  orderBy!: EntitySorting0<P>;

  value!: EntitySorting2<P>;

  title!: string;

  randomId;

  history;

  url!: P;

  constructor() {
    super();

    this.randomId = `id${Math.random().toString().replace(".", "")}`;

    this.history = new HistoryController(this, /.*/);
  }

  mypwinputchangeDispatcher = () => {
    const partialFormData: z.infer<typeof routes[P]["partialRequest"]> = this.pwForm.formData;
    const formData: z.infer<typeof routes[P]["request"]> = routes[this.url].request.parse(partialFormData);
    const sorting: EntitySorting<P>[] = this.get(formData);

    const oldElementIndex = sorting.findIndex(([e]) => e === this.orderBy);

    if (oldElementIndex !== -1) {
      // splice REMOVES the elements from the original array
      const oldElement: EntitySorting<P> = sorting.splice(oldElementIndex, 1)[0];

      const theName = this.orderBy;
      const theValue = this.value;
      const desc: EntitySorting1<P> = "DESC";

      switch (oldElement[1]) {
        case "DESC":
          break;
        case "ASC": {
          const sortingPush: EntitySorting<P> = [theName, desc, theValue];
          sorting.push(sortingPush)
         
          break;
        }
      }
    } else {
      const asc: EntitySorting1<P> = "ASC";
      const adding: EntitySorting<P> = [this.orderBy, asc, this.value];
      sorting.push(adding);
    }

    this.inputValue = sorting;
    this.set(this.pwForm.formData, this.inputValue);

    this.dispatchEvent(
      new CustomEvent("refreshentitylist", {
        bubbles: true,
        composed: true,
      }),
    );
  };

  // TODO FIXME we're not able to reset this so move this somewhere else
  protected willUpdate(changedProperties: Map<PropertyKey, unknown>): void {
    if (changedProperties.has("initial")) {
      // the input value contains the value that is shown to the user
      this.inputValue =
        this.initial !== undefined ? this.get(this.initial) : this.defaultValue;

      // in case this is an update set the value to undefined as it wasn't changed yet.
      this.set(this.pwForm.formData, this.inputValue);
    }
  }

  override render() {
    if (
      this.title === undefined ||
      this.orderBy === undefined ||
      this.prefix === undefined
    ) {
      throw new Error(msg("component not fully initialized"));
    }

    return html`
      <button
        @click=${this.mypwinputchangeDispatcher}
        name="${this.orderBy.toString()}"
        type="button"
        class="btn w-100 text-start"
        id=${this.randomId}
      >
        ${(() => {
          const sorting = this.inputValue;

          const value = sorting.find(([e]) => e === `${this.orderBy}`)?.[1];
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
