// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import { html } from 'lit';
import { directive, Directive, PartType } from 'lit/directive.js';

/** @typedef {import('lit').ReactiveController} ReactiveController */

class EventDirective extends Directive {

  constructor(/** @type {import('lit/directive.js').PartInfo} */ partInfo) {
    super(partInfo);

    if (
      partInfo.type !== PartType.ELEMENT
    ) {
      throw new Error('The `eventDirective` must be used in element position');
    }
  }

  /** @override */ update(/** @type {import('lit/directive.js').ElementPart} */ part, /** @type {[EventController]} */ [controller]) {
    console.log("jo", part.element.value)
    controller.value = part.element.value
    return this.render();
  }

  render() {
    return undefined
  }
}

const eventDirective = directive(EventDirective);

/** @implements {ReactiveController} */
export class EventController {
    constructor(/** @type {import("lit").ReactiveControllerHost} */ host) {
      /** @type {import("lit").ReactiveControllerHost} */
      this.host = host;
      host.addController(this);

      /** @type {any | undefined} */
      this.value;
  
      /** @type {(this: Window, ev: Event) => void} */
      this.listener = (event) => {
        console.log(event)
        this.value = event.target.value;
        this.host.requestUpdate();
      };
    }

    hostConnected() {}

    directive() {
      return eventDirective(this);
    }
}  