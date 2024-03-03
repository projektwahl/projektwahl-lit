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
export function pwPrivacy(
  props: Record<string, never> // Pick<PwPrivacy, never>
) {
  const { ...rest } = props;
  const _: Record<string, never> = rest;
  //_ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
  return html`<pw-privacy></pw-privacy>`;
}

export class PwPrivacy extends PwElement {
  protected render() {
    return html`
      <div class="container">
        <h1 class="text-center">Datenschutzerklärung</h1>

        <h2 class="text-center">Verantwortlicher</h2>

        Der Name und die Kontaktdaten des Verantwortlichen nach
        <a
          href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2269-1-1"
          >Artikel 13 Absatz 1a DSGVO</a
        >
        lauten:

        <address>
          Vorname Nachname<br />
          Straße Hausnummer<br />
          Postleitzahl Stadt<br />
          Telefon: <a href="tel:+499123456789">09123 456789</a><br />
          E-Mail: <a href="mailto:E-Mail"
            >E-Mail</a
          >
        </address>

        <h2 class="text-center">Serverlogdateien</h2>

        Es werden Serverlogdateien mit Daten zu Ihren Browseranfragen
        (Zeitstempel, IP-Adresse, HTTP-Methode, URL, User-Agent, Referrer,
        Antwortzeit, Antwort-Code, Antwortgröße und ggf. Fehlermeldung)
        gespeichert. Diese werden nach
        <a
          href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e1906-1-1"
          >Artikel 6 Absatz 1f DSGVO</a
        >
        verarbeitet, die nach
        <a
          href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2269-1-1"
          >Artikel 13 Absatz 1d DSGVO</a
        >
        zu nennenden berechtigten Interessen von uns sind die Aufrechterhaltung
        des Dienstes, die Fehlersuche, das Erkennen von Angriffen und die
        Überprüfung der Performance, Verfügbarkeit und Funktionstüchtigkeit des
        Dienstes. Diese Daten werden für maximal einen Monat gespeichert (<a
          href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2269-1-1"
          >Artikel 13 Absatz 2a DSGVO</a
        >).

        <h2 class="text-center">Nutzerdaten</h2>

        Folgende personenbezogene Daten werden für den Zweck der Durchführung
        der Projektwoche erhoben:<br />

        voller Name, Nutzername, Schul-Emailadresse, Nutzertyp (Schüler*in,
        Lehrer*in, Admin), Klasse.<br />

        Die personenbezogenen Daten werden nach
        <a
          href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e1906-1-1"
          >Artikel 6 Absatz 1a DSGVO</a
        >
        mit Ihrer Einwilligung verarbeitet. Sie haben nach
        <a
          href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2019-1-1"
          >Artikel 7 Absatz 3 DSGVO</a
        >
        das Recht, ihre Einwilligung jederzeit zu widerrufen. Die Daten werden
        gemäß
        <a
          href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2370-1-1"
          >Artikel 14 DSGVO</a
        >
        nicht bei Ihnen erhoben, sondern bei:

        <address>
          Vorname Nachname<br />
          Straße Hausnummer<br />
          Postleitzahl Stadt<br />
          Telefon: <a href="tel:+499123456789">09123 456789</a><br />
          E-Mail: <a href="mailto:E-Mail"
            >E-Mail</a
          >
        </address>

        Die Daten werden in Einklang mit
        <a
          href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2370-1-1"
          >Artikel 14 Absatz 2a DSGVO</a
        >
        bis zum Ende der Projektwoche gespeichert. Sie sind nach
        <a
          href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2370-1-1"
          >Artikel 14 Absatz 2f</a
        >
        von der oben genannten Quelle aus dem Schülerstammverzeichnis. Diese
        werden in Einklang mit
        <a
          href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2370-1-1"
          >Artikel 14 Absatz 2a DSGVO</a
        >
        bis zum Ende der Projektwoche gespeichert.

        <h2 class="text-center">Weitere Daten</h2>

        Folgende personenbezogene Daten werden für den nach
        <a
          href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2269-1-1"
          >Artikel 13 Absatz 1c DSVGO</a
        >
        zu nennenden Zweck der Erstellung und Wahl von Projekten für die
        Projektwoche und die anschließende automatisierte Zuweisung zu Projekten
        verarbeitet:<br />
        welches Projekt man ggf. leitet, in welchem Projekt man ist, gewählte
        Projekte (inklusive vergangene Änderungen), Daten in
        erstellten/geänderten Projekten (inklusive vergangene Änderungen), Daten
        in erstellten/geänderten Nutzern (inklusive vergangene Änderungen),
        Abwesenheit in Projektwoche, optionales
        <strong>lokales</strong> „verschlüsseltes“ Passwort (technisch genannt
        „gehasht“) (nicht das Schulaccountpasswort).<br />
        Die personenbezogenen Daten werden nach
        <a
          href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e1906-1-1"
          >Artikel 6 Absatz 1a DSGVO</a
        >
        mit Ihrer Einwilligung verarbeitet. Sie haben nach
        <a
          href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2019-1-1"
          >Artikel 7 Absatz 3 DSGVO</a
        >
        das Recht, ihre Einwilligung jederzeit zu widerrufen. Diese werden in
        Einklang mit
        <a
          href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2370-1-1"
          >Artikel 14 Absatz 2a DSGVO</a
        >
        bis zum Ende der Projektwoche gespeichert.

        <h2 class="text-center">Anmeldung mit Microsoft-Schulaccount</h2>

        Bei der Anmeldung mit einem Microsoft-Schulaccount übermitteln Sie den
        Nutzernamen und das Passwort direkt an Microsoft. Bei erfolgreichem
        Login erhalten wir Ihre Nutzer-ID, Name, Nutzername, E-Mail und weitere
        grundlegende Nutzerinformationen, sowie digital signierte Tokens, damit
        die Echtheit der Anmeldung verifiziert werden kann. Diese werden
        ausschließlich verwendet, um Sie auf unserer Website zu authentifizieren
        und nicht gespeichert. Es wird nur ein Sitzungs-Cookie gesetzt, das mit
        Ihrem lokalen Account verknüpft ist. Dieses gilt maximal wenige Tage und
        wird dann gelöscht. Sie können das Cookie in Ihrem Browser jederzeit
        löschen, wodurch sie abgemeldet werden. Wenn Sie den Logout-Button
        verwenden, wird ihre Sitzung auch auf dem Server gelöscht, was sicherer
        ist.

        <h2 class="text-center">Lokale Anmeldung</h2>
        Bei der lokalen Anmeldung übermitteln Sie uns direkt ihren Nutzernamen
        und das <strong>lokale</strong> Passwort über eine sicher verschlüsselte
        Verbindung. Das Passwort wird nicht gespeichert, sondern nur mithilfe
        eines „verschlüsselten“ Passworts (technisch genannt „gehasht“) geprüft
        und Sie ggf. angemeldet. Es wird ein Sitzungs-Cookie gesetzt, das mit
        Ihrem lokalen Account verknüpft ist. Dieses gilt maximal wenige Tage und
        wird dann gelöscht. Sie können das Cookie in Ihrem Browser jederzeit
        löschen, wodurch sie abgemeldet werden. Wenn Sie den Logout-Button
        verwenden, wird ihre Sitzung auch auf dem Server gelöscht, was sicherer
        ist.

        <h2 class="text-center">Rechte</h2>

        Gemäß
        <a
          href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2528-1-1"
          >Artikel 15 DSGVO</a
        >
        haben Sie das Recht auf Auskunft.<br />
        Gemäß
        <a
          href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2614-1-1"
          >Artikel 16 DSGVO</a
        >
        haben Sie das Recht auf Berichtigung.<br />
        Gemäß
        <a
          href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2621-1-1"
          >Artikel 17 DSGVO</a
        >
        haben Sie das Recht auf Löschung.<br />
        Gemäß
        <a
          href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2715-1-1"
          >Artikel 18 DSGVO</a
        >
        haben Sie das Recht auf Einschränkung der Verarbeitung.<br />
        Gemäß
        <a
          href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2761-1-1"
          >Artikel 19 DSGVO</a
        >
        werden allen Empfängern, denen personenbezogene Daten offengelegt
        wurden, jede Berichtigung, Löschung oder Einschränkung der Verarbeitung
        gemäß den dort genannten Einschränkungen mitgeteilt.<br />
        Gemäß
        <a
          href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2768-1-1"
          >Artikel 20 DSGVO</a
        >
        haben Sie das Recht auf Datenübertragbarkeit.<br />
        <strong
          >Gemäß
          <a
            href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e2818-1-1"
            >Artikel 21 DSGVO</a
          >
          haben Sie das Recht, jederzeit gegen die Verarbeitung Sie betreffender
          personenbezogener Daten zu widersprechen.</strong
        ><br />
        Mit dem Serverhoster
        XYZ wurde ein
        Auftragsverarbeitungsvertrag nach
        <a
          href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e3162-1-1"
          >Artikel 28 DSGVO</a
        >
        abgeschlossen.<br />
        Ebenfalls werden die Daten im Einklang mit
        <a
          href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e3395-1-1"
          >Artikel 32 DSGVO</a
        >
        sicher verarbeitet:

        <ul>
          <li>
            Die Verbindung zum Server ist TLS 1.2 oder TLS 1.3 verschlüsselt.
          </li>

          <li>
            Die Daten sind mit Passwörtern oder durch Anmeldung mit einem
            Microsoft-Schulaccount geschützt.
          </li>

          <li>
            Die personenbezogenen Daten sind vor unbefugter oder unrechtmäßiger
            Verarbeitung und vor unbeabsichtigtem Verlust, unbeabsichtigter
            Zerstörung oder unbeabsichtigter Schädigung durch geeignete
            technische und organisatorische Maßnahmen geschützt:

            <ul>
              <li>
                Sie werden auf einem Server bei XYZ in
                Deutschland gespeichert und ein Auftragsverarbeitungsvertrag
                wurde abgeschlossen.
              </li>

              <li>Die Festplatte des Servers ist verschlüsselt.</li>

              <li>
                Es werden regelmäßig Sicherheitskopien der Daten erstellt.
              </li>

              <li>
                Der Quellcode ist unter
                <a href="https://github.com/projektwahl/projektwahl-lit/"
                  >https://github.com/projektwahl/projektwahl-lit/</a
                >
                einsehbar.
              </li>

              <li>
                Die Entwicker führen Sicherheitstests durch, was unter
                <a
                  href="https://github.com/projektwahl/projektwahl-lit/issues/56"
                  >https://github.com/projektwahl/projektwahl-lit/issues/56</a
                >
                einsehbar ist.
              </li>

              <li>Es gibt einen eigenen Server pro Projektwoche.</li>

              <li>
                Die Software auf dem Server wird stets auf dem aktuellen Stand
                gehalten.
              </li>

              <li>
                Es gibt explizit eine Kontaktadresse zum Melden von
                Sicherheitslücken, siehe
                <a
                  href="https://github.com/projektwahl/projektwahl-lit/blob/main/SECURITY.md"
                  >https://github.com/projektwahl/projektwahl-lit/blob/main/SECURITY.md</a
                >
              </li>

              <li>
                Nur XYZ (und der Serverhoster) haben
                direkten Zugriff auf den Server.
              </li>
            </ul>
          </li>
        </ul>

        Gemäß
        <a
          href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e3502-1-1"
          >Artikel 34 DSGVO</a
        >
        benachrichtigen wir Sie im Falle einer Verletzung des Schutzes Sie
        betreffender personenbezogener Daten.<br />

        Gemäß
        <a
          href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE#d1e6110-1-1"
          >Artikel 77 DSGVO</a
        >
        haben Sie das Recht auf Beschwerde bei der zuständigen Aufsichtsbehörde.
      </div>
    `;
  }
}

customElements.define("pw-privacy", PwPrivacy);
