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
import { html, noChange } from "lit";
import { createRef, ref, Ref } from "lit/directives/ref.js";
import { msg } from "@lit/localize";
import type { routes, ResponseType } from "../../lib/routes.js";
import type { Task } from "@dev.mohe/task";
import { PwElement } from "../pw-element.js";
import type { z } from "zod";

class PwForm<P extends keyof typeof routes> extends PwElement {
  static get properties() {
    return {
      disabled: { type: Boolean },
      url: { attribute: false },
    };
  }

  disabled = false;

  get actionText(): string {
    throw new Error("not implemented");
  }

  _task!: Task<[URLSearchParams], ResponseType<P>>;

  form: import("lit/directives/ref").Ref<HTMLFormElement>;

  url!: P;

  errors: Ref<HTMLDivElement>;

  // this is intentionally not { state: true } as then updating the children is just super slow
  formData!: z.infer<typeof routes[P]["request"]>;

  constructor() {
    super();

    this.form = createRef();

    this.errors = createRef();
  }

  connectedCallback(): void {
    super.connectedCallback();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  getErrors() {
    return html`${this._task.render({
        complete: (data) => {
          if (!data.success) {
            if (data.error.issues.length > 0) {
              return html`<div
                ${ref(this.errors)}
                class="alert alert-danger"
                role="alert"
              >
                ${msg("Some errors occurred!")}<br />
                ${data.error.issues
                  .filter(
                    (i) =>
                      // TODO FIXME nested keys don't work
                      !Object.keys(this.formData).find(
                        (v) => JSON.stringify([v]) === JSON.stringify(i.path)
                      )
                  )
                  .map(
                    (issue) => html` ${issue.path}: ${issue.message}<br /> `
                  )}
              </div>`;
            }
          }
          return html``;
        },
        pending: () => noChange,
      })}
      <div
        style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1337;"
      >
        ${this._task.render({
          pending: () => html`<div
            class="spinner-grow text-primary"
            role="status"
          >
            <span class="visually-hidden">${msg("Loading...")}</span>
          </div>`,
        })}
      </div>`;
  }

  protected updated(): void {
    this.errors.value?.scrollIntoView();
  }
}

export { PwForm };
