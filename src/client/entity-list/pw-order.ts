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
import { bootstrapCss } from "../index.js";
import { HistoryController } from "../history-controller.js";
import { msg, str } from "@lit/localize";
import type { entityRoutes } from "../../lib/routes.js";
import type { z } from "zod";
import { mappedTuple } from "../../lib/result.js";
import { PwInput } from "../form/pw-input.js";

type entitiesType1 = {
  [P in keyof typeof entityRoutes]: z.infer<
    typeof entityRoutes[P]["request"]
  >["sorting"][number][0];
};

type entitiesType15 = {
  [P in keyof typeof entityRoutes]: z.infer<
    typeof entityRoutes[P]["request"]
  >["sorting"][number][1];
};

type entitiesType2 = {
  [P in keyof typeof entityRoutes]: z.infer<
    typeof entityRoutes[P]["request"]
  >["sorting"][number][2];
};

type entitiesType3 = {
  [P in keyof typeof entityRoutes]: Array<
    z.infer<typeof entityRoutes[P]["request"]>["sorting"][number]
  >;
};

type entitiesType4 = {
  [P in keyof typeof entityRoutes]: z.infer<
    typeof entityRoutes[P]["request"]
  >["sorting"][number];
};

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
  >
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

// TODO FIXME with prefix this doesnt work
// TODO FIXME paginationLimit also doesnt work with this
export class PwOrder<
  P extends keyof typeof entityRoutes,
  X extends string
> extends PwInput<
  P,
  Array<z.infer<typeof entityRoutes[P]["request"]>["sorting"][number]>,
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

  // because forms in shadow root are garbage
  protected override createRenderRoot() {
    return this;
  }

  prefix!: X;

  orderBy!: entitiesType1[P];

  value!: entitiesType2[P];

  title!: string;

  randomId;

  history;

  url!: P;

  constructor() {
    super();

    this.randomId = "id" + Math.random().toString().replace(".", "");

    this.history = new HistoryController(this, /.*/);
  }

  mypwinputchangeDispatcher = () => {
    // @ts-expect-error fddfd
    const sorting: entitiesType3[P] = this.get(this.pwForm.formData);

    const oldElementIndex = sorting.findIndex(([e]) => e === this.orderBy);

    if (oldElementIndex !== -1) {
      // splice REMOVES the elements from the original array
      const oldElement: z.infer<
        typeof entityRoutes[P]["request"]
      >["sorting"][number] = sorting.splice(oldElementIndex, 1)[0];

      const theName: entitiesType1[P] = this.orderBy;
      const theValue: entitiesType2[P] = this.value;

      switch (oldElement?.[1]) {
        case "DESC":
          break;
        case "ASC": {
          //sorting.push([theName, "DESC", theValue])
          const adding = mappedTuple<
            P,
            entitiesType1,
            entitiesType15,
            entitiesType2
          >(this.url, theName, "DESC", theValue);

          // @ts-expect-error bruh
          const adding2: entitiesType4[P] = adding;

          sorting.push(adding2);

          break;
        }
      }
    } else {
      const adding = mappedTuple<
        P,
        entitiesType1,
        entitiesType15,
        entitiesType2
      >(this.url, this.orderBy, "ASC", this.value);

      // @ts-expect-error bruh
      const adding2: entitiesType4[P] = adding;

      sorting.push(adding2);
    }

    this.inputValue = sorting;
    this.set(this.pwForm.formData, this.inputValue);

    this.dispatchEvent(
      new CustomEvent("refreshentitylist", {
        bubbles: true,
        composed: true,
      })
    );
  };

  override render() {
    if (
      this.title === undefined ||
      this.orderBy === undefined ||
      this.prefix === undefined
    ) {
      throw new Error(msg("component not fully initialized"));
    }

    // stolen from pw-input.ts
    if (!this.hasUpdated) {
      // the input value contains the value that is shown to the user
      this.inputValue =
        this.initial !== undefined ? this.get(this.initial) : this.defaultValue;

      // in case this is an update set the value to undefined as it wasn't changed yet.
      this.set(this.pwForm.formData, this.inputValue);
    }

    return html`
      ${bootstrapCss}
      <button
        @click=${this.mypwinputchangeDispatcher}
        name="${this.orderBy.toString()}"
        type="button"
        class="btn w-100 text-start"
        id=${this.randomId}
      >
        ${(() => {
          // @ts-expect-error dfgg
          const sorting: entitiesType3[P] = this.inputValue;

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
