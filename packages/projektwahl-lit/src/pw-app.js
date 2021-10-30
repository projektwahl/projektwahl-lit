// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import "./lib/form/pw-form";
import { html, LitElement, TemplateResult } from "lit";
import { bootstrapCss } from "./index.js";
import { HistoryController } from "./history-controller";
import { aClick } from "./pw-a.js";
import { classMap } from "lit/directives/class-map.js";
import { until } from "lit/directives/until.js";
import { pwLogin } from "./routes/login/pw-login.js";

// TODO FIXME show more details if possible (maybe error page)
window.addEventListener('error', function(event) {
  alert("unknown error: " + event.message)
})

window.addEventListener('unhandledrejection', function(event) {
   alert("unknown error: " + event.reason)
})


export class PwApp extends LitElement {
  /** @override */ static properties = {
    last: { state: true },
    current: { state: true }
  };

  constructor() {
    super();

    /**
     * @private
     * @type {Promise<TemplateResult> | undefined}
    */ 
    this.last;

    /**
     * @private
    */
    this.history = new HistoryController(this);

    /**
     * @private
     * @type {Promise<TemplateResult>}
    */
    this.current;
  }

  /** @override */ render() {
    this.last = this.current;
    this.current =
      this.history.url.pathname === "/login"
        ? pwLogin()
        : Promise.resolve(html`Not Found`);
    return html`
      ${bootstrapCss}
      <nav
        class="navbar navbar-expand-lg navbar-light bg-light shadow p-3 mb-5"
      >
        <div class="container-fluid">
          <a @click=${aClick} class="navbar-brand" href="/">Projektwahl</a>
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a
                  @click=${aClick}
                  class="nav-link ${classMap({
                    active: this.history.url.pathname === "/",
                  })}"
                  aria-current="page"
                  href="/"
                  >Start</a
                >
              </li>
              <li class="nav-item">
                <a
                  @click=${aClick}
                  class="nav-link ${classMap({
                    active: this.history.url.pathname === "/users",
                  })}"
                  href="/users"
                  >Nutzer</a
                >
              </li>
              <li>
                <a
                  @click=${aClick}
                  class="nav-link ${classMap({
                    active: this.history.url.pathname === "/projects",
                  })}"
                  href="/projects"
                  >Projekte</a
                >
              </li>
              <li>
                <a
                  @click=${aClick}
                  class="nav-link ${classMap({
                    active: this.history.url.pathname === "/election",
                  })}"
                  href="/election"
                  >Wahl</a
                >
              </li>
            </ul>
            <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a @click=${aClick} class="nav-link" href="#"
                  >{$session.user.name} abmelden</a
                >
              </li>
              <li class="nav-item">
                <a
                  @click=${aClick}
                  class="nav-link ${classMap({
                    active: this.history.url.pathname === "/login",
                  })}"
                  href="/login"
                  >Anmelden</a
                >
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div
        style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);"
      >
        ${until(
          this.current.then(() => undefined),
          html`<div class="spinner-grow text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>`
        )}
      </div>

      ${until(this.current, this.last)}
    `;
  }
}
customElements.define('pw-app', PwApp)