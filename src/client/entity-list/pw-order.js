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
      title: { type: String }
    };
  }

  constructor() {
    super();

    /** @type {string} */
    this.title;
  }

  /** @override */ static styles = css`
  .myCheckbox {
    width: 2.5em;
    height: 2.5em;

    background-image: url("https://icons.getbootstrap.com/assets/icons/sort-up.svg");
    background-position: center center;
    background-repeat: no-repeat;
    background-size: contain;
    
    appearance: none;
  }
  
  .myCheckbox:checked {
    background-image: url("https://icons.getbootstrap.com/assets/icons/sort-down.svg");
  }
  `

  /** @override */ render() {
    if (
      this.title === undefined
    ) {
      throw new Error("component not fully initialized");
    }

    return html`
      ${bootstrapCss}

  <div style="display: flex;">
  <input type="checkbox" class="myCheckbox" id="flexCheckDefault"><label class="w-100 pb-2 pt-2" for="flexCheckDefault">
    ${this.title}
  </label>
  </div>

    `;
  }
}
customElements.define("pw-order", PwOrder);

setupHmr(PwOrder, import.meta.url);