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
import {choose} from 'lit/directives/choose.js';

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
  return html`<span class="test-parent">${choose(digit, [
    [0, () => html`<span class="test" ${animate({
      skipInitial: true,
      in: flyAbove,
      out: flyBelow,
    })}>0</span>`],
    [1, () =>  html`<span class="test" ${animate({
      skipInitial: true,
      in: flyAbove,
      out: flyBelow,
    })}>1</span>`],
    [2, () =>  html`<span class="test" ${animate({
      skipInitial: true,
      in: flyAbove,
      out: flyBelow,
    })}>2</span>`],
    [3, () =>  html`<span class="test" ${animate({
      skipInitial: true,
      in: flyAbove,
      out: flyBelow,
    })}>3</span>`],
    [4, () =>  html`<span class="test" ${animate({
      skipInitial: true,
      in: flyAbove,
      out: flyBelow,
    })}>4</span>`],
    [5, () =>  html`<span class="test" ${animate({
      skipInitial: true,
      in: flyAbove,
      out: flyBelow,
    })}>5</span>`],
    [6, () =>  html`<span class="test" ${animate({
      skipInitial: true,
      in: flyAbove,
      out: flyBelow,
    })}>6</span>`],
    [7, () =>  html`<span class="test" ${animate({
      skipInitial: true,
      in: flyAbove,
      out: flyBelow,
    })}>7</span>`],
    [8, () =>  html`<span class="test" ${animate({
      skipInitial: true,
      in: flyAbove,
      out: flyBelow,
    })}>8</span>`],
    [9, () =>  html`<span class="test" ${animate({
      skipInitial: true,
      in: flyAbove,
      out: flyBelow,
    })}>9</span>`],
  ])}</span>`
}

export class PwWelcome extends PwElement {
  userController: LoggedInUserController;
  clockController: ClockController;
  task: Task<[], ResponseType<"/api/v1/settings">>;

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
      () => []
    );
  }

  protected render() {
    return html`
      <div class="container">
        <h1 class="text-center">Projektwoche AES 3.0 18.-21. Juli 2022</h1>

        <h2 class="text-center">Montag bis Mittwoch: Projekttage</h2>
        <h2 class="text-center">Donnerstag: großes AES - Festival</h2>
        <p>
          Voice-Aid Schulkonzert, Flashmop (Musik, Tanz, Kreativität,
          Kleiderbasar, Vorbereitung Präsentationen), Sommerfest mit Eltern und
          Ausstellung der Ergebnisse der Projekttage
        </p>

        ${this.userController.type === "helper"
          ? `Oben im Menü unter "Projekte" kannst du Projekte erstellen und bearbeiten.`
          : this.userController.type === "voter"
          ? `Oben im Menü unter "Wahl" kannst du deine Projektwünsche auswählen.`
          : ``}
        ${this.task.render({
          complete: (value) => {
            if (value.success) {
              const diff =
                new Date(value.data.entities[0].open_date).getTime() -
                this.clockController.value.getTime();

              const seconds = Math.floor(diff / 1000) % 60;

              const minutes = Math.floor(diff / (1000 * 60)) % 60;

              const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;

              const days = Math.floor(diff / (1000 * 60 * 60 * 24));

              return html`<span class="font-monospace">${renderDigit(days / 10)}${renderDigit(days % 10)} days, ${hours} hours, ${minutes} minutes,
              ${renderDigit(Math.floor(seconds / 10))}${renderDigit(seconds % 10)} seconds</span>`;
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
