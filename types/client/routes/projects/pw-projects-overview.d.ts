/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import "../../form/pw-form.js";
import { PwEntityList } from "../../entity-list/pw-entitylist.js";
export declare const pwProjectsOverviewPreloaded: (url: URL) => Promise<import("lit").TemplateResult<1>>;
export declare function pwProjectsOverview<X extends string>(props: Pick<PwProjectsOverview<X>, "initial" | "prefix">): import("lit").TemplateResult<1>;
export declare class PwProjectsOverview<X extends string> extends PwEntityList<"/api/v1/projects", X> {
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
    get body(): import("lit").TemplateResult<1>;
    render(): import("lit").TemplateResult<1>;
}
