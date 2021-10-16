// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { ReactiveController, ReactiveControllerHost } from "lit";

export type HistoryState = Record<string, unknown>;

export class HistoryController implements ReactiveController {
  host: ReactiveControllerHost;

  url!: URL;
  state!: HistoryState;
  private popstateListener!: (this: Window, ev: PopStateEvent) => void;
  private navigateListener!: (
    this: Window,
    event: CustomEvent<{
      url: URL;
      state: HistoryState;
    }>
  ) => void;

  constructor(host: ReactiveControllerHost) {
    (this.host = host).addController(this);
  }
  hostConnected() {
    this.url = new URL(window.location.href);
    this.state = window.history.state as HistoryState;
    this.popstateListener = (event: PopStateEvent) => {
      this.url = new URL(window.location.href);
      this.state = event.state as HistoryState;
      this.host.requestUpdate();
    };
    window.addEventListener("popstate", this.popstateListener);
    (this.navigateListener = (
      event: CustomEvent<{
        url: URL;
        state: HistoryState;
      }>
    ) => {
      this.url = event.detail.url;
      this.state = event.detail.state;
      this.host.requestUpdate();
    }),
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
