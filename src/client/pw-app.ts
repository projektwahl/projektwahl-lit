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
import { html, noChange, ReactiveElement, TemplateResult } from "lit";
import { HistoryController, HistoryState } from "./history-controller.js";
import { aClick } from "./pw-a.js";
import { myFetch } from "./utils.js";
import { Task } from "@lit-labs/task";
import { msg, str } from "@lit/localize";

window.addEventListener("error", function (event: ErrorEvent) {
  console.error("window.error", event.error);
  alert(`unknown error: ${String(event)} ${String(event.error)}`);
});

window.addEventListener(
  "unhandledrejection",
  function (event: PromiseRejectionEvent) {
    console.error("window.unhandledrejection", event.promise);
    alert(
      `unknown promise error: ${String(event.reason)} ${String(event.promise)}`,
    );

    event.promise.catch((reason) => {
      alert(String(reason));
    });
  },
);

ReactiveElement.enableWarning?.("migration");
ReactiveElement.enableWarning?.("change-in-update");

import { configureLocalization } from "@lit/localize";

import { sourceLocale, targetLocales } from "./generated/locales.js";
import * as templates_de from "./generated/de.js";
import { PwElement } from "./pw-element.js";
import { LoggedInUserController } from "./user-controller.js";
import { pwPrivacy } from "./routes/pw-privacy.js";
import { pwImprint } from "./routes/pw-imprint.js";
import { pwEvaluation } from "./routes/pw-evaluation.js";
import { pwWelcome } from "./routes/pw-welcome.js";
import { pwRedirect } from "./routes/login/pw-redirect.js";
import {
  pwUserCreate,
  pwUserCreatePreloaded,
} from "./routes/users/pw-user-create.js";
import { pwUsersPreloaded } from "./routes/users/pw-users.js";
import { pwUsersImport } from "./routes/users/pw-users-import.js";
import { pwProjectsPreloaded } from "./routes/projects/pw-projects.js";
import {
  pwProjectCreate,
  pwProjectCreatePreloaded,
} from "./routes/projects/pw-project-create.js";
import { pwChoicesPreloaded } from "./routes/choices/pw-choices.js";
import { pwLogin } from "./routes/login/pw-login.js";
import { pwSessionsPreloaded } from "./routes/sessions/pw-sessions.js";
import { pwSettingsUpdate } from "./routes/settings/pw-settings-update.js";
import { pwProjectsOverviewPreloaded } from "./routes/projects/pw-projects-overview.js";

export const { getLocale, setLocale } = configureLocalization({
  sourceLocale,
  targetLocales,
  // eslint-disable-next-line @typescript-eslint/require-await
  loadLocale: async () => templates_de,
});
void setLocale(window.LANGUAGE ?? "en");

const pages = {
  "^/privacy$": () => {
    return pwPrivacy({});
  },
  "^/imprint$": () => {
    return pwImprint({});
  },
  "^/evaluation$": () => {
    return pwEvaluation({});
  },
  "^/$": () => {
    return pwWelcome({});
  },
  "^/redirect$": () => {
    return pwRedirect({});
  },
  "^/login$": () => {
    return pwLogin({});
  },
  "^/users$": async (url: URL) => {
    return await pwUsersPreloaded(url);
  },
  "^/users/create$": () => {
    return pwUserCreate({
      url: "/api/v1/users/create-or-update",
      disabled: false,
      userId: null,
    });
  },
  "^/users/import$": () => {
    return pwUsersImport({
      url: "/api/v1/users/create-or-update",
    });
  },
  "^/users/edit/\\d+$": (url: URL) => {
    return pwUserCreatePreloaded(
      Number(url.pathname.match(/^\/users\/edit\/(\d+)$/)?.[1]),
    );
  },
  "^/users/view/\\d+$": (url: URL) => {
    return pwUserCreatePreloaded(
      Number(url.pathname.match(/^\/users\/view\/(\d+)$/)?.[1]),
      true,
    );
  },
  "^/projects$": async (url: URL) => {
    return await pwProjectsPreloaded(url);
  },
  "^/projects-overview$": async (url: URL) => {
    return await pwProjectsOverviewPreloaded(url);
  },
  "^/projects/create$": () => {
    return pwProjectCreate({
      url: "/api/v1/projects/create",
      disabled: false,
      projectId: null,
    });
  },
  "^/projects/edit/\\d+$": (url: URL) => {
    return pwProjectCreatePreloaded(
      Number(url.pathname.match(/^\/projects\/edit\/(\d+)$/)?.[1]),
    );
  },
  "^/projects/view/\\d+$": (url: URL) => {
    return pwProjectCreatePreloaded(
      Number(url.pathname.match(/^\/projects\/view\/(\d+)$/)?.[1]),
      true,
    );
  },
  "^/vote$": async (url: URL) => {
    return await pwChoicesPreloaded(url);
  },
  "^/sessions$": async (url: URL) => {
    return await pwSessionsPreloaded(url);
  },
  "^/settings$": () => {
    return pwSettingsUpdate({
      url: "/api/v1/settings/update",
      disabled: false,
    });
  },
};

