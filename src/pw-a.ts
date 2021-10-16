// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { bootstrapCss } from ".";
import { HistoryController } from "./history-controller";
import { ifDefined } from "lit/directives/if-defined.js";

export const aClick = (event: MouseEvent) => {
  event.preventDefault();
  HistoryController.goto(
    new URL((event.target as HTMLAnchorElement).href, window.location.href),
    {}
  );
};

// this works really bad because bootstrap css styles usually need context information which is not there with this.
@customElement("pw-a-dontuse")
export class PwADontUse extends LitElement {
  // with this this may actually be usable again
  protected override createRenderRoot() {
    return this;
  }

  @property({ type: String })
  href!: string;

  @property({ type: String })
  class?: string;

  @property({ type: String })
  role?: "button";

  @property({ type: String })
  override ariaCurrent!:
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
