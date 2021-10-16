import "../../lib/form/pw-input"; // SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { createRef, Ref, ref } from "lit/directives/ref.js";
import { bootstrapCss } from "../..";
import { HistoryController } from "../../history-controller";
import { myFetch } from "../../utils";

export const pwLogin = async (): Promise<TemplateResult> => {
  const content = await fetch("./index.html").then((r) => r.text());
  return html`<pw-login .data=${content}></pw-login>`;
};

@customElement("pw-login")
export class PwLogin extends LitElement {
  private history = new HistoryController(this);

  data!: string;

  form: Ref<HTMLFormElement> = createRef();

  login = async (event: SubmitEvent) => {
    event.preventDefault();

    // @ts-expect-error doesn't contain files so this is fine
    const formData = new URLSearchParams(new FormData(this.form.value));

    const result = await myFetch("/api/v1/login", {
      method: "POST",
      body: formData,
    });
  };

  // https://www.chromestatus.com/feature/4708990554472448
  // https://www.reddit.com/r/PolymerJS/comments/f00gd0/litelement_formassociated_custom_elements_form/
  // https://css-tricks.com/creating-custom-form-controls-with-elementinternals/
  // https://web.dev/more-capable-form-controls/
  // https://caniuse.com/mdn-api_htmlformelement_formdata_event
  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/formdata_event
  // safari our friend ...
  // https://web.dev/more-capable-form-controls/#feature-detection
  /*
You can use feature detection to determine whether the formdata event and form-associated custom elements are available. There are currently no polyfills released for either feature. In both cases, you can fall back to adding a hidden form element to propagate the control's value to the form. Many of the more advanced features of form-associated custom elements will likely be difficult or impossible to polyfill.
if ('FormDataEvent' in window) {
  // formdata event is supported
}
  */

  override render() {
    return html`
      ${bootstrapCss}
      <main class="container">
        <h1 class="text-center">Login</h1>

        <div class="row justify-content-center">
          <div class="col-md-7 col-lg-8">
            <form
              ${ref(this.form)}
              method="POST"
              action="/no-javascript"
              @submit=${this.login}
            >
              <pw-input
                type="text"
                autocomplete="username"
                label="Name"
                name="username"
              ></pw-input>
              <pw-input
                label="Passwort"
                name="password"
                type="password"
                autocomplete="current-password"
              ></pw-input>

              <button type="submit" class="btn btn-primary">Login</button>
            </form>
          </div>
        </div>
      </main>
    `;
  }
}
