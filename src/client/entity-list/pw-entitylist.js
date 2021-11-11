// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement } from "lit";
import { bootstrapCss } from "../index.js";
import { HistoryController } from "../history-controller.js";
import { setupHmr } from "../hmr.js";

/** @template T */
export let PwEntityList = class extends LitElement {
  /** @override */ static get properties() {
    return {
        title: { type: String },
    };
  }

  constructor() {
    super();

    /** @type {string} */
    this.title;

    /**
     * @private
     */
    this.history = new HistoryController(this);
  }

  /** @override */ render() {
    if (
        this.title === undefined
      ) {
        throw new Error("component not fully initialized");
      }

    return html`
      ${bootstrapCss}
<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);">
${html`
<div class="spinner-grow text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
    </div>`
}
</div>
<h1 class="text-center">${this.title}</h1>
<div class="row justify-content-between">
<div class="col-auto">
    <slot name="buttons"></slot>
</div>
<div class="col-3">
    <!-- svelte-ignore a11y-no-onchange -->
    <select
        .value=${"10"}
        class="form-select"
        aria-label="Default select example"
    >
        <option value=${10}>10 pro Seite</option>
        <option value=${25}>25 pro Seite</option>
        <option value=${50}>50 pro Seite</option>
        <option value=${100}>100 pro Seite</option>
    </select>
</div>
</div>
<slot name="filter"></slot>
<slot name="response"></slot>
<nav aria-label="Navigation der Nutzerliste">
<ul class="pagination justify-content-center">
    <!-- { # await only works in blocks -->
    <li class="page-item {mapOr($response, v => v.previousCursor, null) ? '' : 'disabled'}">
        <a
            @click=${(e) => {
                e.preventDefault();
                //($query.paginationCursor = mapOr($response, v => v.previousCursor, null)),
                //    ($query.paginationDirection = 'backwards');
            }}
            class="page-link"
            href="/"
            aria-label="Vorherige Seite"
            tabindex=${-1/*mapOr($response, v => v.previousCursor, null) ? undefined : -1*/}
            aria-disabled=${true/*!mapOr($response, v => v.previousCursor, null)*/}
        >
            <span aria-hidden="true">&laquo;</span>
        </a>
    </li>
    <li class="page-item {mapOr($response, v => v.nextCursor, null) ? '' : 'disabled'}}">
        <a
            @click=${(e) => {
                e.preventDefault();
                //($query.paginationCursor = mapOr($response, v => v.nextCursor, null)),
                //    ($query.paginationDirection = 'forwards');
            }}
            class="page-link"
            href="/"
            aria-label="Nächste Seite"
            tabindex=${/*mapOr($response, v => v.nextCursor, null) ? undefined : -1*/-1}
            aria-disabled=${/*!mapOr($response, v => v.nextCursor, null)*/false}
        >
            <span aria-hidden="true">&raquo;</span>
        </a>
    </li>
</ul>
</nav>
    `;
  }
}

setupHmr(PwEntityList, import.meta.url)

customElements.define("pw-entitylist", PwEntityList);