import "../../lib/form/pw-form";
// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement, noChange, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef, Ref, ref } from "lit/directives/ref.js";
import { bootstrapCss } from "../..";
import { HistoryController } from "../../history-controller";
import { myFetch } from "../../utils";
import { LoginResponse, Routes } from "../../routes";
import { OptionalResult } from "../../lib/result";
import "../../lib/form/pw-input";

// https://lit.dev/docs/components/lifecycle/
// updateComplete

export const pwLogin = async (): Promise<TemplateResult> => {
  const content = await fetch("/api/v1/sleep").then((r) => r.text());
  return html`<pw-login .data=${content}></pw-login>`;
};

@customElement("pw-login")
export class PwLogin<P extends keyof Routes> extends LitElement {
  @state()
  result: Promise<
    OptionalResult<
      Routes[P],
      { network?: string } & { [key in keyof Routes[P]]?: string }
    >
  > = Promise.resolve({ result: "none" });

  override render() {
    console.log("rerender");
    return html`<pw-form
      .url=${"/api/v1/login"}
      @form-result=${(event: CustomEvent) => {
        this.result = event.detail;
      }}
      actionText="Login"
      .fakeSlot=${html` <pw-input
          type="text"
          autocomplete="username"
          label="Name"
          name="username"
          .result=${this.result}
        ></pw-input>
        <pw-input
          label="Passwort"
          name="password"
          type="password"
          autocomplete="current-password"
          .result=${this.result}
        ></pw-input>`}
    >
    </pw-form>`;
  }
}
