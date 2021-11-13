// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import "./pw-input.js";
import { html, LitElement, noChange } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import { bootstrapCss } from "../index.js";
import { HistoryController } from "../history-controller.js";
import { myFetch } from "../utils.js";
import { promise } from "./promise-directive.js";
import { isErr } from "../../lib/result.js";

/**
 * @template {keyof import("../../lib/routes").routes} P
 */
export class PwForm extends LitElement {
  /** @override */ static get properties() {
    return {
      url: { attribute: false },
      actionText: { type: String },
      fakeSlot: { attribute: false },
      result: { state: true },
    };
  }

  constructor() {
    super();

    /** @private */ this.history = new HistoryController(this);

    /** @type {P} */
    this.url;

    /** @type {string} */
    this.actionText;

    /** @type {import("lit").TemplateResult} */
    this.fakeSlot;

    /** @type {import("lit/directives/ref").Ref<HTMLFormElement>} */
    this.form = createRef();

    /** @type {Promise<import("../../lib/types").OptionalResult<import("../../lib/routes").routes[P],{ network?: string } & { [key in keyof import("../../lib/routes").routes[P]]?: string }>>} */
    this.result = Promise.resolve({ result: "none" });
  }

  submit = (/** @type {SubmitEvent} */ event) => {
    event.preventDefault();

    // ts-expect-error doesn't contain files so this is fine
    const formData = /*new URLSearchParams(*/ new FormData(this.form.value);

    let jsonData = Object.fromEntries(formData.entries());

    this.result = myFetch(this.url, {
      method: "POST",
      headers: {
        "content-type": "text/json",
      },
      body: JSON.stringify(jsonData),
    });
    // https://lit.dev/docs/components/events/#dispatching-events
    const resultEvent = new CustomEvent("form-result", {
      detail: this.result,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(resultEvent);
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
  /*
  // because forms in shadow root are garbage
  protected override createRenderRoot() {
    return this;
  }
*/
  /** @override */ render() {
    if (this.url === undefined || this.actionText === undefined) {
      throw new Error("component not fully initialized");
    }

    const keyframeOptions = {
      duration: 500,
      fill: "both",
    };

    return html`
      ${bootstrapCss}
      <main class="container">
        <h1 class="text-center">${this.actionText}</h1>

        <div class="row justify-content-center">
          <div class="col-md-7 col-lg-8">
            ${promise(
              /** @type {Promise<import("../../lib/types").OptionalResult<import("../../lib/routes").routes[P],{network?: string;} & { [key in keyof import("../../lib/routes").routes[P]]?: string }>>} */ (
                this.result
              ),
              /** @type {symbol | import("lit").TemplateResult | undefined} */ (
                noChange
              ),
              (v) =>
                isErr(v) && v.failure.network !== undefined
                  ? html` <div class="alert alert-danger" role="alert">
                      ${v.failure.network}
                    </div>`
                  : undefined,
              (v) => html` <div class="alert alert-danger" role="alert">
                Unbekannter Fehler!
              </div>`
            )}

            <form
              ${ref(this.form)}
              method="POST"
              action="/no-javascript"
              @submit=${this.submit}
            >
              ${this.fakeSlot}

              <button
                type="submit"
                ?disabled=${promise(
                  this.result,
                  true,
                  () => false,
                  () => false
                )}
                class="btn btn-primary"
              >
                ${this.actionText}
              </button>
            </form>
          </div>
        </div>
      </main>
    `;
  }
}
customElements.define("pw-form", PwForm);
