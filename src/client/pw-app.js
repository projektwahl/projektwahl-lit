// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import "./form/pw-form.js";
import "./entity-list/pw-entitylist.js";
import { adoptStyles, html, LitElement } from "lit";
import { bootstrapCss } from "./index.js";
import { HistoryController } from "./history-controller.js";
import { aClick } from "./pw-a.js";
import { classMap } from "lit/directives/class-map.js";
import { until } from "lit/directives/until.js";
import { repeat } from "lit/directives/repeat.js";
import { pwLogin } from "./routes/login/pw-login.js";
import { setupHmr } from "./hmr.js";

// TODO FIXME show more details if possible (maybe error page)
window.addEventListener("error", function (event) {
  alert("unknown error: " + event.message);
});

window.addEventListener("unhandledrejection", function (event) {
  alert("unknown error: " + event.reason);
});

export let PwApp = class PwApp extends LitElement {
  /** @override */ static get properties() {
    return {
      last: { state: true },
      current: { state: true },
    };
  }

  constructor() {
    super();

    /**
     * @private
     * @type {Promise<import("lit").TemplateResult> | undefined}
     */
    this.last;

    /**
     * @private
     */
    this.history = new HistoryController(this);

    /**
     * @private
     * @type {Promise<import("lit").TemplateResult>}
     */
    this.current;
  }

  /** @override */ render() {
    this.last = this.current;
    if (this.history.url.pathname === "/login") {
      this.current = pwLogin()
    } else if (this.history.url.pathname === "/users") {
      this.current = Promise.resolve(html`<pw-entitylist title="Nutzende">
<div slot="response" class="container">
<table class="table">

<thead>
  
  <tr>
      <th class="table-cell-hover" scope="col"
	>{id}<i
		class="bi-arrow-{curr == 'ASC' ? 'up' : curr == 'DESC' ? 'down' : 'down-up'}"
		role="img"
		aria-label="Nach {title} sortieren"
	></i></th>

  <th class="table-cell-hover" scope="col"
	>{username}<i
		class="bi-arrow-{curr == 'ASC' ? 'up' : curr == 'DESC' ? 'down' : 'down-up'}"
		role="img"
		aria-label="Nach {title} sortieren"
	></i></th>

  <th class="table-cell-hover" scope="col"
	>{type}<i
		class="bi-arrow-{curr == 'ASC' ? 'up' : curr == 'DESC' ? 'down' : 'down-up'}"
		role="img"
		aria-label="Nach {title} sortieren"
	></i></th>

      
				<th class="">Aktionen</th>
			</tr>
      <!--
			<tr class="row align-middle">
	

      <th scope="col">
	<input
		bind:value={$query.filters[name]}
		type="text"
		class="form-control"
		id="projects-filter-{name}"
	/>
</th>


<th scope="col">
	<input
		bind:value={$query.filters[name]}
		type="text"
		class="form-control"
		id="projects-filter-{name}"
	/>
</th>


<th scope="col">
	<input
		bind:value={$query.filters[name]}
		type="text"
		class="form-control"
		id="projects-filter-{name}"
	/>
</th>

			</tr>-->
		</thead>

  <tbody>
${repeat(Array.from(Array(50), (_, i) => i), i => i, (item, index) => {
  return html`<tr>
						<th scope="row"> 
              <p class="placeholder-glow">
                <span class="placeholder rounded">1337</span>
              </p>
            </th>
						<td>
              <p class="placeholder-glow">
                <span class="placeholder rounded">Long Full Name</span>
                <span class="placeholder rounded">Long Full Name</span>
              </p>
            </td>
						<td>
              <p class="placeholder-glow">
                <span class="placeholder rounded">helper</span>
              </p>
            </td>
						<td>
					
              <a class="btn btn-secondary disabled" aria-disabled="true" href="/users/edit/{entity.id}" role="button">
                <i class="bi bi-pen"></i>
              </a>
						
							<button disabled class="btn btn-secondary" type="button">
								<i class="bi bi-box-arrow-in-right"></i>
							</button>
						</td>
					</tr>`
})}
</tbody>
</table>
</div>
      </pw-entitylist>`)
    } else {
      this.current = Promise.resolve(html`Not Found`);
    }
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

setupHmr(PwApp, import.meta.url)

customElements.define("pw-app", PwApp);