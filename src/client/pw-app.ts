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
import { html, LitElement, ReactiveElement } from "lit";
import { bootstrapCss } from "./index.js";
import { HistoryController } from "./history-controller.js";
import { aClick } from "./pw-a.js";
import { until } from "lit/directives/until.js";
import { setupHmr } from "./hmr.js";
import jscookie from "js-cookie";
import { msg, str } from "@lit/localize";
//import { sourceLocale, targetLocales } from "./generated_locales/locales.js";
import { myFetch } from "./utils.js";

/**export const { getLocale, setLocale } = configureLocalization({
  sourceLocale,
  targetLocales,
  loadLocale: (locale) => import(`/src/client/generated_locales/${locale}.js`),
});*/

// TODO FIXME show more details if possible (maybe error page)
window.addEventListener("error", function (event) {
  console.error("window.error", event.error);
  alert("unknown error: " + event.message);
});

window.addEventListener("unhandledrejection", function (event) {
  console.error("window.unhandledrejection", event.promise);
  alert("unknown error: " + event.reason);
});

ReactiveElement.enableWarning?.("migration");
ReactiveElement.enableWarning?.("change-in-update");

// TODO FIXME create a pw-app directive that can be awaited on the server side.
// so we actually get server side rendering with datae

export const pwApp = async (url: URL) => {
  let page = await nextPage(url);
  return html`<pw-app .initial=${Promise.resolve(page)}></pw-app>`;
};

export const nextPage = async (url: URL) => {
  try {
    if (url.pathname === "/") {
      await import("./routes/pw-welcome.js");
      return html`<pw-welcome></pw-welcome>`;
    } else if (url.pathname === "/login") {
      //setLocale("de");
      const { pwLogin } = await import("./routes/login/pw-login.js");
      return await pwLogin();
    } else if (url.pathname === "/users") {
      const { pwUsers } = await import("./routes/users/pw-users.js");
      return await pwUsers(url);
    } else if (url.pathname === "/users/create") {
      await import("./routes/users/pw-user-create.js");
      return html`<pw-user-create></pw-user-create>`;
    } else if (/users\/edit\/\d+/.test(url.pathname)) {
      const { pwUser } = await import("./routes/users/pw-user-create.js");
      return await pwUser(Number(url.pathname.match(/users\/edit\/(\d+)/)![1]));
    } else if (/users\/view\/\d+/.test(url.pathname)) {
      const { pwUser } = await import("./routes/users/pw-user-create.js");
      return await pwUser(
        Number(url.pathname.match(/users\/view\/(\d+)/)![1]),
        true
      );
    } else if (url.pathname === "/projects") {
      const { pwProjects } = await import("./routes/projects/pw-projects.js");
      return await pwProjects(url);
    } else if (url.pathname === "/projects/create") {
      const { pwProject } = await import(
        "./routes/projects/pw-project-create.js"
      );
      await import("./routes/projects/pw-project-users.js");
      return html`<pw-project-create></pw-project-create>`;
    } else if (/projects\/edit\/\d+/.test(url.pathname)) {
      const { pwProject } = await import(
        "./routes/projects/pw-project-create.js"
      );
      return await pwProject(
        Number(url.pathname.match(/projects\/edit\/(\d+)/)![1])
      );
    } else if (/projects\/view\/\d+/.test(url.pathname)) {
      const { pwProject } = await import(
        "./routes/projects/pw-project-create.js"
      );
      return await pwProject(
        Number(url.pathname.match(/projects\/view\/(\d+)/)![1]),
        true
      );
    } else {
      return msg(html`Not Found`);
    }
  } catch (error) {
    return html`<div class="alert alert-danger" role="alert">
      ${msg(str`Error: ${error}`)}
    </div>`;
  }
};

export const PwApp = setupHmr(
  "PwApp",
  class PwApp extends LitElement {
    static override get properties() {
      return {
        last: { state: true },
        current: { state: true },
        initial: { attribute: false },
        initialUsed: { state: true },
      };
    }

    private last: Promise<import("lit").TemplateResult> | undefined;

    private history;

    private current: Promise<import("lit").TemplateResult> | undefined;

    initialUsed: boolean;

    initial: Promise<import("lit").TemplateResult> | undefined;

    constructor() {
      super();

      this.history = new HistoryController(this, /.*/);

      this.initialUsed = false;
    }

    override render() {
      if (this.initial !== undefined && !this.initialUsed) {
        this.initialUsed = true;
        this.current = this.initial;
      } else {
        this.last = this.current;
        this.current = nextPage(this.history.url);
      }
      return html`
        ${bootstrapCss}
        <nav
          class="navbar navbar-expand-lg navbar-light bg-light shadow p-3 mb-5"
        >
          <div class="container-fluid">
            <a @click=${aClick} class="navbar-brand" href="/"
              >${msg("Projektwahl")}</a
            >
            <button
              class="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label=${msg("Toggle navigation")}
            >
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
              <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item">
                  <a
                    @click=${aClick}
                    class="nav-link ${this.history.url.pathname === "/"
                      ? "active"
                      : ""}"
                    aria-current="page"
                    href="/"
                    >${msg("Home")}</a
                  >
                </li>
                <li class="nav-item">
                  <a
                    @click=${aClick}
                    class="nav-link ${this.history.url.pathname === "/users"
                      ? "active"
                      : ""}"
                    href="/users"
                    >${msg("Accounts")}</a
                  >
                </li>
                <li>
                  <a
                    @click=${aClick}
                    class="nav-link ${this.history.url.pathname === "/projects"
                      ? "active"
                      : ""}"
                    href="/projects"
                    >${msg("Projects")}</a
                  >
                </li>
                <li>
                  <a
                    @click=${aClick}
                    class="nav-link ${this.history.url.pathname === "/election"
                      ? "active"
                      : ""}"
                    href="/election"
                    >${msg("Election")}</a
                  >
                </li>
              </ul>
              <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                ${jscookie.get("username")
                  ? html`<li class="nav-item">
                      <a
                        @click=${async () => {
                          await myFetch<"/api/v1/logout">("/api/v1/logout", {
                            method: "POST",
                            body: "{}",
                          });
                          HistoryController.goto(
                            new URL("/login", window.location.href),
                            {}
                          );
                        }}
                        class="nav-link"
                        href="#"
                        >${msg(str`Logout ${jscookie.get("username")}`)}</a
                      >
                    </li>`
                  : html` <li class="nav-item">
                      <a
                        @click=${aClick}
                        class="nav-link ${this.history.url.pathname === "/login"
                          ? "active"
                          : ""}"
                        href="/login"
                        >${msg("Login")}</a
                      >
                    </li>`}
              </ul>
            </div>
          </div>
        </nav>

        <div
          style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);"
        >
          ${until(
            this.current.then(() => undefined).catch(() => undefined),
            html`<div class="spinner-grow text-primary" role="status">
              <span class="visually-hidden">${msg("Loading...")}</span>
            </div>`
          )}
        </div>

        ${until(
          this.current.catch((error) => error),
          this.last?.catch((error) => error)
        )}
      `;
    }
  }
);

customElements.define("pw-app", PwApp);
