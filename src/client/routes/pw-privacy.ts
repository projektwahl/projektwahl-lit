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

export const PwPrivacy = setupHmr(
  "PwPrivacy",
  class PwPrivacy extends LitElement {
    protected render() {
      return html`
        ${bootstrapCss}

        <div class="container">
          <h1 class="text-center">Datenschutzerklärung</h1>

          <h1 class="P34">
            <a id="a__Datenschutzerklärung"><span /></a>Datenschutzerklärung
          </h1>
          <h2 class="P39">
            <a id="a__Verantwortlicher"><span /></a>Verantwortlicher
          </h2>
          <p class="P6">
            <span class="T3"
              >Der Name und die Kontaktdaten des Verantwortlichen nach </span
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2269-1-1"
              class="Internet_20_link"
              >Artikel 13 </a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2269-1-1"
              class="Internet_20_link"
              ><span class="T3">Absatz 1a</span></a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2269-1-1"
              class="Internet_20_link"
            >
            </a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2269-1-1"
              class="Internet_20_link"
              ><span class="T2">DSGV</span></a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2269-1-1"
              class="Internet_20_link"
              ><span class="T3">O</span></a
            ><span class="T3"> lauten:</span>
          </p>
          <p class="P9">Moritz Hedtke</p>
          <p class="P9">Anne-Frank-Straße 10</p>
          <p class="P9">64354 Reinheim</p>
          <p class="P9">06162 2918</p>
          <p class="P9">
            <a href="mailto:Moritz.Hedtke@t-online.de" class="Internet_20_link"
              >Moritz.Hedtke@t-online.de</a
            >
          </p>
          <h2 class="P40">
            <a id="a__Serverlogdateien"><span /></a>Serverlogdateien
          </h2>
          <div class="P12">
            <span class="T47">Es</span>
            <span class="T15">werden Serverlogdateien mit </span
            ><span class="T85">Daten zu Ihren </span
            ><span class="T87">Browsera</span><span class="T85">nfragen </span
            ><span class="T88">(</span
            ><span class="T15"
              >Zeitstempel, IP-Adresse, HTTP-Methode, URL, </span
            ><span class="T31">User-Agent, </span
            ><span class="T32">Referrer,</span
            ><span class="T15"> Antwortzeit, Antwort-Code, Antwortgröße </span
            ><span class="T86">und</span><span class="T15"> </span
            ><span class="T16">ggf. Fehlermeldung</span
            ><span class="T88">)</span><span class="T16"> gespeichert. </span
            ><span class="T17">Diese werden nach </span
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e1906-1-1"
              class="Internet_20_link"
              ><span class="T17">Artikel 6 Absatz </span></a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e1906-1-1"
              class="Internet_20_link"
              ><span class="T21">1f DSGVO</span></a
            ><span class="T17"> </span><span class="T18">verarbeitet, </span
            ><span class="T22">die nach </span
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2269-1-1"
              class="Internet_20_link"
              ><span class="T22">Artikel 13 Absatz 1d </span></a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2269-1-1"
              class="Internet_20_link"
              ><span class="T24">DSGVO</span></a
            ><span class="T22"> zu nennenden berechtigten Interessen von </span
            ><span class="T59">uns</span><span class="T22"> sind die </span
            ><span class="T17">Aufrechterhaltung des Dienstes, </span
            ><span class="T23">die</span><span class="T17"> Fehlersuche, </span
            ><span class="T23">das</span
            ><span class="T17"> Erkennen von Angriffen und </span
            ><span class="T23">die</span
            ><span class="T17">
              Überprüfung der Performance, Verfügbarkeit </span
            ><span class="T19">und Funktionstüchtigkeit </span
            ><span class="T23">des Dienstes. </span
            ><span class="T25"
              >Diese Daten werden für maximal 7 Tage gespeichert </span
            ><span class="T26">(</span
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2269-1-1"
              class="Internet_20_link"
              ><span class="T26">Artikel 13 Absatz 2a DSGVO</span></a
            ><span class="T26">)</span><span class="T25">.</span
            ><span class="T25"
              ><span
                xmlns=""
                title="annotation"
                class="annotation_style_by_filter"
                ><br />[ANNOTATION:<br /><br /><span title="dc:creator"
                  >BY 'Unbekannter Autor'</span
                ><br /><span title="dc:date"
                  >ON '2022-01-22T17:12:04.987515051'</span
                ><br /><span
                  >NOTE: '<span
                    xmlns="http://www.w3.org/1999/xhtml"
                    class="T104"
                    > </span
                  ><span xmlns="http://www.w3.org/1999/xhtml" class="T104"
                    >Zeitdauer muss ich noch sicherstellen</span
                  >'</span
                >]</span
              ></span
            >
          </div>
          <h1 class="P35">
            <a id="a__Nutzerdaten"></a>Nutzerdaten
          </h1>
          <p class="P31">
            F<span class="T33">olgende personenbezogene Daten </span
            ><span class="T69">werden </span
            ><span class="T33"
              >für den Zweck der Durchführung der Projektwoche erhoben:</span
            >
          </p>
          <p class="P14">
            <span class="T94">voller Name</span>,
            <span class="T95">Nutzername,</span> <span class="T89">Schul-</span
            ><span class="T94">Em</span><span class="T89">ail</span
            ><span class="T94">adresse</span>,
            <span class="T34"
              >Nutzertyp (Schüler*in, Lehrer*in, Admin), Klasse.</span
            >
          </p>
          <p class="P2">
            <span class="T12">Die </span
            ><span class="T14">personenbezogenen</span
            ><span class="T12"> Daten werden nach </span
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e1906-1-1"
              class="Internet_20_link"
              >Artikel </a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e1906-1-1"
              class="Internet_20_link"
              ><span class="T13">6 Absatz 1</span></a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e1906-1-1"
              class="Internet_20_link"
              ><span class="T12">a </span></a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e1906-1-1"
              class="Internet_20_link"
              >DSGVO</a
            ><span class="T12"> mit Ihrer Einwilligung verarbeitet.</span>
          </p>
          <p class="P4">
            <span class="T20">Sie haben nach </span
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2019-1-1"
              class="Internet_20_link"
              >Artikel 7 </a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2019-1-1"
              class="Internet_20_link"
              ><span class="T20">Absatz 3 </span></a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2019-1-1"
              class="Internet_20_link"
              >DSGVO</a
            >
            <span class="T20">das Recht, ihre </span>Einwilligung
            <span class="T20">jederzeit zu widerrufen.</span>
          </p>
          <p class="P7">
            <span class="T27">Die Daten </span><span class="T29">werden</span
            ><span class="T27"> </span><span class="T28">gemäß</span
            ><span class="T27"> </span
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2370-1-1"
              class="Internet_20_link"
              >Artikel 14 </a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2370-1-1"
              class="Internet_20_link"
              ><span class="T27">DSGVO</span></a
            >
            <span class="T27">nicht bei Ihnen erhoben, sondern bei:</span>
          </p>
          <div class="P7">
            Viktor Neufeld, StD<span
              xmlns=""
              title="annotation"
              class="annotation_style_by_filter"
              ><br />[ANNOTATION:<br /><br /><span title="dc:creator"
                >BY 'Unbekannter Autor'</span
              ><br /><span title="dc:date"
                >ON '2022-01-22T17:12:51.322060969'</span
              ><br /><span
                >NOTE: '<span xmlns="http://www.w3.org/1999/xhtml" class="T104"
                  > </span
                ><span xmlns="http://www.w3.org/1999/xhtml" class="T104"
                  >nachfragen, ob das passt</span
                >'</span
              >]</span
            ><br />Komm. Leitung (i.V.) der Albert-Einstein-Schule
          </div>
          <p class="P21">
            Albert-Einstein-Schule<br />Hügelstraße 20<br />64401 Groß-Bieberau
          </p>
          <p class="P21">
            Tel. 06162/9313-0<br /><a
              href="mailto:aes_gross-bieberau@schulen.ladadi.de"
              class="Internet_20_link"
              >aes_gross-bieberau@schulen.ladadi.de</a
            >
          </p>
          <p class="P13">Den Datenschutzbeauftragten erreichen Sie unter</p>
          <p class="P13">
            <a href="mailto:schaal@aesgb.de" class="Internet_20_link"
              >schaal@aesgb.de</a
            >
          </p>
          <p class="P21">
            oder <span class="T30">der</span> Postadresse mit dem Zusatz
            „Datenschutzbeauftragter“.
          </p>
          <p class="P16">
            Diese werden in Einklang mit
            <a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2370-1-1"
              class="Internet_20_link"
              >Artikel 14 Absatz 2a DSGVO</a
            >
            bis zum Ende der Projektwoche gespeichert.
          </p>
          <p class="P18">
            Die Daten sind nach
            <a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2370-1-1"
              class="Internet_20_link"
              >Artikel 14 Absatz 2f</a
            >
            von der oben genannten Quelle aus dem Schülerstammverzeichnis.
          </p>
          <h1 class="P36">
            <a id="a__Weitere_Daten"><span /></a>Weitere Daten
          </h1>
          <p class="P11">
            <span class="T60"
              >Folgende personenbezogene Daten werden für den </span
            ><span class="T61">nach </span
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2269-1-1"
              class="Internet_20_link"
              >Artikel 13 Absatz 1c DSVGO</a
            >
            <span class="T61">zu nennenden</span
            ><span class="T60"> Zweck der</span><span class="T4"> </span
            ><span class="T5">Erstellung und </span
            ><span class="T4"
              >Wahl von Projekten für die Projektwoche und die anschließende </span
            ><span class="T6">automatisierte</span
            ><span class="T4"> Zuweisung zu Projekten </span
            ><span class="T60">verarbeitet</span><span class="T4">:</span>
          </p>
          <p class="P15">
            <span class="T34">welches Projekt man ggf. leitet, </span
            ><span class="T91">g</span
            ><span class="T34"
              >ewählte Projekte, Daten in erstellten/geänderten Projekten </span
            ><span class="T93">(inklusive </span
            ><span class="T97">vergangene Änderungen</span
            ><span class="T93">)</span><span class="T34">, </span
            ><span class="T92">Daten in erstellten/geänderten Nutzern </span
            ><span class="T93">(inklusive </span
            ><span class="T97">vergangene Änderungen</span
            ><span class="T93">)</span><span class="T35">, </span
            ><span class="T34">Abwesenheit in Projektwoche, </span
            ><span class="T96">optionales </span><span class="T68">lokales</span
            ><span class="T89"> </span>„<span class="T72"
              >verschlüsseltes“ </span
            ><span class="T34">Passwort (</span
            ><span class="T73">technisch genannt „gehasht“</span
            ><span class="T34">) </span
            ><span class="T89">(nicht das Schulaccountpasswort)</span
            ><span class="T34">.</span>
          </p>
          <p class="P1">
            <span class="T12">Die </span
            ><span class="T14">personenbezogenen</span
            ><span class="T12"> Daten werden nach </span>
            <a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e1906-1-1"
              class="Internet_20_link"
              >Artikel </a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e1906-1-1"
              class="Internet_20_link"
              ><span class="T13">6 Absatz 1</span></a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e1906-1-1"
              class="Internet_20_link"
              ><span class="T12">a </span></a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e1906-1-1"
              class="Internet_20_link"
              >DSGVO</a
            ><span class="T12"> mit Ihrer Einwilligung verarbeitet.</span>
          </p>
          <p class="P3">
            <span class="T20">Sie haben nach </span
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2019-1-1"
              class="Internet_20_link"
              >Artikel 7 </a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2019-1-1"
              class="Internet_20_link"
              ><span class="T20">Absatz 3 </span></a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2019-1-1"
              class="Internet_20_link"
              >DSGVO</a
            >
            <span class="T20">das Recht, ihre </span>Einwilligung
            <span class="T20">jederzeit zu widerrufen.</span>
          </p>
          <p class="P17">
            Diese werden in Einklang mit
            <a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2370-1-1"
              class="Internet_20_link"
              >Artikel 14 Absatz 2a DSGVO</a
            >
            bis zum Ende der Projektwoche gespeichert.
          </p>
          <h1 class="P37">
            <a id="a__Automatische_Entscheidungsfindung"><span /></a
            ><span class="T57">A</span>utomatische Entscheidungsfindung
          </h1>
          <p class="P8">
            <span class="T45">Die Zuweisung in Projekte ist nach </span
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2853-1-1"
              class="Internet_20_link"
              >Artikel 2</a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2853-1-1"
              class="Internet_20_link"
              ><span class="T44">2</span></a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2853-1-1"
              class="Internet_20_link"
            >
            </a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2853-1-1"
              class="Internet_20_link"
              ><span class="T43">DSGVO</span></a
            ><span class="T43"> </span
            ><span class="T45"
              >eine automatisierte Entscheidung, für die eine ausdrückliche
              Einwilligung nach </span
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2853-1-1"
              class="Internet_20_link"
              ><span class="T45">Artikel 22 Absatz 2c</span></a
            ><span class="T45"> erfolgt ist.</span>
          </p>
          <div class="P26">
            <span xmlns="" title="annotation" class="annotation_style_by_filter"
              ><br />[ANNOTATION:<br /><br /><span title="dc:creator"
                >BY 'Unbekannter Autor'</span
              ><br /><span title="dc:date"
                >ON '2022-01-22T17:13:13.811060364'</span
              ><br /><span
                >NOTE: '<span xmlns="http://www.w3.org/1999/xhtml" class="T104"
                  >Kurze Beschreibung des Zuweisungsverfahrens</span
                >'</span
              >]</span
            ><span class="T98">Gemäß </span
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2853-1-1"
              class="Internet_20_link"
              ><span class="T98">Artikel 22 Absatz 3 </span></a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2853-1-1"
              class="Internet_20_link"
              ><span class="T46">DSGVO</span></a
            ><span class="T98"> können Sie die Entscheidung anfechten.</span>
          </div>
          <h2 class="Heading_20_2">
            <a id="a__Anmeldung_mit_Microsoft-Schulaccount"><span /></a
            ><span class="T48">Anmeldung</span> mit Microsoft-<span class="T49"
              >Schula</span
            >ccount
          </h2>
          <p class="P22">
            Bei der Anmeldung mit einem Microsoft-Schulaccount übermitteln Sie
            <span class="T99">den</span> Nutzernamen und
            <span class="T99">das </span>Passwort direkt an Microsoft.
          </p>
          <p class="P23">
            Bei erfolgreichem Login erhalten wir
            <span class="T51">Ihre</span> Nutzer-ID,
            <span class="T54">Name, Nutzername,</span> E-Mail
            <span class="T55">und weitere grundlegende Nutzerinformationen</span
            >, <span class="T50">sowie </span
            ><span class="T55"
              >digital signierte Tokens, damit die Echtheit der Anmeldung
              verifiziert werden kann</span
            ><span class="T50">. </span
            ><span class="T51"
              >Diese werden ausschließlich verwendet, um Sie auf unserer Website
              zu authentifizieren und nicht gespeichert. </span
            ><span class="T52"
              >Es wird nur ein Sitzungs-Cookie gesetzt, das mit Ihrem lokalen
              Account verknüpft ist. </span
            ><span class="T53"
              >Dieses gilt maximal wenige Tage und wird dann gelöscht.</span
            >
          </p>
          <p class="P24">
            Sie können das Cookie in Ihrem Browser jederzeit löschen,
            <span class="T70">wodurch</span> sie ab<span class="T70">ge</span
            >meldet <span class="T70">werden</span>. Wenn Sie den Logout-Button
            verwenden, wird ihre Sitzung auch auf dem Server gelöscht, was
            sicherer ist.
          </p>
          <h2 class="P41">
            <a id="a__Lokale_Anmeldung"><span /></a>Lokale Anmeldung
          </h2>
          <p class="P27">
            Bei der lokalen Anmeldung übermitteln Sie uns direkt ihren
            Nutzernamen und <span class="T100">das </span
            ><span class="T67">lokale</span><span class="T100"> </span>Passwort
            über eine <span class="T56">sicher </span>verschlüsselte Verbindung.
            <span class="T56"
              >Das Passwort wird nicht gespeichert, sondern nur mithilfe eines
              „</span
            ><span class="T74">verschlüsselten“ Passworts </span
            ><span class="T34">(</span
            ><span class="T73">technisch genannt „gehasht“</span
            ><span class="T34">)</span
            ><span class="T56"> geprüft und Sie ggf. angemeldet. </span
            ><span class="T52"
              >Es wird ein Sitzungs-Cookie gesetzt, das mit Ihrem lokalen
              Account verknüpft ist. </span
            ><span class="T53"
              >Dieses gilt maximal wenige Tage und wird dann gelöscht.</span
            >
          </p>
          <p class="P25">
            Sie können das Cookie in Ihrem Browser jederzeit löschen,
            <span class="T70">wodurch</span> sie ab<span class="T70">ge</span
            >meldet <span class="T70">werden</span>. Wenn Sie den Logout-Button
            verwenden, wird ihre Sitzung auch auf dem Server gelöscht, was
            sicherer ist.
          </p>
          <h2 class="Heading_20_2">
            <a id="a__Rechte"><span /></a>Rechte
          </h2>
          <p class="P19">
            <span class="T36">Gemäß </span
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2528-1-1"
              class="Internet_20_link"
              ><span class="T1">Artikel 15 </span></a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2528-1-1"
              class="Internet_20_link"
              ><span class="T36">DSGVO</span></a
            ><span class="T36"> </span><span class="T37">haben </span
            ><span class="T38">S</span><span class="T37">ie das</span> Recht auf
            Auskunft.
          </p>
          <p class="P19">
            <span class="T77">Gemäß </span
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2614-1-1"
              class="Internet_20_link"
              ><span class="T78">Artikel 16 </span></a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2614-1-1"
              class="Internet_20_link"
              ><span class="T77">DSGVO</span></a
            ><span class="T77"> </span><span class="T79">haben Sie </span
            ><span class="T80">das Recht auf Berichtigung.</span>
          </p>
          <p class="P19">
            <span class="T39">Gemäß </span
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2621-1-1"
              class="Internet_20_link"
              ><span class="T1">Artikel 17 </span></a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2621-1-1"
              class="Internet_20_link"
              ><span class="T40">DSGVO</span></a
            ><span class="T1"> </span
            ><span class="T39">haben Sie das Recht </span
            ><span class="T75">auf </span>Löschung.
          </p>
          <p class="P5">
            <span class="T40">Gemäß </span
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2715-1-1"
              class="Internet_20_link"
              >Artikel 18 </a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2715-1-1"
              class="Internet_20_link"
              ><span class="T40">DSGVO</span></a
            ><span class="T40"> haben Sie das Recht </span
            ><span class="T76">auf </span
            ><span class="T40">Einschränkung der Verarbeitung.</span>
          </p>
          <p class="P5">
            <span class="T41">Gemäß </span
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2761-1-1"
              class="Internet_20_link"
              >Artikel 19 </a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2761-1-1"
              class="Internet_20_link"
              ><span class="T41">DSGVO</span></a
            ><span class="T41">
              werden allen Empfängern, denen personenbezogene Daten offengelegt
              wurden, jede Berichtigung, Löschung oder Einschränkung der
              Verarbeitung gemäß den dort genannten Einschränkungen
              mitgeteilt.</span
            >
          </p>
          <p class="P5">
            <span class="T42">Gemäß </span
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2768-1-1"
              class="Internet_20_link"
              >Artikel 20 </a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2768-1-1"
              class="Internet_20_link"
              ><span class="T42">DSGVO</span></a
            ><span class="T42">
              haben Sie das Recht auf Datenübertragbarkeit.</span
            >
          </p>
          <p class="P5">
            <span class="T64">Gemäß </span
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2818-1-1"
              class="Internet_20_link"
              ><span class="T63">Artikel 2</span></a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2818-1-1"
              class="Internet_20_link"
              ><span class="T65">1</span></a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2818-1-1"
              class="Internet_20_link"
              ><span class="T63"> </span></a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e2818-1-1"
              class="Internet_20_link"
              ><span class="T64">DSGVO</span></a
            ><span class="T64">
              haben Sie das Recht, jederzeit gegen die Verarbeitung Sie
              betreffender personenbezogene</span
            ><span class="T66">r</span>
            <span class="T64"> Daten zu widersprechen.</span>
          </p>
          <p class="P20">
            Mit Hetzner wurde ein Auftragsverarbeitungsvertrag nach
            <a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e3162-1-1"
              class="Internet_20_link"
              >Artikel 28 DSGVO</a
            >
            abgeschlossen.
          </p>
          <p class="P10">
            <span class="T7">Ebenfalls werden </span
            ><span class="T101">die Daten</span
            ><span class="T7"> im Einklang mit</span><span class="T58"> </span
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e3395-1-1"
              class="Internet_20_link"
              ><span class="T58">Artikel 32 DSGVO</span></a
            ><span class="T58"> </span
            ><span class="T8">sicher verarbeitet:</span>
          </p>
          <ul>
            <li>
              <p class="P42" style="margin-left:0cm;">
                <span
                  class="Bullet_20_Symbols"
                  style="display:block;float:left;min-width:0cm;"
                  >•</span
                >Die Verbindung zum Server ist TLS 1.2 oder
                <span class="T82">TLS</span> 1.3 verschlüsselt.<span
                  class="odfLiEnd"
                /> 
              </p>
            </li>
            <li>
              <p class="P43" style="margin-left:0cm;">
                <span
                  class="Bullet_20_Symbols"
                  style="display:block;float:left;min-width:0cm;"
                  >•</span
                >Die Daten sind mit Passwörtern oder durch
                <span class="T83">Anmeldung mit einem </span
                ><span class="T62">Microsoft-Schulaccount</span> geschützt.<span
                  class="odfLiEnd"
                /> 
              </p>
            </li>
            <li>
              <p class="P44" style="margin-left:0cm;">
                <span
                  class="Bullet_20_Symbols"
                  style="display:block;float:left;min-width:0cm;"
                  >•</span
                ><span class="T9">Die personenbezogenen Daten sind </span>vor
                unbefugter oder unrechtmäßiger Verarbeitung und vor
                unbeabsichtigtem Verlust, unbeabsichtigter Zerstörung oder
                unbeabsichtigter Schädigung durch geeignete technische und
                organisatorische Maßnahmen <span class="T10">geschützt:</span
                ><span class="odfLiEnd" /> 
              </p>
              <ul>
                <li>
                  <p class="P44" style="margin-left:0cm;">
                    <span
                      class="Bullet_20_Symbols"
                      style="display:block;float:left;min-width:0cm;"
                      >◦</span
                    > <span class="T11">S</span>ie werden auf einem Server in
                    der
                    <a
                      href="https://www.hetzner.com/de/"
                      class="Internet_20_link"
                      >Hetzner</a
                    >
                    Cloud in Deutschland gespeichert und ein
                    Auftragsverarbeitungsvertrag
                    <span class="T71">wurde</span> abgeschlossen.<span
                      class="odfLiEnd"
                    /> 
                  </p>
                </li>
                <li>
                  <p class="P45" style="margin-left:0cm;">
                    <span
                      class="Bullet_20_Symbols"
                      style="display:block;float:left;min-width:0cm;"
                      >◦</span
                    >Der Quellcode ist unter
                    <a
                      href="https://github.com/projektwahl/projektwahl-lit/"
                      class="Internet_20_link"
                      >https://github.com/projektwahl/projektwahl-lit/</a
                    >
                    einsehbar.<span class="odfLiEnd" /> 
                  </p>
                </li>
                <li>
                  <p class="P46" style="margin-left:0cm;">
                    <span
                      class="Bullet_20_Symbols"
                      style="display:block;float:left;min-width:0cm;"
                      >◦</span
                    >Die Entwicker führen
                    <span class="T81">Sicherheitstests</span> durch, was unter
                    <a
                      href="https://github.com/projektwahl/projektwahl-lit/issues/56"
                      class="Internet_20_link"
                      >https://github.com/projektwahl/projektwahl-lit/issues/56</a
                    >
                    einsehbar ist.<span class="odfLiEnd" /> 
                  </p>
                </li>
                <li>
                  <p class="P47" style="margin-left:0cm;">
                    <span
                      class="Bullet_20_Symbols"
                      style="display:block;float:left;min-width:0cm;"
                      >◦</span
                    >Es gibt einen eigenen Server pro Projektwoche.<span
                      class="odfLiEnd"
                    /> 
                  </p>
                </li>
                <li>
                  <p class="P48" style="margin-left:0cm;">
                    <span
                      class="Bullet_20_Symbols"
                      style="display:block;float:left;min-width:0cm;"
                      >◦</span
                    >Die Software auf dem Server wird stets auf dem aktuellen
                    Stand gehalten.<span class="odfLiEnd" /> 
                  </p>
                </li>
                <li>
                  <p class="P49" style="margin-left:0cm;">
                    <span
                      class="Bullet_20_Symbols"
                      style="display:block;float:left;min-width:0cm;"
                      >◦</span
                    >Es gibt explizit
                    <span class="T84">eine </span>Kontaktadresse zum Melden von
                    Sicherheitslücken, siehe
                    <a
                      href="https://github.com/projektwahl/projektwahl-lit/blob/main/SECURITY.md"
                      class="Internet_20_link"
                      >https://github.com/projektwahl/projektwahl-lit/blob/main/SECURITY.md</a
                    ><span class="odfLiEnd" /> 
                  </p>
                </li>
                <li>
                  <p class="P50" style="margin-left:0cm;">
                    <span
                      class="Bullet_20_Symbols"
                      style="display:block;float:left;min-width:0cm;"
                      >◦</span
                    >Nur Moritz Hedtke (und der Serverhoster
                    <a
                      href="https://www.hetzner.com/de/"
                      class="Internet_20_link"
                      >Hetzner</a
                    >) haben direkten Zugriff auf den Server.<span
                      class="odfLiEnd"
                    /> 
                  </p>
                </li>
              </ul>
            </li>
          </ul>
          <p class="P5">
            <span class="T46">Gemäß </span
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e3502-1-1"
              class="Internet_20_link"
              >Artikel 34 </a
            ><a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e3502-1-1"
              class="Internet_20_link"
              ><span class="T46">DSGVO</span></a
            ><span class="T46">
              benachrichtigen wir Sie im Falle einer Verletzung des Schutzes Sie
              betreffender personenbezogener Daten.</span
            >
          </p>
          <p class="P28">
            Gemäß
            <a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&amp;from=DE#d1e6110-1-1"
              class="Internet_20_link"
              >Artikel 77 DSGVO</a
            >
            haben Sie das Recht auf Beschwerde bei der zuständigen
            Aufsichtsbehörde.
          </p>
          <h1 class="P38">
            <a id="a__Einwilligung_Projektwoche"><span /></a>Einwilligung
            Projektwoche
          </h1>
          <div class="P29">
            Ihr Kind soll vor den Sommerferien an der Projektwoche teilnehmen.
            <span xmlns="" title="annotation" class="annotation_style_by_filter"
              ><br />[ANNOTATION:<br /><br /><span title="dc:creator"
                >BY 'Unbekannter Autor'</span
              ><br /><span title="dc:date"
                >ON '2022-01-22T17:26:37.316932615'</span
              ><br /><span
                >NOTE: '<span xmlns="http://www.w3.org/1999/xhtml" class="T104"
                  >Gescheiten Text hinschreiben</span
                >'</span
              >]</span
            >Blablablub.
          </div>
          <p class="P29"> </p>
          <div class="P32">
            <span class="T103"
              >Dafür benötigen wir Ihre Zustimmung, dass für die Wahl der
              Projekte personenbezogene Daten </span
            ><span class="T102">(</span><span class="T94">voller Name</span
            ><span class="T90">, </span><span class="T95">Nutzername,</span
            ><span class="T90"> </span><span class="T89">Schul-</span
            ><span class="T94">Em</span><span class="T89">ail</span
            ><span class="T94">adresse</span><span class="T90">, </span
            ><span class="T34"
              >Nutzertyp (Schüler*in, Lehrer*in, Admin), Klasse</span
            >, <span class="T34">welches Projekt man ggf. leitet, </span
            ><span class="T91">g</span
            ><span class="T34"
              >ewählte Projekte, Daten in erstellten/geänderten Projekten </span
            ><span class="T93">(inklusive </span
            ><span class="T97">vergangene Änderungen</span
            ><span class="T93">)</span><span class="T34">, </span
            ><span class="T92">Daten in erstellten/geänderten Nutzern </span
            ><span class="T93">(inklusive </span
            ><span class="T97">vergangene Änderungen</span
            ><span class="T93">)</span><span class="T35">, </span
            ><span class="T34">Abwesenheit in Projektwoche, </span
            ><span class="T96">optionales </span><span class="T68">lokales</span
            ><span class="T89"> </span><span class="T90">„</span
            ><span class="T72">verschlüsseltes“ </span
            ><span class="T34">Passwort (</span
            ><span class="T73">technisch genannt „gehasht“</span
            ><span class="T34">) </span
            ><span class="T89">(nicht das Schulaccountpasswort)</span
            ><span class="T102">)</span
            ><span class="T103">
              gespeichert werden dürfen und die Zuweisung zu Projekten
              automatisiert erfolgen darf. Die gesamte Datenschutzerklärung
              können Sie unter </span
            ><span
              xmlns=""
              title="annotation"
              class="annotation_style_by_filter"
              ><br />[ANNOTATION:<br /><br /><span title="dc:creator"
                >BY 'Unbekannter Autor'</span
              ><br /><span title="dc:date"
                >ON '2022-01-22T17:26:28.738103528'</span
              ><br /><span
                >NOTE: '<span xmlns="http://www.w3.org/1999/xhtml" class="T104"
                  >Link anpassen</span
                >'</span
              >]</span
            ><a
              href="https://testing.projektwahl.selfmade4u.de/datenschutz"
              class="Internet_20_link"
              ><span class="T103"
                >https://testing.projektwahl.selfmade4u.de/datenschutz</span
              ></a
            ><span class="T103"> einsehen.</span>
          </div>
          <p class="P33">Name Ihres Kindes:</p>
          <p class="P33">___________________________________</p>
          <p class="P29" />
          <p class="P29" />
          <p class="P29"> </p>
          <p class="P29">___________________________________</p>
          <p class="P30">Unterschrift erziehungsberechtigte Person</p>
        </div>
      `;
    }
  }
);

customElements.define("pw-privacy", PwPrivacy);
