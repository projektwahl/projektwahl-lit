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
import { html } from "lit";
import { PwElement } from "../pw-element.js";

// workaround see https://github.com/runem/lit-analyzer/issues/149#issuecomment-1006162839
export function pwImprint(
  props: Record<string, never> // Pick<PwImprint, never>
) {
  const { ...rest } = props;
  const _: Record<string, never> = rest;
  //_ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
  return html`<pw-imprint></pw-imprint>`;
}

export class PwImprint extends PwElement {
  protected render() {
    return html`
      <div class="container">
        <h1 class="text-center">Impressum</h1>

        <h2>Angaben gemäß § 5 TMG</h2>
        <address>
          Vorname Nachname<br />
          Straße Hausnummer<br />
          Postleitzahl Stadt<br />
          Telefon: <a href="tel:+499123456789">09123 456789</a><br />
          E-Mail: <a href="mailto:E-Mail"
            >E-Mail</a
          >
        </address>
      </div>
    `;
  }
}

customElements.define("pw-imprint", PwImprint);
