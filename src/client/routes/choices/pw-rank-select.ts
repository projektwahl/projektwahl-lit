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
import "../../form/pw-input.js";
import { Task } from "@lit-labs/task";
import { html } from "lit";
import { myFetch } from "../../utils.js";
import { msg } from "@lit/localize";
import type { routes, ResponseType } from "../../../lib/routes.js";
import type { z } from "zod";
import { PwElement } from "../../pw-element.js";

// workaround see https://github.com/runem/lit-analyzer/issues/149#issuecomment-1006162839
export function pwRankSelect(props: Pick<PwRankSelect, never>) {
  const { ...rest } = props;
  let _ = rest;
  _ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
  return html`<pw-rank-select></pw-rank-select>`;
}

class PwRankSelect extends PwElement {
  static override get properties() {
    return {
      _task: {
        state: true,
        hasChanged: () => {
          return true;
        },
      },
      disabled: { state: true },
      choice: { attribute: false },
      url: { type: String },
    };
  }

  _task;

  choice!: z.infer<
    typeof routes["/api/v1/choices"]["response"]
  >["entities"][number];

  disabled: boolean;

  constructor() {
    super();

    this.disabled = false;

    this._task = new Task<[number], ResponseType<"/api/v1/choices/update">>(
      this,
      async (args: [number]) => {
        this.disabled = true;

        const result = await myFetch<"/api/v1/choices/update">(
          "POST",
          "/api/v1/choices/update",
          {
            project_id: this.choice.id, // project id
            rank: args[0] === 0 ? null : args[0],
          },
          {}
        );

        this.dispatchEvent(
          new CustomEvent("refreshentitylist", {
            bubbles: true,
            composed: true,
          })
        );

        return result;
      }
    );
  }

  protected willUpdate(changedProperties: Map<PropertyKey, unknown>): void {
    if (changedProperties.has("choice")) {
      this.disabled = false;
    }
  }

  render() {
    return html` <form>
      ${this._task.render({
        complete: (data) => {
          if (!data.success) {
            const errors = data.error.issues.map(
              (i) => html`${i.path}: ${i.message}<br />`
            );
            if (errors.length > 0) {
              return html`<div class="alert alert-danger" role="alert">
                ${msg("Some errors occurred!")}<br />
                ${errors}
              </div>`;
            }
          }
          return html``;
        },
      })}

      <div class="btn-group" role="group" aria-label="Basic example">
        ${[1, 2, 3, 4, 5, 0].map(
          (v) => html`<button
            @click=${async () => {
              await this._task.run([v]);
            }}
            ?disabled=${this.disabled}
            type="button"
            class="btn ${this.disabled
              ? "btn-secondary"
              : this.choice.rank === (v === 0 ? null : v)
              ? "btn-primary"
              : "btn-outline-primary"}"
          >
            ${v === 0 ? "X" : v}
          </button>`
        )}
      </div>
    </form>`;
  }
}

customElements.define("pw-rank-select", PwRankSelect);
