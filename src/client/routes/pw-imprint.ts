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
import { setupHmr } from "../hmr.js";
import { bootstrapCss } from "../index.js";

export const PwImprint = setupHmr(
  "PwImprint",
  class PwImprint extends LitElement {
    protected render() {
      return html`
        ${bootstrapCss}

        <div class="container">
          <h1 class="text-center">Impressum</h1>

          <h2>Angaben gemäß § 5 TMG</h2>
          <address>
            Moritz Hedtke<br />
            Anne-Frank-Straße 10<br />
            64354 Reinheim<br />
            Telefon: +49 (0) 6162 2918<br />
            E-Mail: Moritz.Hedtke@t-online.de
          </address>
        </div>
      `;
    }
  }
);

customElements.define("pw-imprint", PwImprint);
