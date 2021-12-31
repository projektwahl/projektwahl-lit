// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement } from "lit";
import { bootstrapCss } from "./index.js";
import { HistoryController } from "./history-controller.js";
import { ifDefined } from "lit/directives/if-defined.js";

// TODO FIXME https://lit.dev/docs/components/events/#shadowdom-retargeting just use the approach shown there
export const aClick = (event: MouseEvent) => {
  event.preventDefault();
  let target = (event.target as HTMLElement).closest("a");
  HistoryController.goto(new URL(target!.href, window.location.href), {});
};

// this works really bad because bootstrap css styles usually need context information which is not there with this.
export class PwADontUse extends LitElement {
  static override get properties() {
    return {
      href: { type: String },
      class: { type: String },
      role: { type: String },
      ariaCurrent: { type: String },
    };
  }

  // with this this may actually be usable again
  protected override createRenderRoot() {
    return this;
  }

  href!: string;

  class!: string | undefined;

  role: "button" | undefined;

  ariaCurrent!: "page" | "step" | "location" | "date" | "time" | "true" | "false"

  constructor() {
    super();
  }

  clickHandler = (event: MouseEvent) => {
    event.preventDefault();
    HistoryController.goto(new URL(this.href, window.location.href), {});
  };

  override render() {
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
