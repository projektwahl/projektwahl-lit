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
import { html } from "lit";
import { setupHmr } from "../hmr.js";
import { PwElement } from "../pw-element.js";

// workaround see https://github.com/runem/lit-analyzer/issues/149#issuecomment-1006162839
export function pwWelcome(props: Pick<PwWelcome, never>) {
  const { ...rest } = props;
  let _ = rest;
  _ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
  return html`<pw-welcome></pw-welcome>`;
}

export class PwWelcome extends PwElement {
  protected render() {
    return html`
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
          Copyright (C) 2021 Moritz Hedtke &lt;Moritz.Hedtke@t-online.de&gt;
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
      </div>
    `;
  }
}

customElements.define("pw-welcome", PwWelcome);
