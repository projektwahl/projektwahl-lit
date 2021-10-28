var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import "./pw-input"; // SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement, noChange } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { createRef, ref } from "lit/directives/ref.js";
import { bootstrapCss } from "../..";
import { HistoryController } from "../../history-controller";
import { myFetch } from "../../utils";
import { isErr } from "../result";
import { promise } from "./promise-directive";
let PwForm = class PwForm extends LitElement {
    constructor() {
        super(...arguments);
        this.history = new HistoryController(this);
        this.form = createRef();
        this.result = Promise.resolve({ result: "none" });
        this.submit = (event) => {
            event.preventDefault();
            // @ts-expect-error doesn't contain files so this is fine
            const formData = new URLSearchParams(new FormData(this.form.value));
            this.result = myFetch(this.url, {
                method: "POST",
                body: formData,
            });
            // https://lit.dev/docs/components/events/#dispatching-events
            const resultEvent = new CustomEvent("form-result", {
                detail: this.result,
                bubbles: true,
                composed: true,
            });
            this.dispatchEvent(resultEvent);
        };
    }
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
    render() {
        if (this.url === undefined || this.actionText === undefined) {
            throw new Error("component not fully initialized");
        }
        console.log("rerender");
        return html `
      ${bootstrapCss}
      <main class="container">
        <h1 class="text-center">${this.actionText}</h1>

        <div class="row justify-content-center">
          <div class="col-md-7 col-lg-8">
            ${promise(this.result, noChange, (v) => isErr(v) && v.failure.network !== undefined
            ? html ` <div class="alert alert-danger" role="alert">
                      ${v.failure.network}
                    </div>`
            : undefined, (v) => html ` <div class="alert alert-danger" role="alert">
                Unbekannter Fehler!
              </div>`)}

            <form
              ${ref(this.form)}
              method="POST"
              action="/no-javascript"
              @submit=${this.submit}
            >
              ${this.fakeSlot}

              <button type="submit" class="btn btn-primary">
                ${this.actionText}
              </button>
            </form>
          </div>
        </div>
      </main>
    `;
    }
};
__decorate([
    property({ attribute: false })
], PwForm.prototype, "url", void 0);
__decorate([
    property({ type: String })
], PwForm.prototype, "actionText", void 0);
__decorate([
    property({ attribute: false })
], PwForm.prototype, "fakeSlot", void 0);
__decorate([
    state()
], PwForm.prototype, "result", void 0);
PwForm = __decorate([
    customElement("pw-form")
], PwForm);
export { PwForm };
//# sourceMappingURL=pw-form.js.map