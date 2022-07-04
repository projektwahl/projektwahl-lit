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
import { msg } from "@lit/localize";
import { html } from "lit";
import { PwElement } from "../pw-element.js";
import { LoggedInUserController } from "../user-controller.js";
import { myFetch } from "../utils.js";
import { ClockController } from "../clock-controller.js";
import { Task } from "@lit-labs/task";
import type { ResponseType } from "../../lib/routes.js";
import { animate, flyBelow, flyAbove } from "@lit-labs/motion";
import { choose } from "lit/directives/choose.js";

// workaround see https://github.com/runem/lit-analyzer/issues/149#issuecomment-1006162839
export function pwWelcome(
  props: Record<string, never> // Pick<PwWelcome, never>
) {
  const { ...rest } = props;
  const _: Record<string, never> = rest;
  //_ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
  return html`<pw-welcome></pw-welcome>`;
}

function renderDigit(digit: number) {
  return html`<span class="test-parent"
    >${choose(digit, [
      [
        0,
        () =>
          html`<span
            class="test"
            ${animate({
              skipInitial: true,
              in: flyAbove,
              out: flyBelow,
            })}
            >0</span
          >`,
      ],
      [
        1,
        () =>
          html`<span
            class="test"
            ${animate({
              skipInitial: true,
              in: flyAbove,
              out: flyBelow,
            })}
            >1</span
          >`,
      ],
      [
        2,
        () =>
          html`<span
            class="test"
            ${animate({
              skipInitial: true,
              in: flyAbove,
              out: flyBelow,
            })}
            >2</span
          >`,
      ],
      [
        3,
        () =>
          html`<span
            class="test"
            ${animate({
              skipInitial: true,
              in: flyAbove,
              out: flyBelow,
            })}
            >3</span
          >`,
      ],
      [
        4,
        () =>
          html`<span
            class="test"
            ${animate({
              skipInitial: true,
              in: flyAbove,
              out: flyBelow,
            })}
            >4</span
          >`,
      ],
      [
        5,
        () =>
          html`<span
            class="test"
            ${animate({
              skipInitial: true,
              in: flyAbove,
              out: flyBelow,
            })}
            >5</span
          >`,
      ],
      [
        6,
        () =>
          html`<span
            class="test"
            ${animate({
              skipInitial: true,
              in: flyAbove,
              out: flyBelow,
            })}
            >6</span
          >`,
      ],
      [
        7,
        () =>
          html`<span
            class="test"
            ${animate({
              skipInitial: true,
              in: flyAbove,
              out: flyBelow,
            })}
            >7</span
          >`,
      ],
      [
        8,
        () =>
          html`<span
            class="test"
            ${animate({
              skipInitial: true,
              in: flyAbove,
              out: flyBelow,
            })}
            >8</span
          >`,
      ],
      [
        9,
        () =>
          html`<span
            class="test"
            ${animate({
              skipInitial: true,
              in: flyAbove,
              out: flyBelow,
            })}
            >9</span
          >`,
      ],
    ])}</span
  >`;
}

export class PwWelcome extends PwElement {
  userController: LoggedInUserController;
  clockController: ClockController;
  task: Task<[string | undefined], ResponseType<"/api/v1/settings">>;
  userTask: Task<[string | undefined], [number, string, boolean] | undefined>;

  constructor() {
    super();
    this.userController = new LoggedInUserController(this);
    this.clockController = new ClockController(this);

    this.task = new Task(
      this,
      async () =>
        await myFetch(
          "GET",
          "/api/v1/settings",
          {
            filters: {},
            sorting: [],
            paginationDirection: "forwards",
            paginationLimit: 100,
          },
          {}
        ),
      () => [this.userController.username]
    );

    this.userTask = new Task(
      this,
      async () => {
        if (this.userController.type === "voter") {
          const results = await myFetch(
            "GET",
            "/api/v1/users",
            {
              filters: {
                id: this.userController.id,
              },
              sorting: [],
              paginationDirection: "forwards",
              paginationLimit: 100,
            },
            {}
          );
          // TODO FIXME this condition is wrong for project leaders. we need to wait until election end
          if (
            results.success &&
            results.data.entities.length > 0 &&
            (results.data.entities[0].computed_in_project_id ||
              results.data.entities[0].project_leader_id)
          ) {
            const project = await myFetch(
              "GET",
              "/api/v1/projects",
              {
                filters: {
                  id:
                    results.data.entities[0].computed_in_project_id ||
                    (results.data.entities[0].project_leader_id ?? undefined),
                },
                sorting: [],
                paginationDirection: "forwards",
                paginationLimit: 100,
              },
              {}
            );
            if (project.success) {
              return [
                project.data.entities[0].id,
                project.data.entities[0].title,
                results.data.entities[0].project_leader_id !== null,
              ];
            }
          }
        } else {
          return undefined;
        }
      },
      () => [this.userController.username]
    );
  }

