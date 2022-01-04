/*
projektwahl-lit is a software to manage choosing projects and automatically assigning people to projects.
Copyright (C) 2021 Moritz Hedtke

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see https://www.gnu.org/licenses/.
*/
/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
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

  ariaCurrent!:
    | "page"
    | "step"
    | "location"
    | "date"
    | "time"
    | "true"
    | "false";

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
//customElements.define("pw-a-dontuse", PwADontUse);
