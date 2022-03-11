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
import {
  html,
  LitElement,
  noChange,
  ReactiveElement,
  TemplateResult,
} from "lit";
import { bootstrapCss } from "./index.js";
import { HistoryController, HistoryState } from "./history-controller.js";
import { aClick } from "./pw-a.js";
import jscookie from "js-cookie";
import { myFetch } from "./utils.js";
import { Task, TaskStatus } from "@dev.mohe/task";
import { msg, str } from "@lit/localize";

// TODO FIXME show more details if possible (maybe error page)
// TODO FIXME do this inline in the main page? In case it doesnt load so even on old browsers some error is shown
window.addEventListener("error", function (event: ErrorEvent) {
  console.error("window.error", event.error);
  alert(`unknown error: ${String(event)} ${String(event.error)}`);
});

window.addEventListener(
  "unhandledrejection",
  function (event: PromiseRejectionEvent) {
    console.error("window.unhandledrejection", event.promise);
    alert(
      `unknown promise error: ${String(event.reason)} ${String(event.promise)}`
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    event.promise.catch((reason) => alert(String(reason.stack)));
  }
);

ReactiveElement.enableWarning?.("migration");
ReactiveElement.enableWarning?.("change-in-update");

// TODO FIXME create a pw-app directive that can be awaited on the server side.
// so we actually get server side rendering with datae
/*
export const pwApp = async (url: URL) => {
  let page = await nextPage(url);
  return html`<pw-app .initial=${Promise.resolve(page)}></pw-app>`;
};
*/
/*
function identity<
  T extends {
    [r: string]: (url: URL) => Promise<TemplateResult<any>>;
  }
>(v: T) {
  return v;
}*/

const pages = {
  "^/privacy$": async () => {
    await import("./routes/pw-privacy.js");
    return html`<pw-privacy></pw-privacy>`;
  },
  "^/imprint$": async () => {
    await import("./routes/pw-imprint.js");
    return html`<pw-imprint></pw-imprint>`;
  },
  "^/$": async () => {
    await import("./routes/pw-welcome.js");
    return html`<pw-welcome></pw-welcome>`;
  },
  "^/redirect$": async () => {
    await import("./routes/login/pw-redirect.js");
    return html`<pw-redirect></pw-redirect>`;
  },
  "^/login$": async () => {
    const { pwLogin } = await import("./routes/login/pw-login.js");
    return pwLogin();
  },
  "^/users$": async (url: URL) => {
    const { pwUsers } = await import("./routes/users/pw-users.js");
    return await pwUsers(url);
  },
  "^/users/create$": async () => {
    await import("./routes/users/pw-user-create.js");
    return html`<pw-user-create
      uri="/api/v1/users/create-or-update"
    ></pw-user-create>`;
  },
  "^/users/import$": async () => {
    await import("./routes/users/pw-users-import.js");
    return html`<pw-users-import
      uri="/api/v1/users/create-or-update"
    ></pw-users-import>`;
  },
  "^/users/edit/\\d+$": async (url: URL) => {
    const { pwUser } = await import("./routes/users/pw-user-create.js");
    return await pwUser(
      Number(url.pathname.match(/^\/users\/edit\/(\d+)$/)?.[1])
    );
  },
  "^/users/view/\\d+$": async (url: URL) => {
    const { pwUser } = await import("./routes/users/pw-user-create.js");
    return await pwUser(
      Number(url.pathname.match(/^\/users\/view\/(\d+)$/)?.[1]),
      true
    );
  },
  "^/projects$": async (url: URL) => {
    const { pwProjects } = await import("./routes/projects/pw-projects.js");
    return await pwProjects(url);
  },
  "^/projects/create$": async () => {
    await import("./routes/projects/pw-project-create.js");
    await import("./routes/projects/pw-project-users.js");
    return html`<pw-project-create
      .url=${"/api/v1/projects/create"}
    ></pw-project-create>`;
  },
  "^/projects/edit/\\d+$": async (url: URL) => {
    const { pwProject } = await import(
      "./routes/projects/pw-project-create.js"
    );
    return await pwProject(
      Number(url.pathname.match(/^\/projects\/edit\/(\d+)$/)?.[1])
    );
  },
  "^/projects/view/\\d+$": async (url: URL) => {
    const { pwProject } = await import(
      "./routes/projects/pw-project-create.js"
    );
    return await pwProject(
      Number(url.pathname.match(/^\/projects\/view\/(\d+)$/)?.[1]),
      true
    );
  },
  "^/vote$": async (url: URL) => {
    const { pwChoices } = await import("./routes/choices/pw-choices.js");
    return await pwChoices(url);
  },
};

export class PwApp extends LitElement {
  static override get properties() {
    return {
      initial: { attribute: false },
      initialRender: { state: true },
      navbarOpen: { state: true },
      username: { state: true },
    };
  }

  private history;

  initialRender: boolean;

  initial: import("lit").TemplateResult | undefined;

  navbarOpen: boolean;

  private popstateListener: (this: Window, ev: PopStateEvent) => void;
  private updateloginstate: (this: Window, ev: Event) => void;

  protected _apiTask!: Task<[keyof typeof pages | undefined], TemplateResult>;

  nextPage: ([key]: [
    keyof typeof pages | undefined
  ]) => Promise<TemplateResult>;

  username: string | undefined;

  bc!: BroadcastChannel;

  private navigateListener: (
    this: Window,
    event: CustomEvent<{ url: URL; state: HistoryState }>
  ) => void;

  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("popstate", this.popstateListener);
    window.addEventListener("navigate", this.navigateListener);
    this.bc = new BroadcastChannel("updateloginstate");
    this.bc.addEventListener("message", this.updateloginstate);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("popstate", this.popstateListener);
    window.removeEventListener("navigate", this.navigateListener);
    this.bc.removeEventListener("message", this.updateloginstate);
    this.bc.close();
  }

  constructor() {
    super();

    this.initialRender = true;

    this.nextPage = async ([key]: [keyof typeof pages | undefined]) => {
      try {
        if (key) {
          return await pages[key](this.history.url);
        } else {
          return msg(html`Not Found`);
        }
      } catch (error) {
        return html`<div class="alert alert-danger" role="alert">
          ${msg(str`Error: ${error}`)}
        </div>`;
      }
    };

    this.popstateListener = (event: PopStateEvent) => {
      const url = new URL(window.location.href);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const state = event.state;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      HistoryController.goto(url, state, true); // TODO FIXME don't pushstate here at all
    };

    this.username = jscookie.get("username");

    this.updateloginstate = () => {
      this.username = jscookie.get("username");
    };

    this.navbarOpen = false;

    this.history = new HistoryController(this, /.*/);

    this.navigateListener = () => {
      this.navbarOpen = false;
    };
  }

  override render() {
    if (this.initialRender) {
      this.initialRender = false;

      this._apiTask = new Task(this, {
        task: this.nextPage,
        args: () => {
          const _a: keyof typeof pages | undefined = Object.keys(pages).find(
            (k) => new RegExp(k).test(this.history.url.pathname)
          );
          const _b: [keyof typeof pages | undefined] = [_a];
          return _b;
        },
        initialStatus:
          this.initial !== undefined ? TaskStatus.COMPLETE : TaskStatus.INITIAL,
        initialValue: this.initial,
      });
    }

    return html`
      ${bootstrapCss}
      <style>
        :host {
          height: 100vh;
          display: block;
        }
      </style>
      <div class="d-flex flex-column h-100">
        <header>
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
                @click=${() => (this.navbarOpen = !this.navbarOpen)}
              >
                <span class="navbar-toggler-icon"></span>
              </button>
              <div
                class="collapse navbar-collapse ${this.navbarOpen
                  ? "show"
                  : ""}"
                id="navbarSupportedContent"
              >
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
                      class="nav-link ${this.history.url.pathname ===
                      "/projects"
                        ? "active"
                        : ""}"
                      href="/projects"
                      >${msg("Projects")}</a
                    >
                  </li>
                  <li>
                    <a
                      @click=${aClick}
                      class="nav-link ${this.history.url.pathname === "/vote"
                        ? "active"
                        : ""}"
                      href="/vote"
                      >${msg("Vote")}</a
                    >
                  </li>
                </ul>
                <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                  ${this.username
                    ? html`<li class="nav-item">
                        <a
                          @click=${async () => {
                            await myFetch<"/api/v1/logout">(
                              "POST",
                              "/api/v1/logout",
                              {},
                              {}
                            );

                            const bc = new BroadcastChannel("updateloginstate");
                            bc.postMessage("logout");

                            HistoryController.goto(
                              new URL("/login", window.location.href),
                              {},
                              false
                            );
                          }}
                          class="nav-link"
                          href="#"
                          >${msg(str`Logout ${this.username}`)}</a
                        >
                      </li>`
                    : html` <li class="nav-item">
                        <a
                          class="nav-link ${this.history.url.pathname ===
                          "/login"
                            ? "active"
                            : ""}"
                          href="/login"
                          target="_blank"
                          rel="opener"
                          >${msg("Login")}</a
                        >
                      </li>`}
                </ul>
              </div>
            </div>
          </nav>
        </header>

        <div
          style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1337;"
        >
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
            error: (e) => e,
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
            </span>
          </div>
        </footer>
      </div>
    `;
  }
}

customElements.define("pw-app", PwApp);
