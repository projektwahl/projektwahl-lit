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
import "../../form/pw-form.js";
import { html } from "lit";
import { noChange } from "lit";
import { aClick } from "../../pw-a.js";
import { msg } from "@lit/localize";
import {
  parseRequestWithPrefix,
  PwEntityList,
  taskFunction,
} from "../../entity-list/pw-entitylist.js";
import type { entityRoutes } from "../../../lib/routes.js";
import type { z } from "zod";
import { ref } from "lit/directives/ref.js";

// TODO FIXME this currently needs to be synced with the defaults in the pwInput stuff. Fix that.
const defaultValue: z.infer<
  typeof entityRoutes["/api/v1/projects"]["request"]
> = {
  sorting: [],
  filters: {
    deleted: false,
  },
  paginationDirection: "forwards",
  paginationLimit: 100,
};

export const pwProjectsOverviewPreloaded = async (url: URL) => {
  const result = await taskFunction(
    "/api/v1/projects",
    url,
    "projects",
    defaultValue,
  );
  return pwProjectsOverview({
    initial: result,
    prefix: "projects",
  });
};

// workaround see https://github.com/runem/lit-analyzer/issues/149#issuecomment-1006162839
export function pwProjectsOverview<X extends string>(
  props: Pick<PwProjectsOverview<X>, "initial" | "prefix">,
) {
  const { initial, prefix, ...rest } = props;
  let _ = rest;
  _ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
  return html`<pw-projects-overview
    .initial=${initial}
    .prefix=${prefix}
  ></pw-projects-overview>`;
}

export class PwProjectsOverview<X extends string> extends PwEntityList<
  "/api/v1/projects",
  X
> {
  static override get properties() {
    return {
      ...super.properties,
      title: { type: String },
    };
  }

  constructor() {
    super();

    this.url = "/api/v1/projects";

    this.defaultValue = defaultValue;
  }

  override get title() {
    return msg("Projects overview");
  }

  override get body() {
    return html`
      ${this._task.render({
        pending: () => {
          return noChange;
        },
        complete: (result) => {
          return result.success
            ? result.data.entities.map(
                (value) => html`<article class="break-inside-avoid">
                  <h2 class="text-center">
                    ${
                      value.deleted
                        ? html`<del
                          ><a @click=${aClick} href="/projects/view/${value.id}"
                            >${value.title}</a
                          ></del
                        >`
                        : html`<a
                          @click=${aClick}
                          href="/projects/view/${value.id}"
                          >${value.title}</a
                        >`
                    }
                  </h2>
                  <dl class="row">
                    <dt class="col-2">Info</dt>
                    <dd class="col-10">${value.info}</dd>
                    <dt class="col-2">Ort</dt>
                    <dd class="col-10">${value.place}</dd>
                    <dt class="col-2">Kosten</dt>
                    <dd class="col-1">${value.costs}</dd>
                    <dt class="col-2">Jahrgang</dt>
                    <dd class="col-1">${value.min_age}-${value.max_age}</dd>
                    <dt class="col-2">Teilnehmer</dt>
                    <dd class="col-1">
                      ${value.min_participants}-${value.max_participants}
                    </dd>
                    <dt class="col-2">Zufällige Zuweisungen?</dt>
                    <dd class="col-1">
                      ${value.random_assignments ? "Ja" : "Nein"}
                    </dd>
                    <dt class="col-2">Projektleiter</dt>
                    <dd class="col-10">${value.project_leaders.join(", ")}</dd>
                    <dt class="col-2">Teilnehmer</dt>
                    <dd class="col-10">
                      ${value.computed_in_projects.join(", ")}
                    </dd>
                  </dl>
                </article>`,
              )
            : undefined;
        },
        initial: () => {
          return html`initial state`;
        },
      })}
    `;
  }

  override render() {
    //console.log(`rerender pw-entitylist ${this.url} ${Math.random()}`);
    if (this.prefix === undefined) {
      throw new Error("prefix not set");
    }

    if (this.actionText === undefined) {
      throw new Error(msg("component not fully initialized"));
    }

    if (!this.hasUpdated) {
      this.formData =
        parseRequestWithPrefix(
          this.url,
          this.prefix,
          this.history.url,
          this.defaultValue,
        )[this.prefix] ?? {};

      void this._task.run();
    }

    // this looks equal, so maybe lit tasks is buggy?
    //console.log(this.body);

    // the task data is wrong
    //console.log("taskk", this._task);

    return html`
      <main class="container-fluid">
        <h1 class="text-center">${this.title}</h1>

        <form
          ${ref(this.form)}
          @refreshentitylist=${async () => {
            await this._task.run();
          }}
          @submit=${(e: Event) => {
            e.preventDefault();
          }}
        >
          ${this.getErrors()} ${this.body}
        </form>
      </main>
    `;
  }
}

customElements.define("pw-projects-overview", PwProjectsOverview);
