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
import { html, LitElement } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import { bootstrapCss } from "../index.js";
import { msg } from "@lit/localize";
import type { routes } from "../../lib/routes.js";
import type { z } from "zod";

class PwForm<P extends keyof typeof routes> extends LitElement {
  static get properties() {
    return {
      disabled: { type: Boolean },
    };
  }

  disabled = false;

  get actionText(): string {
    throw new Error("not implemented");
  }

  _task!: import("@lit-labs/task").Task<
    unknown[],
    z.infer<typeof routes[P]["response"]>
  >;

  form: import("lit/directives/ref").Ref<HTMLFormElement>;

  constructor() {
    super();

    this.form = createRef();
  }

  // TODO FIXME really important
  // get the inputs from there and check that the errors returned from the server don't contain additional
  // this needs to be done dynamically as e.g. the create user form dynamically changes the form inputs
  // attributes. Otherwise we're eating errors and that's not healthy.xit

  /** @private */ getCurrentInputElements() {
    const formDataEvent = new CustomEvent("myformdata", {
      bubbles: true,
      composed: true,
      detail: {},
    });
    this.form.value?.dispatchEvent(formDataEvent);

    return Object.keys(formDataEvent.detail);
  }

  getErrors() {
    return this._task.render({
      complete: (data) => {
        if (!data.success) {
          const errors = Object.entries(data.error)
            .filter(([k]) => !this.getCurrentInputElements().includes(k))
            .map(([k, v]) => html`${k}: ${v}<br />`);
          if (errors.length > 0) {
            return html`<div class="alert alert-danger" role="alert">
              ${msg("Some errors occurred!")}<br />
              ${errors}
            </div>`;
          }
        }
        return html``;
      },
    });
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
}

export { PwForm };
