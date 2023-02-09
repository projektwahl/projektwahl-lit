/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import "./pw-rank-select.js";
import "../../form/pw-form.js";
import { PwEntityList } from "../../entity-list/pw-entitylist.js";
import type { z } from "zod";
import type { MinimalSafeParseError } from "../../../lib/routes.js";
import { Task } from "@lit-labs/task";
export declare const pwChoicesPreloaded: (url: URL) => Promise<import("lit").TemplateResult<1>>;
export declare function pwChoices<X extends string>(props: Pick<PwChoices<X>, "initial" | "prefix">): import("lit").TemplateResult<1>;
declare class PwChoices<X extends string> extends PwEntityList<"/api/v1/choices", X> {
    correctlyVotedTask: Task<[
    ], z.SafeParseSuccess<readonly [number, number, number, number, number]> | MinimalSafeParseError>;
    constructor();
    get title(): string;
    get buttons(): import("lit").TemplateResult<1>;
    get head(): import("lit").TemplateResult<1>;
    get body(): import("lit").TemplateResult<1>;
}
export {};
