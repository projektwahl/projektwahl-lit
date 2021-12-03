// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement, noChange } from "lit";
import { bootstrapCss } from "../index.js";
import { setupHmr } from "../hmr.js";
import { css } from "lit";

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
  }

  /** @override */ render() {
    if (this.title === undefined || this.name === undefined) {
      throw new Error("component not fully initialized");
    }

    return html`
      ${bootstrapCss}
      <button name="${this.name}" type="button" class="btn w-100 text-start" id=${this.randomId}>
        <i
          class="bi-arrow-down-up"
          role="img"
          aria-label="Nach {title} sortieren"
        ></i> ${this.title}
      </button>
    `;
  }
}
customElements.define("pw-order", PwOrder);

setupHmr(PwOrder, import.meta.url);
