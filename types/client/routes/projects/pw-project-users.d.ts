/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import "../../form/pw-form.js";
import "../../entity-list/pw-order.js";
import { PwUsers } from "../users/pw-users.js";
import "./pw-project-user-checkbox.js";
import "../../form/pw-input.js";
export declare function pwProjectUsers<X extends string>(props: Pick<PwProjectUsers<X>, "initial" | "prefix" | "projectId" | "name" | "title">): import("lit").TemplateResult<1>;
export declare class PwProjectUsers<X extends string> extends PwUsers<X> {
    static get properties(): {
        projectId: {
            type: NumberConstructor;
        };
        name: {
            type: StringConstructor;
        };
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
    name: "project_leader_id" | "force_in_project_id" | "computed_in_project_id";
    projectId: number;
    get buttons(): import("lit").TemplateResult<1>;
    render(): import("lit").TemplateResult<1>;
    get head(): import("lit").TemplateResult<1>;
    get body(): import("lit").TemplateResult<1>;
}
