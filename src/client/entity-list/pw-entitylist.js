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
    };
  }

  constructor() {
    super();

    /**
     * @private
     */
    this.history = new HistoryController(this);
  }

  /** @override */ render() {
    return html`
      ${bootstrapCss}
      
<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);">
{#if $response.result === "loading" }
    <div class="spinner-grow text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
    </div>
{/if}
</div>
<h1 class="text-center">{title}</h1>
<div class="row justify-content-between">
<div class="col-auto">
    {#if createUrl}<a class="btn btn-primary" href={createUrl} role="button">{title} erstellen</a
        >{/if}
    <slot name="buttons" />
</div>
<div class="col-3">
    <!-- svelte-ignore a11y-no-onchange -->
    <select
        bind:value={$query.paginationLimit}
        class="form-select"
        aria-label="Default select example"
    >
        <option value={10}>10 pro Seite</option>
        <option value={25}>25 pro Seite</option>
        <option value={50}>50 pro Seite</option>
        <option value={100}>100 pro Seite</option>
    </select>
</div>
</div>
<table class="table">
<slot name="filter" {headerClick} {currentSortValue} />
<slot name="response" response={$response} />
</table>
<nav aria-label="Navigation der Nutzerliste">
<ul class="pagination justify-content-center">
    <!-- { # await only works in blocks -->
    <li class="page-item {mapOr($response, v => v.previousCursor, null) ? '' : 'disabled'}">
        <a
            on:click|preventDefault={() => {
                ($query.paginationCursor = mapOr($response, v => v.previousCursor, null)),
                    ($query.paginationDirection = 'backwards');
            }}
            class="page-link"
            href="/"
            aria-label="Vorherige Seite"
            tabindex={mapOr($response, v => v.previousCursor, null) ? undefined : -1}
            aria-disabled={!mapOr($response, v => v.previousCursor, null)}
        >
            <span aria-hidden="true">&laquo;</span>
        </a>
    </li>
    <li class="page-item {mapOr($response, v => v.nextCursor, null) ? '' : 'disabled'}}">
        <a
            on:click|preventDefault={() => {
                ($query.paginationCursor = mapOr($response, v => v.nextCursor, null)),
                    ($query.paginationDirection = 'forwards');
            }}
            class="page-link"
            href="/"
            aria-label="Nächste Seite"
            tabindex={mapOr($response, v => v.nextCursor, null) ? undefined : -1}
            aria-disabled={!mapOr($response, v => v.nextCursor, null)}
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