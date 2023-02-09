/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import "../../form/pw-input.js";
import { Task } from "@lit-labs/task";
import type { routes } from "../../../lib/routes.js";
import type { z } from "zod";
import { PwElement } from "../../pw-element.js";
export declare function pwProjectUserCheckbox(props: Pick<PwProjectUserCheckbox, "type" | "projectId" | "user" | "name">): import("lit").TemplateResult<1>;
declare class PwProjectUserCheckbox extends PwElement {
    static get properties(): {
        _task: {
            state: boolean;
            hasChanged: () => boolean;
        };
        disabled: {
            state: boolean;
        };
        user: {
            attribute: boolean;
        };
        projectId: {
            type: NumberConstructor;
        };
        url: {
            type: StringConstructor;
        };
        name: {
            type: StringConstructor;
        };
        type: {
            type: StringConstructor;
        };
    };
    name: "project_leader_id" | "force_in_project_id";
    _task: Task<readonly unknown[], import("../../../lib/routes.js").MinimalSafeParseError | z.SafeParseSuccess<{
        id: number;
        project_leader_id: number | null;
        force_in_project_id: number | null;
    }[]>>;
    user: z.infer<typeof routes["/api/v1/users"]["response"]>["entities"][number];
    projectId: number;
    disabled: boolean;
    form: import("lit/directives/ref").Ref<HTMLFormElement>;
    input: import("lit/directives/ref").Ref<HTMLElement>;
    type: "radio" | "checkbox";
    constructor();
    render(): import("lit").TemplateResult<1>;
}
export {};
