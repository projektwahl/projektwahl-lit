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
import { html } from "lit";
import { PwElement } from "../pw-element.js";

// workaround see https://github.com/runem/lit-analyzer/issues/149#issuecomment-1006162839
export function pwEvaluation(
  props: Record<string, never> // Pick<PwEvaluation, never>
) {
  const { ...rest } = props;
  let _ = rest;
  _ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
  return html`<pw-evaluation></pw-evaluation>`;
}

export class PwEvaluation extends PwElement {
  protected render() {
    return html`
      <div class="container">
        <h1 class="text-center">Wie funktioniert die Auswertung?</h1>

        <p>
          Zuerst einmal vorneweg: Wer sich von der Richtigkeit der Angaben hier
          überzeugen möchte, kann im
          <a
            href="https://github.com/projektwahl/projektwahl-lit/blob/main/src/server/routes/evaluate/index.ts"
            target="_blank"
            rel="noopener"
            >Quellcode</a
          >
          nachschauen. Leider kann man nicht überprüfen, ob dieser Code auch
          tatsächlich für die Auswertung verwendet wurde, da dafür die Wahl
          aller Personen veröffentlicht werden müsste. Aber mit Hilfe des Codes
          kann zumindest überprüft werden, ob das Ergebnis plausibel ist.
        </p>

        <p>
          Fangen wir mit den Grundlagen an: Die Wahl einer Person ist gültig,
          wenn genau fünf Projekte gewählt wurden und dabei die
          Altersbeschränkung eingehalten wurde (dies ist aktuell immer der
          Fall). Personen, die nicht gültig gewählt haben, können allen
          Projekten zugewiesen werden, die von der Altersbeschränkung her passen
          (und solche zufälligen Zuweisungen erlauben). Man kann nicht ein
          Projekt wählen, in dem man Projektleiter ist.
        </p>

        <p>
          Die gültigen Wahlen werden in Punkte umgerechnet. Aktuell zählt die
          Erstwahl 11 Punkte, die Zweitwahl 7 Punkte, die Drittwahl 4 Punkte,
          die Viertwahl 2 Punkte und die Fünftwahl einen Punkt.
        </p>

        <p>
          Der Kern des nun folgenden Algorithmus ist es, die Summe der
          Punktzahlen von allen Personen zusammen zu maximieren. Dafür wird ein
          sehr großes Gleichungssystem erstellt und dieses dann automatisch (per
          Hand, sehr witzig) gelöst.
        </p>

        <p>
          Wenn ein Projekt zustandekommt, in dem man Projektleiter ist, kommt
          man logischerweise in dieses Projekt. Ansonsten kommt man
          logischerweise in genau <b>ein</b> Projekt. Man kann natürlich nur in
          existierende Projekte kommen (hoffentlich).
        </p>

        <p>
          Kommen wir nun zum komplizierteren Teil: In jedem Projekt müssen
          eigentlich die Mindestteilnehmer und Maximalteilnehmer eingehalten
          werden. Wenn dies nicht möglich ist, kann das Projekt normalerweise
          nicht stattfinden.
        </p>

        <p>
          Wenn es jetzt jedoch keine mögliche Zuordnung mit diesen
          Einschränkungen geben würde (was schon vorgekommen ist), dann erhält
          man vom Algorithmus ein sehr "hilfreiches": "Es existiert keine Lösung
          des Gleichungssystems". Da man damit wenig anfangen kann und vor allem
          nicht weiß, bei welchem Projekt man am Besten die Einschränkungen
          lockert, gibt es ein sehr unfavorisiertes Überbelegen oder
          Unterbelegen von Projekten. Dadurch sieht man dann, bei welchen
          Projekten man am Besten die Größe ändert. Wenn dies nicht möglich ist,
          kann man (bald) für einzelne Projekte dies deaktivieren.
        </p>

        <p>
          Somit sollte es nur noch wenige Möglichkeiten geben, wo der
          Algorithmus keinen Hinweis geben kann, was das Problem ist.
        </p>

        <p>Kommen wir nun zu ein paar Beispielen:</p>

        <p>
          Beispiel 1 (<a
            href="https://github.com/projektwahl/projektwahl-lit/blob/c2e3f2a93ba3c12a27c8aeaae13e57dc2932d54a/tests/e2e/test-calculate.ts#L96"
            target="_blank"
            rel="noopener"
            >test3</a
          >
          im Code): Es gibt fünf Projekte mit Mindestteilnehmeranzahl fünf und
          eine Person, die nicht gewählt hat. Der Algorithmus wählt dann ein
          zufälliges Projekt und weist die Person diesem zu (da
          Altersbeschränkung etc. eingehalten ist). Dieses hat dann 4 Personen
          zu wenig, sodass dies als Hinweis angezeigt wird.
        </p>
      </div>
    `;
  }
}

customElements.define("pw-evaluation", PwEvaluation);
