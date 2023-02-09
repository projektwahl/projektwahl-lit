/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import "../../form/pw-form.js";
import "../../entity-list/pw-order.js";
import "../projects/pw-project-user-checkbox.js";
import "../../form/pw-input.js";
import type { routes } from "../../../lib/routes.js";
import type { z } from "zod";
import { PwProjects } from "../projects/pw-projects.js";
export declare function pwUserProjects<X extends string>(props: Pick<PwUserProjects<X>, "initial" | "prefix" | "user" | "name" | "title"> & {
    refreshentitylist?: () => void;
}): import("lit").TemplateResult<1>;
export declare class PwUserProjects<X extends string> extends PwProjects<X> {
    static get properties(): {
        user: {
            attribute: boolean;
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
    name: "project_leader_id" | "force_in_project_id";
    user: z.infer<typeof routes["/api/v1/users"]["response"]>["entities"][number];
    get buttons(): import("lit").TemplateResult<1>;
    get head(): import("lit").TemplateResult<1>;
    get body(): import("lit").TemplateResult<1>;
}
