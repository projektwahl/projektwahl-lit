// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import { html } from 'lit';
import { directive, Directive, PartType } from 'lit/directive.js';

/** @typedef {import('lit').ReactiveController} ReactiveController */

/** @implements {ReactiveController} */
export class EventController {
    constructor(/** @type {import("lit").ReactiveControllerHost} */ host, value) {
      /** @type {import("lit").ReactiveControllerHost} */
      this.host = host;
      host.addController(this);

      /** @type {any | undefined} */
      this.value = value;
  
      /** @type {(this: Window, ev: Event) => void} */
      this.listener = (event) => {
        console.log(event)
        this.value = event.target.value;
        this.host.requestUpdate();
      };
    }

    hostConnected() {}
}  