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
import { createRef } from "lit/directives/ref.js";
import { msg } from "@lit/localize";
import type { routes, ResponseType } from "../../lib/routes.js";
import type { Task } from "@lit-labs/task";

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

  _task!: Task<[URLSearchParams], ResponseType<P>>;

  form: import("lit/directives/ref").Ref<HTMLFormElement>;

  constructor() {
    super();

    this.form = createRef();
  }

  getCurrentInputElements() {
    const formKeysEvent = new CustomEvent<string[][]>("myformkeys", {
      bubbles: true,
      composed: true,
      detail: [],
    });
    this.form.value?.dispatchEvent(formKeysEvent);

    console.log(formKeysEvent.detail);

    return formKeysEvent.detail;
  }

  getErrors() {
    return this._task.render({
      complete: (data) => {
        if (!data.success) {
          if (data.error.issues.length > 0) {
            return html`<div class="alert alert-danger" role="alert">
              ${msg("Some errors occurred!")}<br />
              ${data.error.issues
                .filter(
                  (i) =>
                    ![...this.getCurrentInputElements()].find(
                      (v) => JSON.stringify(v) === JSON.stringify(i.path)
                    )
                )
                .map((issue) => html` ${issue.path}: ${issue.message}<br /> `)}
            </div>`;
          }
        }
        return html``;
      },
    });
  }
}

export { PwForm };
