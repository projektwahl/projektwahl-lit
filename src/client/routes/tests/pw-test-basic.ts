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
import { bootstrapCss } from "../../index.js";
import type { PwApp } from "../../pw-app.js";
import { sleep } from "../../utils.js";

// https://localhost:8443/tests/basic
class PwTestBasic extends LitElement {
  protected render() {
    return html` ${bootstrapCss} Test page`;
  }

  connectedCallback(): void {
    super.connectedCallback();

    (async () => {

      const pwApp = document.querySelector("pw-app") as PwApp;

      const pwAppShadow = pwApp?.shadowRoot as ShadowRoot;

      (
        pwAppShadow.querySelector('a[href="/login"]') as HTMLAnchorElement
      ).click();

      await sleep(500);

      const pwLogin = pwAppShadow.querySelector("pw-login")
        ?.shadowRoot as ShadowRoot;
      (
        pwLogin.querySelector('input[name="username"]') as HTMLInputElement
      ).value = "admin";
      (
        pwLogin.querySelector('input[name="password"]') as HTMLInputElement
      ).value = "changeme";
      (
        pwLogin.querySelector('button[type="submit"]') as HTMLButtonElement
      ).click();
    })();
  }
}

customElements.define("pw-test-basic", PwTestBasic);
