/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import "../../form/pw-form.js";
import { PwEntityList } from "../../entity-list/pw-entitylist.js";
import { LoggedInUserController } from "../../user-controller.js";
export declare const pwUsersPreloaded: (url: URL) => Promise<import("lit").TemplateResult<1>>;
export declare function pwUsers<X extends string>(props: Pick<PwUsers<X>, "initial" | "prefix">): import("lit").TemplateResult<1>;
export declare class PwUsers<X extends string> extends PwEntityList<"/api/v1/users", X> {
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
    userController: LoggedInUserController;
    constructor();
    get title(): string;
    get buttons(): import("lit").TemplateResult<1>;
    get head(): import("lit").TemplateResult<1>;
    get body(): import("lit").TemplateResult<1>;
}
