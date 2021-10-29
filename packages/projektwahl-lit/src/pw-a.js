var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { bootstrapCss } from ".";
import { HistoryController } from "./history-controller";
import { ifDefined } from "lit/directives/if-defined.js";
// TODO FIXME https://lit.dev/docs/components/events/#shadowdom-retargeting just use the approach shown there
export const aClick = (event) => {
    event.preventDefault();
    HistoryController.goto(new URL(event.target.href, window.location.href), {});
};
// this works really bad because bootstrap css styles usually need context information which is not there with this.
let PwADontUse = class PwADontUse extends LitElement {
    constructor() {
        super(...arguments);
        this.clickHandler = (event) => {
            event.preventDefault();
            HistoryController.goto(new URL(this.href, window.location.href), {});
        };
    }
    // with this this may actually be usable again
    createRenderRoot() {
        return this;
    }
    render() {
        return html `${bootstrapCss}<a
        href=${ifDefined(this.href)}
        class=${ifDefined(this.class)}
        role=${ifDefined(this.role)}
        aria-current=${ifDefined(this.ariaCurrent)}
        @click=${this.clickHandler}
        ><slot></slot
      ></a>`;
    }
};
__decorate([
    property({ type: String })
], PwADontUse.prototype, "href", void 0);
__decorate([
    property({ type: String })
], PwADontUse.prototype, "class", void 0);
__decorate([
    property({ type: String })
], PwADontUse.prototype, "role", void 0);
__decorate([
    property({ type: String })
], PwADontUse.prototype, "ariaCurrent", void 0);
PwADontUse = __decorate([
    customElement("pw-a-dontuse")
], PwADontUse);
export { PwADontUse };
