// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { ReactiveController, ReactiveControllerHost } from "lit";

type HistoryState = Record<string, unknown>;

export class HistoryController implements ReactiveController {
  host: ReactiveControllerHost;

  url: URL;
  state: HistoryState;
  private popstateListener: (this: Window, ev: PopStateEvent) => void;
  private navigateListener: (
    this: Window,
    event: CustomEvent<{
      url: URL;
      state: HistoryState;
    }>
  ) => void;

  testAsyncIterable: AsyncIterable<URL>;

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

    /*
      // this doesn't work which I already expected
      this.testAsyncIterable = {
        async* [Symbol.asyncIterator]() {
            yield new URL(window.location.href);
            window.addEventListener("navigate", (event: CustomEvent<{
              url: URL;
              state: HistoryState;
            }>) => {
              yield event.detail.url
            })
        }
    };*/
  }
  hostDisconnected() {
    window.removeEventListener("popstate", this.popstateListener);
    this.popstateListener = undefined;
    window.removeEventListener("navigate", this.navigateListener);
    this.navigateListener = undefined;
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
