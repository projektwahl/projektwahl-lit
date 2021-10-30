// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

/** @typedef {Record<string, unknown>} HistoryState */

/** @implements {import("lit").ReactiveController} */
export class HistoryController {

  constructor(/** @type {import("lit").ReactiveControllerHost} */ host) {
  /** @type {import("lit").ReactiveControllerHost} */
  this.host = host;
  host.addController(this)

  /** @type {URL} */
  this.url;

  /** @type {HistoryState} */
  this.state;

  /** @private @type {(this: Window, ev: PopStateEvent) => void} */
  this.popstateListener;

  /** @private @type {(this: Window,event: CustomEvent<{url: URL;state: HistoryState;}>) => void} */
  this.navigateListener;

  }
  hostConnected() {
    this.url = new URL(window.location.href);
    this.state = /** @type HistoryState */ (window.history.state);
    this.popstateListener = (/** @type {PopStateEvent} */event) => {
      this.url = new URL(window.location.href);
      this.state = /** @type {HistoryState} */ (event.state);
      this.host.requestUpdate();
    };
    window.addEventListener("popstate", this.popstateListener);
    this.navigateListener = (
      /** @type {CustomEvent<{url: URL;state: HistoryState;}>} */ event
    ) => {
      this.url = event.detail.url;
      this.state = event.detail.state;
      this.host.requestUpdate();
    }

      window.addEventListener("navigate", this.navigateListener);
  }
  hostDisconnected() {
    window.removeEventListener("popstate", this.popstateListener);
    window.removeEventListener("navigate", this.navigateListener);
  }

  static goto(/** @type {URL} */ url, /** @type {HistoryState} */ state) {
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
