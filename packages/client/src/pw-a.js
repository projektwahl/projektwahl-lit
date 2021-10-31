// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { bootstrapCss } from ".";
import { HistoryController } from "./history-controller";
import { ifDefined } from "lit/directives/if-defined.js";

// TODO FIXME https://lit.dev/docs/components/events/#shadowdom-retargeting just use the approach shown there
export const aClick = (/** @type {MouseEvent} */ event) => {
  event.preventDefault();
  let target = /** @type {HTMLAnchorElement} */ (event.target);
  HistoryController.goto(new URL(target.href, window.location.href), {});
};

// this works really bad because bootstrap css styles usually need context information which is not there with this.
export class PwADontUse extends LitElement {
  /** @override */ static get properties() {
    return {
      href: { type: String },
      class: { type: String },
      role: { type: String },
      ariaCurrent: { type: String },
    };
  }

  // with this this may actually be usable again
  /** @protected @override */ createRenderRoot() {
    return this;
  }

  constructor() {
    super();

    /** @type {string} */
    this.href;

    /** @type {string | undefined} */
    this.class;

    /** @type {"button" | undefined} */
    this.role;

    /** @type {"page" | "step" | "location" | "date" | "time" | "true" | "false"} */
    this.ariaCurrent;
  }

  clickHandler = (/** @type {MouseEvent} */ event) => {
    event.preventDefault();
    HistoryController.goto(new URL(this.href, window.location.href), {});
  };

  /** @override */ render() {
    return html`${bootstrapCss}<a
        href=${ifDefined(this.href)}
        class=${ifDefined(this.class)}
        role=${ifDefined(this.role)}
        aria-current=${ifDefined(this.ariaCurrent)}
        @click=${this.clickHandler}
        ><slot></slot
      ></a>`;
  }
}
customElements.define("pw-a-dontuse", PwADontUse);
