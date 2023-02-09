/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import "../../form/pw-input.js";
import { Task } from "@lit-labs/task";
import type { routes, ResponseType } from "../../../lib/routes.js";
import type { z } from "zod";
import { PwElement } from "../../pw-element.js";
export declare function pwRankSelect(props: Pick<PwRankSelect, "choice">): import("lit").TemplateResult<1>;
declare class PwRankSelect extends PwElement {
    static get properties(): {
        _task: {
            state: boolean;
            hasChanged: () => boolean;
        };
        disabled: {
            state: boolean;
        };
        choice: {
            attribute: boolean;
        };
        url: {
            type: StringConstructor;
        };
    };
    _task: Task<[number], ResponseType<"/api/v1/choices/update">>;
    choice: z.infer<typeof routes["/api/v1/choices"]["response"]>["entities"][number];
    disabled: boolean;
    constructor();
    protected willUpdate(changedProperties: Map<PropertyKey, unknown>): void;
    render(): import("lit").TemplateResult<1>;
}
export {};
