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
import { msg } from "@lit/localize";
import { html, LitElement } from "lit";
import { setupHmr } from "../hmr.js";
import { bootstrapCss } from "../index.js";
import { aClick } from "../pw-a.js";
import { myFetch } from "../utils.js";
import { isPrimitive } from "lit-html/directive-helpers.js";
import { AsyncDirective } from "lit/async-directive.js";

export const PwWelcome = setupHmr(
  "PwWelcome",
  class PwWelcome extends LitElement {
    bruh: any = aClick;
    bruh2: any = myFetch;
    b1 = isPrimitive;
    b2 = AsyncDirective;

    protected render() {
      return html`
        ${bootstrapCss}

        <div class="container">
          <h1 class="text-center">${msg("Welcome")}</h1>

          <p>
            ${msg(
              "This is some boilerplate welcome text that can be adapted by changing the translation."
            )}
          </p>

          <br />
          <h2 class="text-center">${msg("Credits")}</h2>

          <p>
            projektwahl-lit is a software to manage choosing projects and
            automatically assigning people to projects.<br />
            Copyright (C) 2021 Moritz Hedtke &lt;Moritz.Hedtke at t-online dot
            de&gt;
          </p>

          <p>
            This program is free software: you can redistribute it and/or modify
            it under the terms of the GNU Affero General Public License as
            published by the Free Software Foundation, either version 3 of the
            License, or (at your option) any later version.
          </p>

          <p>
            This program is distributed in the hope that it will be useful, but
            WITHOUT ANY WARRANTY; without even the implied warranty of
            MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
            Affero General Public License for more details.
          </p>

          <p>
            You should have received a copy of the GNU Affero General Public
            License along with this program. If not, see
            <a
              href="https://www.gnu.org/licenses/"
              target="_blank"
              rel="noopener noreferrer"
              >https://www.gnu.org/licenses/</a
            >.
          </p>

          <p class="text-center">
            <a
              href="https://github.com/projektwahl/projektwahl-lit"
              target="_blank"
              rel="noopener noreferrer"
              >${msg("Source code")}</a
            >
            |
            <a
              href="https://github.com/projektwahl/projektwahl-lit/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              >${msg("Full license")}</a
            >
          </p>
        </div>
      `;
    }
  }
);

customElements.define("pw-welcome", PwWelcome);
