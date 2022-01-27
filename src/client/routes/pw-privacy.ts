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
import { html, LitElement } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { setupHmr } from "../hmr.js";
import { bootstrapCss } from "../index.js";

export class PwPrivacy extends LitElement {
  protected render() {
    return html`
  ${bootstrapCss}

<div class="container">

<h1 class="text-center">Datenschutzerklärung</h1>

<h2 class="text-center">Verantwortlicher</h2>

Der Name und die Kontaktdaten des Verantwortlichen nach <a href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2269-1-1">Artikel 13 Absatz 1a DSGVO</a> lauten:

Moritz Hedtke
Anne-Frank-Straße 10
64354 Reinheim
06162 2918
<a href="mailto:Moritz.Hedtke@t-online.de">Moritz.Hedtke@t-online.de</a>

<h2 class="text-center">Serverlogdateien</h2>

Es werden Serverlogdateien mit Daten zu Ihren Browseranfragen (Zeitstempel, IP-Adresse, HTTP-Methode, URL, User-Agent, Referrer, Antwortzeit, Antwort-Code, Antwortgröße und ggf. Fehlermeldung) gespeichert. Diese werden nach <a href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e1906-1-1">Artikel 6 Absatz 1f DSGVO</a> verarbeitet, die nach <a href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2269-1-1">Artikel 13 Absatz 1d DSGVO</a> zu nennenden berechtigten Interessen von uns sind die Aufrechterhaltung des Dienstes, die Fehlersuche, das Erkennen von Angriffen und die Überprüfung der Performance, Verfügbarkeit und Funktionstüchtigkeit des Dienstes. Diese Daten werden für maximal 7 Tage gespeichert (<a href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2269-1-1">Artikel 13 Absatz 2a DSGVO</a>).

<h2 class="text-center">Nutzerdaten</h2>

Folgende personenbezogene Daten werden für den Zweck der Durchführung der Projektwoche erhoben:
voller Name, Nutzername, Schul-Emailadresse, Nutzertyp (Schüler*in, Lehrer*in, Admin), Klasse.
Die personenbezogenen Daten werden nach <a href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e1906-1-1">Artikel 6 Absatz 1a DSGVO</a> mit Ihrer Einwilligung verarbeitet.
Sie haben nach <a href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2019-1-1">Artikel 7 Absatz 3 DSGVO</a> das Recht, ihre Einwilligung jederzeit zu widerrufen.
Die Daten werden gemäß <a href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2370-1-1">Artikel 14 DSGVO</a> nicht bei Ihnen erhoben, sondern bei:
Viktor Neufeld, StD
Komm. Leitung (i.V.) der Albert-Einstein-Schule
Albert-Einstein-Schule
Hügelstraße 20
64401 Groß-Bieberau
Tel. 06162/9313-0
<a href="mailto:aes_gross-bieberau@schulen.ladadi.de">aes_gross-bieberau@schulen.ladadi.de</a>
Den Datenschutzbeauftragten erreichen Sie unter
<a href="mailto:schaal@aesgb.de">schaal@aesgb.de</a>
oder der Postadresse mit dem Zusatz „Datenschutzbeauftragter“.
Diese werden in Einklang mit <a href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2370-1-1">Artikel 14 Absatz 2a DSGVO</a> bis zum Ende der Projektwoche gespeichert.
Die Daten sind nach <a href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2370-1-1">Artikel 14 Absatz 2f</a> von der oben genannten Quelle aus dem Schülerstammverzeichnis.

<h2 class="text-center">Weitere Daten</h2>

Folgende personenbezogene Daten werden für den nach <a href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2269-1-1">Artikel 13 Absatz 1c DSVGO</a> zu nennenden Zweck der Erstellung und Wahl von Projekten für die Projektwoche und die anschließende automatisierte Zuweisung zu Projekten verarbeitet:
welches Projekt man ggf. leitet, gewählte Projekte, Daten in erstellten/geänderten Projekten (inklusive vergangene Änderungen), Daten in erstellten/geänderten Nutzern (inklusive vergangene Änderungen), Abwesenheit in Projektwoche, optionales <strong>lokales</strong> „verschlüsseltes“ Passwort (technisch genannt „gehasht“) (nicht das Schulaccountpasswort).
Die personenbezogenen Daten werden nach <a href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e1906-1-1">Artikel 6 Absatz 1a DSGVO</a> mit Ihrer Einwilligung verarbeitet.
Sie haben nach <a href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2019-1-1">Artikel 7 Absatz 3 DSGVO</a> das Recht, ihre Einwilligung jederzeit zu widerrufen.
Diese werden in Einklang mit <a href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2370-1-1">Artikel 14 Absatz 2a DSGVO</a> bis zum Ende der Projektwoche gespeichert.

<h2 class="text-center">Automatische Entscheidungsfindung</h2>

Die Zuweisung in Projekte ist nach <a href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2853-1-1">Artikel 22 DSGVO</a> eine automatisierte Entscheidung, für die eine ausdrückliche Einwilligung nach <a href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2853-1-1">Artikel 22 Absatz 2c DSGVO</a> erfolgt ist.
Gemäß <a href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2853-1-1">Artikel 22 Absatz 3 DSGVO</a> können Sie die Entscheidung anfechten.

<h2 class="text-center">Anmeldung mit Microsoft-Schulaccount</h2>

</div>
    `;
  }
}

customElements.define("pw-privacy", PwPrivacy);
