// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { bootstrapCss } from ".";
import { HistoryController } from "./history-controller";

@customElement("pw-a")
export class PwA extends LitElement {
  @property({ type: String })
  href: string;

  @property({ type: String })
  class: string;

  @property({ type: String })
  role: "button";

  clickHandler = (event: MouseEvent) => {
    event.preventDefault();
    HistoryController.goto(new URL(this.href, window.location.href), {});
  };

  render() {
    return html`${bootstrapCss}<a
        href=${this.href}
        class=${this.class}
        role=${this.role}
        @click=${this.clickHandler}
        ><slot></slot
      ></a>`;
  }
}
