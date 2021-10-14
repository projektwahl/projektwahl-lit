// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { bootstrapCss } from ".";
import { HistoryController } from "./history-controller";

// this works really bad because bootstrap css styles usually need context information which is not there with this.
export const aClick = (event: MouseEvent) => {
  event.preventDefault();
  HistoryController.goto(
    new URL((event.target as HTMLAnchorElement).href, window.location.href),
    {}
  );
};

@customElement("pw-a-dontuse")
export class PwADontUse extends LitElement {
  @property({ type: String })
  href: string;

  @property({ type: String })
  class: string;

  @property({ type: String })
  role: "button";

  @property({ type: String })
  ariaCurrent:
    | "page"
    | "step"
    | "location"
    | "date"
    | "time"
    | "true"
    | "false";

  clickHandler = (event: MouseEvent) => {
    event.preventDefault();
    HistoryController.goto(new URL(this.href, window.location.href), {});
  };

  render() {
    return html`${bootstrapCss}<a
        href=${this.href}
        class=${this.class}
        role=${this.role}
        aria-current=${this.ariaCurrent}
        @click=${this.clickHandler}
        ><slot></slot
      ></a>`;
  }
}
