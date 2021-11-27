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

    /* https://icons.getbootstrap.com/assets/icons/sort-up.svg */
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-sort-up' viewBox='0 0 16 16'%3E%3Cpath d='M3.5 12.5a.5.5 0 0 1-1 0V3.707L1.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.498.498 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L3.5 3.707V12.5zm3.5-9a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z'/%3E%3C/svg%3E");
    background-position: center center;
    background-repeat: no-repeat;
    background-size: contain;
    
    appearance: none;
  }
  
  .myCheckbox:checked {
    /* https://icons.getbootstrap.com/assets/icons/sort-down.svg */
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-sort-down' viewBox='0 0 16 16'%3E%3Cpath d='M3.5 2.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 11.293V2.5zm3.5 1a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z'/%3E%3C/svg%3E");
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