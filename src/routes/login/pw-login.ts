
import "../../lib/form/pw-input";import "./pw-input"; // SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement, noChange, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef, Ref, ref } from "lit/directives/ref.js";
import { bootstrapCss } from "../..";
import { HistoryController } from "../../history-controller";
import { myFetch } from "../../utils";
import { LoginResponse, Routes } from "../../routes";
import { OptionalResult } from "../../lib/result";

// https://lit.dev/docs/components/lifecycle/
// updateComplete

export const pwLogin = async (): Promise<TemplateResult> => {
  const content = await fetch("/api/v1/sleep").then((r) => r.text());
  return html`<pw-form .data=${content}></pw-form>`;
};

@customElement("pw-form")
export class PwForm<P extends keyof Routes> extends LitElement {

    @state()
    result: Promise<OptionalResult<Routes[P], { network?: string; } & { [key in keyof Routes[P]]?: string }>> = Promise.resolve({ result: "none" });
  
    override render() {
        console.log("rerender");
        return html`
            <pw-input
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
            ></pw-input>`
    }
}