/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import "../../form/pw-form.js";
import { PwEntityList } from "../../entity-list/pw-entitylist.js";
export declare const pwProjectsPreloaded: (url: URL) => Promise<import("lit").TemplateResult<1>>;
export declare function pwProjects<X extends string>(props: Pick<PwProjects<X>, "initial" | "prefix">): import("lit").TemplateResult<1>;
export declare class PwProjects<X extends string> extends PwEntityList<"/api/v1/projects", X> {
    static get properties(): {
        title: {
            type: StringConstructor;
        };
        task: {
            attribute: boolean;
            hasChanged: () => boolean;
        };
        initial: {
            attribute: boolean;
        };
        debouncedUrl: {
            state: boolean;
        };
        prefix: {
            attribute: boolean;
        };
        disabled: {
            type: BooleanConstructor;
        };
        url: {
            attribute: boolean;
        };
    };
    constructor();
    get title(): string;
    get buttons(): import("lit").TemplateResult<1>;
    get head(): import("lit").TemplateResult<1>;
    get body(): import("lit").TemplateResult<1>;
}
