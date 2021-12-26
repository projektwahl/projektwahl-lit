// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import type { ReactiveControllerHost } from "lit";

/** @typedef {Record<string, unknown>} HistoryState */

/** @typedef {import('lit').ReactiveController} ReactiveController */

/** @implements {ReactiveController} */
export class HistoryController {
  constructor(
    host: ReactiveControllerHost,
    urlPattern: RegExp
  ) {
    /** @type {import("lit").ReactiveControllerHost} */
    this.host = host;
    host.addController(this);

    this.urlPattern = urlPattern;

    /** @type {URL} */
    this.url = new URL(window.location.href);

    /** @type {HistoryState} */
    this.state = window.history?.state;

    /** @private @type {(this: Window, ev: PopStateEvent) => void} */
    this.popstateListener;

    /** @private @type {(this: Window,event: CustomEvent<{url: URL;state: HistoryState;}>) => void} */
    this.navigateListener;
  }
  hostConnected() {
    this.url = new URL(window.location.href);
    this.state = /** @type HistoryState */ (window.history.state);
    this.popstateListener = (/** @type {PopStateEvent} */ event: PopStateEvent) => {
      this.url = new URL(window.location.href);
      this.state = /** @type {HistoryState} */ (event.state);
      if (this.urlPattern.test(this.url.pathname)) {
        this.host.requestUpdate();
      }
    };
    window.addEventListener("popstate", this.popstateListener);

    this.navigateListener = (
      /** @type {CustomEvent<{url: URL;state: HistoryState;}>} */ event: CustomEvent<{ url: URL; state: HistoryState; }>
    ) => {
      this.url = event.detail.url;
      this.state = event.detail.state;
      if (this.urlPattern.test(this.url.pathname)) {
        this.host.requestUpdate();
      }
    };
    window.addEventListener("navigate", this.navigateListener);
  }
  hostDisconnected() {
    window.removeEventListener("popstate", this.popstateListener);
    window.removeEventListener("navigate", this.navigateListener);
  }

  static goto(url: URL, state: HistoryState) {
    window.history.pushState(state, "", url);
    const event = new CustomEvent("navigate", {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: { url, state },
    });
    window.dispatchEvent(event);
  }
}
