// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement } from "lit";
import { bootstrapCss } from "../index.js";
import { setupHmr } from "../hmr.js";
import { HistoryController } from "../history-controller.js";
import { msg, str } from "@lit/localize";

/** @template T */
export class PwOrder extends LitElement {
  /** @override */ static get properties() {
    return {
      title: { type: String },
      name: { type: String },
    };
  }

  // because forms in shadow root are garbage
  /** @protected @override */ createRenderRoot() {
    return this;
  }

  constructor() {
    super();

    /** @type {string} */
    this.title;

    /** @type {string} */
    this.name;

    /** @type {string} */
    this.randomId = "id" + Math.random().toString().replace(".", "");

    this.history = new HistoryController(this, /.*/);
  }

  /** @override */ render() {
    if (this.title === undefined || this.name === undefined) {
      throw new Error(msg("component not fully initialized"));
    }

    return html`
      ${bootstrapCss}
      <button
        @click=${() => {
          const urlSearchParams = this.history.url.searchParams;

          let order = [...urlSearchParams.getAll("order")];

          let oldElementIndex = order.findIndex((e) =>
            e.startsWith(this.name + "-")
          );
          let oldElement;
          if (oldElementIndex == -1) {
            oldElement = `${this.name}-downup`;
          } else {
            oldElement = order.splice(oldElementIndex, 1)[0];
          }
          let newElement;
          switch (oldElement.split("-")[1]) {
            case "downup":
              newElement = "ASC";
              break;
            case "ASC":
              newElement = "DESC";
              break;
            default:
              newElement = null;
          }
          urlSearchParams.delete("order");
          [
            ...order,
            ...(newElement !== null
              ? [oldElement.split("-")[0] + "-" + newElement]
              : []),
          ].forEach((v) => urlSearchParams.append("order", v));

          HistoryController.goto(
            new URL(`?${urlSearchParams}`, window.location.href)
          );
        }}
        name="${this.name}"
        type="button"
        class="btn w-100 text-start"
        id=${this.randomId}
      >
        <i
          class="bi-arrow-${(() => {
            let value = this.history.url.searchParams
              .getAll("order")
              .find((e) => e.startsWith(this.name + "-"))
              ?.split("-")[1];
            return value === "ASC"
              ? "up"
              : value === "DESC"
              ? "down"
              : "down-up";
          })()}"
          role="img"
          aria-label="${msg(str`sort by ${this.title}`)}"
        ></i>
        ${this.title}
      </button>
    `;
  }
}
customElements.define("pw-order", PwOrder);