// workaround see https://github.com/runem/lit-analyzer/issues/149#issuecomment-1006162839
export function pwApp(
  props: Record<string, never>, // Pick<PwApp, never>
) {
  const { ...rest } = props;
  const _: Record<string, never> = rest;
  //_ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
  return html`<pw-app></pw-app>`;
}

export class PwApp extends PwElement {
  static override get properties() {
    return {
      initial: { attribute: false },
      navbarOpen: { state: true },
      username: { state: true },
    };
  }

  private history;

  initial: import("lit").TemplateResult | undefined;

  navbarOpen: boolean;

  private popstateListener: (this: Window, ev: PopStateEvent) => void;

  protected _apiTask!: Task<[keyof typeof pages | undefined], TemplateResult>;

  nextPage: ([key]: [
    keyof typeof pages | undefined,
  ]) => Promise<TemplateResult>;

  userController: LoggedInUserController;

  private navigateListener: (
    this: Window,
    event: CustomEvent<{ url: URL; state: HistoryState }>,
  ) => void;

  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("popstate", this.popstateListener);
    window.addEventListener("navigate", this.navigateListener);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("popstate", this.popstateListener);
    window.removeEventListener("navigate", this.navigateListener);
  }

  constructor() {
    super();

    this.nextPage = async ([key]: [keyof typeof pages | undefined]) => {
      if (!this.hasUpdated) {
        if (this.initial) {
          return this.initial;
        }
      }
      try {
        if (key) {
          return await pages[key](this.history.url);
        } else {
          return msg(html`Not Found`);
        }
      } catch (error) {
        console.error(error);
        return html`<div class="alert alert-danger" role="alert">
          ${msg(str`Error: ${error}`)}
        </div>`;
      }
    };

    this.popstateListener = (event: PopStateEvent) => {
      const url = new URL(window.location.href);

      const state = event.state;

      HistoryController.goto(url, state, true); // TODO FIXME don't pushstate here at all
    };

    this.navbarOpen = false;

    this.history = new HistoryController(this, /.*/);

    this.userController = new LoggedInUserController(this);

    this.navigateListener = () => {
      this.navbarOpen = false;
    };

    this._apiTask = new Task(this, {
      task: this.nextPage,
      args: () => {
        const _a: keyof typeof pages | undefined = Object.keys(pages).find(
          (k) => new RegExp(k).test(this.history.url.pathname),
        );
        const _b: [keyof typeof pages | undefined] = [_a];
        return _b;
      },
    });
  }

  override render() {
    return html`
      <div class="d-flex flex-column h-100">
        <header>
          <nav
            class="navbar navbar-expand-lg navbar-light bg-light shadow p-3 mb-5 d-print-none"
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
                @click=${() => (this.navbarOpen = !this.navbarOpen)}
              >
                <span class="navbar-toggler-icon"></span>
              </button>
              <div
                class="collapse navbar-collapse ${this.navbarOpen ? "show" : ""}"
                id="navbarSupportedContent"
              >
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                  <li class="nav-item">
                    <a
                      @click=${aClick}
                      class="nav-link ${
                        this.history.url.pathname === "/" ? "active" : ""
                      }"
                      aria-current="page"
                      href="/"
                      >${msg("Home")}</a
                    >
                  </li>
                  ${
                    this.userController.type === "admin" ||
                    this.userController.type === "helper"
                      ? html`<li class="nav-item">
                        <a
                          @click=${aClick}
                          class="nav-link ${
                            this.history.url.pathname.startsWith("/users")
                              ? "active"
                              : ""
                          }"
                          href="/users"
                          >${msg("Accounts")}</a
                        >
                      </li>`
                      : ``
                  }
                  ${
                    this.userController.type === "admin" ||
                    this.userController.type === "helper"
                      ? html`<li>
                        <a
                          @click=${aClick}
                          class="nav-link ${
                            this.history.url.pathname.startsWith("/projects")
                              ? "active"
                              : ""
                          }"
                          href="/projects"
                          >${msg("Projects")}</a
                        >
                      </li>`
                      : ``
                  }
                  ${
                    this.userController.type === "voter"
                      ? html`<li>
                        <a
                          @click=${aClick}
                          class="nav-link ${
                            this.history.url.pathname.startsWith("/vote")
                              ? "active"
                              : ""
                          }"
                          href="/vote"
                          >${msg("Vote")}</a
                        >
                      </li>`
                      : ``
                  }
                  <li>
                    <a
                      href="/imprint"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="nav-link ${
                        this.history.url.pathname.startsWith("/imprint")
                          ? "active"
                          : ""
                      }"
                      >${msg("Imprint")}</a
                    >
                  </li>
                  <li>
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="nav-link ${
                        this.history.url.pathname.startsWith("/privacy")
                          ? "active"
                          : ""
                      }"
                      >${msg("Privacy Policy")}</a
                    >
                  </li>
                </ul>
                <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                  ${
                    this.userController.username
                      ? html`<li class="nav-item">
                        <a
                          @click=${async (e: Event) => {
                            e.preventDefault();
                            await myFetch<"/api/v1/logout">(
                              "POST",
                              "/api/v1/logout",
                              {},
                              {},
                            );

                            localStorage.setItem("stateupdate", "logout");
                            window.dispatchEvent(
                              new StorageEvent("storage", {
                                newValue: "logout",
                              }),
                            );

                            HistoryController.goto(
                              new URL("/login", window.location.href),
                              {},
                              false,
                            );
                          }}
                          class="nav-link"
                          href="/logout"
                          >${msg(str`Logout ${this.userController.username}`)}</a
                        >
                      </li>`
                      : html` <li class="nav-item">
                        <a
                          class="nav-link ${
                            this.history.url.pathname === "/login"
                              ? "active"
                              : ""
                          }"
                          href="/login"
                          target="_blank"
                          rel="opener"
                          >${msg("Login")}</a
                        >
                      </li>`
                  }
                </ul>
              </div>
            </div>
          </nav>
        </header>

        <div class="fully-centered">
          ${this._apiTask.render({
            pending: () => html`<div
              class="spinner-grow text-primary"
              role="status"
            >
              <span class="visually-hidden">${msg("Loading...")}</span>
            </div>`,
          })}
        </div>

        <main class="flex-shrink-0 pb-3">
          ${this._apiTask.render({
            complete: (v) => v,
            error: (e) => {
              console.error(e);
              return e;
            },
            pending: () => noChange,
          })}
        </main>

        <footer class="footer mt-auto py-3 bg-light">
          <div class="container">
            <span class="text-muted">
              <a
                href="https://github.com/projektwahl/projektwahl-lit"
                target="_blank"
                rel="noopener noreferrer"
                >${msg("Source code")}</a
              >
              |
              <a
                href="https://github.com/projektwahl/projektwahl-lit/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                >${msg("License")}</a
              >
              |
              <a
                href="https://github.com/projektwahl/projektwahl-lit/security/policy"
                target="_blank"
                rel="noopener noreferrer"
                >${msg("Security")}</a
              >
              |
              <a href="/imprint" target="_blank" rel="noopener noreferrer"
                >${msg("Imprint")}</a
              >
              |
              <a href="/privacy" target="_blank" rel="noopener noreferrer"
                >${msg("Privacy Policy")}</a
              >
              | Version
              <a
                href="https://github.com/projektwahl/projektwahl-lit/tree/${
                  window.VERSION_FULL ?? "main"
                }"
                >${window.VERSION_SHORT ?? "main"}</a
              >
            </span>
          </div>
        </footer>
      </div>
    `;
  }
}

customElements.define("pw-app", PwApp);

declare global {
  interface HTMLElementTagNameMap {
    "pw-app": PwApp;
  }
}
