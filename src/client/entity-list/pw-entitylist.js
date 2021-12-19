// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement } from "lit";
import { bootstrapCss } from "../index.js";
import { HistoryController } from "../history-controller.js";
import { setupHmr } from "../hmr.js";
import { msg, str } from "@lit/localize";

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
    this.history = new HistoryController(this, /.*/);
  }

  /** @override */ render() {
    if (this.title === undefined) {
      throw new Error(msg("component not fully initialized"));
    }

    return html`
      ${bootstrapCss}
      <div
        style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);"
      >
        ${
          /*true
          ? ""
          : html`<div class="spinner-grow text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
        </div>`*/ ""
        }
      </div>
      <h1 class="text-center">${this.title}</h1>
      <div class="row justify-content-between">
        <div class="col-auto">
          <slot name="buttons"></slot>
        </div>
        <div class="col-3">
          <select
            @change=${(/** @type {Event} */ event) => {
              const url = new URL(window.location.href);
              url.searchParams.set("count", event.target.value);
              HistoryController.goto(url);
            }}
            .value=${this.history.url.searchParams.get("count")}
            class="form-select"
            aria-label="Default select example"
          >
            <option value="10">
              ${((/** @type {number} */ count) => msg(str`${count} per page`))(
                10
              )}
            </option>
            <option value="25">
              ${((/** @type {number} */ count) => msg(str`${count} per page`))(
                25
              )}
            </option>
            <option value="50">
              ${((/** @type {number} */ count) => msg(str`${count} per page`))(
                50
              )}
            </option>
            <option value="100">
              ${((/** @type {number} */ count) => msg(str`${count} per page`))(
                100
              )}
            </option>
          </select>
        </div>
      </div>
      <slot name="response"></slot>
      <nav aria-label="${msg("navigation of user list")}">
        <ul class="pagination justify-content-center">
          <!-- { # await only works in blocks -->
          <li
            class="page-item {mapOr($response, v => v.previousCursor, null) ? '' : 'disabled'}"
          >
            <a
              @click=${(e) => {
                e.preventDefault();
                //($query.paginationCursor = mapOr($response, v => v.previousCursor, null)),
                //    ($query.paginationDirection = 'backwards');
              }}
              class="page-link"
              href="/"
              aria-label="${msg("previous page")}"
              tabindex=${
                -1 /*mapOr($response, v => v.previousCursor, null) ? undefined : -1*/
              }
              aria-disabled=${
                true /*!mapOr($response, v => v.previousCursor, null)*/
              }
            >
              <span aria-hidden="true">&laquo;</span>
            </a>
          </li>
          <li
            class="page-item {mapOr($response, v => v.nextCursor, null) ? '' : 'disabled'}}"
          >
            <a
              @click=${(e) => {
                e.preventDefault();
                //($query.paginationCursor = mapOr($response, v => v.nextCursor, null)),
                //    ($query.paginationDirection = 'forwards');
              }}
              class="page-link"
              href="/"
              aria-label="${msg("next page")}"
              tabindex=${
                /*mapOr($response, v => v.nextCursor, null) ? undefined : -1*/ -1
              }
              aria-disabled=${
                /*!mapOr($response, v => v.nextCursor, null)*/ false
              }
            >
              <span aria-hidden="true">&raquo;</span>
            </a>
          </li>
        </ul>
      </nav>
    `;
  }
};

setupHmr(PwEntityList, import.meta.url);

customElements.define("pw-entitylist", PwEntityList);
