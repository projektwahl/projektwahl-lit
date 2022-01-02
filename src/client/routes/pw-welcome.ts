import { msg } from "@lit/localize";
import { html, LitElement } from "lit";
import { setupHmr } from "../hmr.js";
import { bootstrapCss } from "../index.js";

export const PwWelcome = setupHmr(
  import.meta.url,
  "PwWelcome",
  class PwWelcome extends LitElement {
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
          <!--
            <pre>
projektwahl-lit is a software to manage choosing projects and automatically assigning people to projects.
Copyright (C) 2021 Moritz Hedtke

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see https://www.gnu.org/licenses/.
            </pre>
        -->

          <p class="text-center">${msg("Copyright (C) 2021 Moritz Hedtke")}</p>
          <p class="text-center">
            <a
              href="https://github.com/projektwahl/projektwahl-lit"
              target="_blank"
              rel="noopener noreferrer"
              >${msg("projektwahl-lit")}</a
            >${msg(" is licensed under the ")}
            <a
              href="https://github.com/projektwahl/projektwahl-lit/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              >${msg("GNU Affero General Public License v3.0")}</a
            >.
          </p>
        </div>
      `;
    }
  }
);

customElements.define("pw-welcome", PwWelcome);
