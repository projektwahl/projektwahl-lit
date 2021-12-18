// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import "./pw-input.js";
import { html, LitElement } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import { bootstrapCss } from "../index.js";
import { HistoryController } from "../history-controller.js";
import { isErr } from "../../lib/result.js";

/**
 * @template {keyof import("../../lib/routes").routes} P
 */
export class PwForm extends LitElement {
  /** @override */ static get properties() {
    return {
      actionText: { type: String },
      _task: { state: true },
      forceTask: { state: true },
    };
  }

  constructor() {
    super();

    /** @private */ this.history = new HistoryController(this);

    /* @type {P} */
    //this.url;

    /**
     * @private
     * @type {import("@lit-labs/task").Task}
     */
    this._task;

    /** @type {string} */
    this.actionText;

    /** @type {import("lit").TemplateResult} */
    this.fakeSlot;

    /** @type {import("lit/directives/ref").Ref<HTMLFormElement>} */
    this.form = createRef();
  }

  submit = (/** @type {SubmitEvent} */ event) => {
    event.preventDefault();

    this.forceTask = (this.forceTask || 0) + 1;
  };

  // TODO FIXME really important
  // get the inputs from there and check that the errors returned from the server don't contain additional
  // this needs to be done dynamically as e.g. the create user form dynamically changes the form inputs
  // attributes. Otherwise we're eating errors and that's not healthy.xit
  /** @abstract @type {() => import("lit").TemplateResult} */
  getInputs = () => {
    throw new Error("getInputs must be implemented by subclass")
  };

  /** @private */ getCurrentInputElements() {
    return [...this.renderRoot.querySelectorAll("pw-input")].map((e) => e.name);
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
  /** @override */ render() {
    if (this.actionText === undefined) {
      throw new Error("component not fully initialized");
    }

    return html`
      ${bootstrapCss}
      <main class="container">
        <h1 class="text-center">${this.actionText}</h1>

        <div class="row justify-content-center">
          <div class="col-md-7 col-lg-8">
            ${this._task.render({
              complete: (data) => {
                if (isErr(data)) {
                  const errors = Object.entries(data.failure)
                    .filter(
                      ([k, v]) => !this.getCurrentInputElements().includes(k)
                    )
                    .map(([k, v]) => html`${k}: ${v}<br />`);
                  if (errors.length > 0) {
                    return html`<div class="alert alert-danger" role="alert">
                      Es sind Fehler aufgetreten!<br />
                      ${errors}
                    </div>`;
                  }
                }
                return html``;
              },
              error: (error) => html`<div
                class="alert alert-danger"
                role="alert"
              >
                ${error}
              </div>`,
            })}

            <form
              ${ref(this.form)}
              method="POST"
              action="/no-javascript"
              @submit=${this.submit}
            >
              ${this.getInputs()}

              <button
                type="submit"
                ?disabled=${this._task.render({
                  pending: () => true,
                  complete: () => false,
                  error: () => false,
                  initial: () => false,
                })}
                class="btn btn-primary"
              >
                ${this.actionText} ${this._task.status}
              </button>
            </form>
          </div>
        </div>
      </main>
    `;
  }
}
customElements.define("pw-form", PwForm);