  protected render() {
    return html`
      <div class="container">
        <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
          <symbol
            id="check-circle-fill"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path
              d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"
            />
          </symbol>
          <symbol id="info-fill" fill="currentColor" viewBox="0 0 16 16">
            <path
              d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"
            />
          </symbol>
          <symbol
            id="exclamation-triangle-fill"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path
              d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"
            />
          </symbol>
        </svg>

        ${this.userController.type === "voter"
          ? this.userTask.render({
              complete: (value) => {
                if (value) {
                  return html`
                    <div
                      class="alert alert-success d-flex align-items-center"
                      role="alert"
                    >
                      <svg
                        class="bi flex-shrink-0 me-2"
                        width="24"
                        height="24"
                        role="img"
                        aria-label="Success:"
                      >
                        <use xlink:href="#check-circle-fill" />
                      </svg>
                      <div>
                        Du bist ${value[2] ? "Projektleiter" : ""} im Projekt
                        <a href="/projects/view/${value[0]}" class="alert-link"
                          >${value[1]}</a
                        >.
                      </div>
                    </div>
                  `;
                } else {
                  return html`<div
                    class="alert alert-danger d-flex align-items-center"
                    role="alert"
                  >
                    <svg
                      class="bi flex-shrink-0 me-2"
                      width="24"
                      height="24"
                      role="img"
                      aria-label="Danger:"
                    >
                      <use xlink:href="#exclamation-triangle-fill" />
                    </svg>
                    <div>
                      Fehler beim Laden des Wahlergebnisses. Lade die Seite neu!
                    </div>
                  </div>`;
                }
              },
            })
          : ``}

        <h1 class="text-center">Projektwoche AES 3.0 18.-21. Juli 2022</h1>

        <h2 class="text-center">Montag bis Mittwoch: Projekttage</h2>
        <h2 class="text-center">Donnerstag: großes AES - Festival</h2>
        <p>
          Voice-Aid Schulkonzert, Flashmop (Musik, Tanz, Kreativität,
          Kleiderbasar, Vorbereitung Präsentationen), Sommerfest mit Eltern und
          Ausstellung der Ergebnisse der Projekttage
        </p>

        ${this.userController.type === "helper"
          ? html`<p>
              Oben im Menü unter "Projekte" kannst du Projekte erstellen und
              bearbeiten.
            </p>`
          : this.userController.type === "voter"
          ? html`<p>
              Oben im Menü unter "Wahl" kannst du deine Projektwünsche
              auswählen.
            </p>`
          : this.userController.type === undefined
          ? html`<p>Oben rechts im Menü kann man sich anmelden.</p>`
          : ``}
        ${this.task.render({
          complete: (value) => {
            if (value.success) {
              const val = value.data.entities[0];
              const curr = new Date();

              // UPDATE settings SET open_date = CURRENT_TIMESTAMP + '1 minute', voting_start_date = CURRENT_TIMESTAMP + '2 minutes', voting_end_date = CURRENT_TIMESTAMP + '3 minutes', results_date = CURRENT_TIMESTAMP + '4 minutes';

              const state =
                curr > new Date(Number(val.results_date))
                  ? msg("results")
                  : curr > new Date(Number(val.voting_end_date))
                  ? msg("voting end")
                  : curr > new Date(Number(val.voting_start_date))
                  ? msg("voting start")
                  : curr > new Date(Number(val.open_date))
                  ? msg("preparation")
                  : msg("not started yet");

              const next_date_and_state =
                curr > new Date(Number(val.results_date))
                  ? null
                  : curr > new Date(Number(val.voting_end_date))
                  ? [msg("results"), val.results_date]
                  : curr > new Date(Number(val.voting_start_date))
                  ? [msg("voting end"), val.voting_end_date]
                  : curr > new Date(Number(val.open_date))
                  ? [msg("voting start"), val.voting_start_date]
                  : [msg("preparation"), val.open_date];

              if (next_date_and_state) {
                const diff =
                  new Date(Number(next_date_and_state[1])).getTime() -
                  this.clockController.value.getTime();

                const seconds = Math.floor(diff / 1000) % 60;

                const minutes = Math.floor(diff / (1000 * 60)) % 60;

                const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;

                const days = Math.floor(diff / (1000 * 60 * 60 * 24));

                return html`<span class="font-monospace"
                  >${msg(html`currently ${state},
                  ${renderDigit(Math.floor(days / 100) % 10)}${renderDigit(
                    Math.floor(days / 10) % 10
                  )}${renderDigit(days % 10)}
                  days,
                  ${renderDigit(Math.floor(hours / 10))}${renderDigit(
                    hours % 10
                  )}
                  hours,
                  ${renderDigit(Math.floor(minutes / 10))}${renderDigit(
                    minutes % 10
                  )}
                  minutes,
                  ${renderDigit(Math.floor(seconds / 10))}${renderDigit(
                    seconds % 10
                  )}
                  seconds until ${next_date_and_state[0]}`)}</span
                >`;
              } else {
                return html`<span>${msg("results available")}</span>`;
              }
            }
          },
        })}

        <br />
        <h2 class="text-center">${msg("Credits")}</h2>

        <p>
          projektwahl-lit is a software to manage choosing projects and
          automatically assigning people to projects.<br />
          Copyright (C) 2021 Moritz Hedtke &lt;Moritz.Hedtke@t-online.de&gt;
        </p>

        <p>
          This program is free software: you can redistribute it and/or modify
          it under the terms of the GNU Affero General Public License as
          published by the Free Software Foundation, either version 3 of the
          License, or (at your option) any later version.
        </p>

        <p>
          This program is distributed in the hope that it will be useful, but
          WITHOUT ANY WARRANTY; without even the implied warranty of
          MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
          Affero General Public License for more details.
        </p>

        <p>
          You should have received a copy of the GNU Affero General Public
          License along with this program. If not, see
          <a
            href="https://www.gnu.org/licenses/"
            target="_blank"
            rel="noopener noreferrer"
            >https://www.gnu.org/licenses/</a
          >.
        </p>
      </div>
    `;
  }
}

customElements.define("pw-welcome", PwWelcome);
