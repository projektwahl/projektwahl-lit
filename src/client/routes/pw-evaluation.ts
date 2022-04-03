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
import { setupHmr } from "../hmr.js";
import { bootstrapCss } from "../index.js";
import { PwElement } from "../pw-element.js";

export const PwEvaluation = setupHmr(
  "PwEvaluation",
  class PwEvaluation extends PwElement {
    protected render() {
      return html`
        ${bootstrapCss}

        <div class="container">
          <h1 class="text-center">Wie funktioniert die Auswertung?</h1>

          <p>
            Zuerst einmal vorneweg: Wer sich von der Richtigkeit der Angaben hier überzeugen möchte, kann im <a href="https://github.com/projektwahl/projektwahl-lit/blob/main/src/server/routes/evaluate/index.ts">Quellcode</a> nachschauen. Leider kann man nicht überprüfen, ob dieser Code auch tatsächlich für die Auswertung verwendet wurde, da dafür die Wahl aller Personen veröffentlicht werden müsste. Aber mit Hilfe des Codes kann zumindest überprüft werden, ob das Ergebnis plausibel ist.
          </p>

          <p>
            Fangen wir mit den Grundlagen an: Die Wahl einer Person ist gültig, wenn genau fünf Projekte gewählt wurden und dabei die Altersbeschränkung eingehalten wurde (dies ist aktuell immer der Fall). Personen, die nicht gültig gewählt haben, können allen Projekten zugewiesen werden, die von der Altersbeschränkung her passen. Man kann nicht ein Projekt wählen, in dem man Projektleiter ist.
          </p>

          <p>
            Die gültigen Wahlen werden in Punkte umgerechnet. Aktuell zählt die Erstwahl 11 Punkte, die Zweitwahl 7 Punkte, die Drittwahl 4 Punkte, die Viertwahl 2 Punkte und die Fünftwahl einen Punkt.
          </p>

          <p>
            Der Kern des nun folgenden Algorithmus ist es, die Summe der Punktzahlen von allen Personen zusammen zu maximieren.
          </p>
        </div>
      `;
    }
  }
);

customElements.define("pw-evaluation", PwEvaluation);
