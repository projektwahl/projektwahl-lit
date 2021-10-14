// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { bootstrapCss } from "../..";
import { HistoryController } from "../../history-controller";

export const pwLogin = async (): Promise<TemplateResult> => {
  const content = await fetch("./index.html").then((r) => r.text());
  return html`<pw-login .data=${content}></pw-login>`;
};

@customElement("pw-login")
export class PwLogin extends LitElement {
  private history = new HistoryController(this);

  data: string;

  render() {
    return html`
      ${bootstrapCss}
      <main class="container">
        <h1 class="text-center">Login</h1>

        ${this.data}
      </main>
    `;
  }
}
