/*
projektwahl-lit is a software to manage choosing projects and automatically assigning people to projects.
Copyright (C) 2021 Moritz Hedtke

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see https://www.gnu.org/licenses/.
*/
/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import type { ReactiveController, ReactiveControllerHost } from "lit";

export type HistoryState = Record<string, unknown>;

export class HistoryController implements ReactiveController {
  host;

  urlPattern;

  url;

  state: HistoryState;

  private navigateListener: (
    this: Window,
    event: CustomEvent<{ url: URL; state: HistoryState }>
  ) => void;

  constructor(host: ReactiveControllerHost, urlPattern: RegExp) {
    (this.host = host).addController(this);

    this.urlPattern = urlPattern;

    this.url = new URL(window.location.href);

    
    this.state = window.history?.state;

    this.navigateListener = (event) => {
      this.url = event.detail.url;
      this.state = event.detail.state;
      if (this.urlPattern.test(this.url.pathname)) {
        this.host.requestUpdate();
      }
    };
  }
  hostConnected() {
    this.url = new URL(window.location.href);
    
    this.state = window.history.state;

    window.addEventListener("navigate", this.navigateListener);
  }
  hostDisconnected() {
    window.removeEventListener("navigate", this.navigateListener);
  }

  static goto(url: URL, state: HistoryState, replace: boolean) {
    if (replace) {
      window.history.replaceState(state, "", url);
    } else {
      window.history.pushState(state, "", url);
    }
    const event = new CustomEvent("navigate", {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: { url, state },
    });
    window.dispatchEvent(event);
  }
}
