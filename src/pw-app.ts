// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { bootstrapCss } from ".";
import "./pw-a";

@customElement("pw-app")
export class PwApp extends LitElement {
  @property()
  name = "Somebodfdy";

  render() {
    return html` ${bootstrapCss}
      <nav
        class="navbar navbar-expand-lg navbar-light bg-light shadow p-3 mb-5"
      >
        <div class="container-fluid">
          <pw-a class="navbar-brand" href="/"
            ><span style="color: rgba(0,0,0,.9);">Projektwahl</span></pw-a
          >
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
                  class="nav-link {$page.path === '/' ? 'active' : ''}"
                  aria-current="page"
                  href="/"
                  >Start</a
                >
              </li>
              <li class="nav-item">
                <a
                  class="nav-link {$page.path.startsWith('/users') ? 'active' : ''}"
                  href="/users"
                  >Nutzer</a
                >
              </li>
              <li>
                <a
                  class="nav-link {$page.path.startsWith('/projects') ? 'active' : ''}"
                  href="/projects"
                  >Projekte</a
                >
              </li>
              <li>
                <a
                  class="nav-link {$page.path.startsWith('/election') ? 'active' : ''}"
                  href="/election"
                  >Wahl</a
                >
              </li>
            </ul>
            <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a class="nav-link" href="/no-javascript"
                  >{$session.user.name} abmelden</a
                >
              </li>
              <li class="nav-item">
                <a
                  class="nav-link {$page.path.startsWith('/login') ? 'active' : ''}"
                  href="/login"
                  >Anmelden</a
                >
              </li>
            </ul>
          </div>
        </div>
      </nav>`;
  }
}
