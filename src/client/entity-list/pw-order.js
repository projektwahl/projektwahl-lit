// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement, noChange } from "lit";
import { bootstrapCss } from "../index.js";
import { HistoryController } from "../history-controller.js";
import { isErr } from "../../lib/result.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { setupHmr } from "../hmr.js";
import { css } from "lit";

/** @template T */
export class PwOrder extends LitElement {
  /** @override */ static get properties() {
    return {

    };
  }

  constructor() {
    super();
  }

  /** @override */ static styles = css`input {
      width: 2em;
      margin-left: -2.5em;
      background-image: url("https://icons.getbootstrap.com/assets/icons/sort-up.svg");
      background-position: left center;
      border-radius: 2em;
      transition: background-position .15s ease-in-out;

      float: left;

      height: 1em;
      margin-top: .25em;
      background-color: #fff;
      background-repeat: no-repeat;
      background-size: contain;
      border: 1px solid rgba(0,0,0,.25);
      appearance: none;
      color-adjust: exact;

      margin: 0;
      font-family: inherit;
      font-size: inherit;
      line-height: inherit;
    }
    
    input:checked {
      background-position: right center;
      background-image: url("https://icons.getbootstrap.com/assets/icons/sort-down.svg");
    }
    `

  /** @override */ render() {
    if (
      false
    ) {
      throw new Error("component not fully initialized");
    }

    return html`
      ${bootstrapCss}

      <div class="form-check form-switch">
        <input type="checkbox">
      </div>
    `;
  }
}
customElements.define("pw-order", PwOrder);

setupHmr(PwOrder, import.meta.url);