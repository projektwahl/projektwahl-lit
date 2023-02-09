import "../../form/pw-form.js";
import { Task } from "@lit-labs/task";
import { PwForm } from "../../form/pw-form.js";
import type { z } from "zod";
import type { routes, MinimalSafeParseError } from "../../../lib/routes.js";
import { LoggedInUserController } from "../../user-controller.js";
export declare function pwProjectCreatePreloaded(id: number, viewOnly?: boolean): import("lit").TemplateResult<1>;
export declare function pwProjectCreate(props: Pick<PwProjectCreate, "disabled" | "url" | "projectId">): import("lit").TemplateResult<1>;
export declare class PwProjectCreate extends PwForm<"/api/v1/projects/create" | "/api/v1/projects/update"> {
    static get properties(): {
        actionText: {
            type: StringConstructor;
        };
        _task: {
            state: boolean;
            hasChanged: () => boolean;
        };
        _initialTask: {
            state: boolean;
            hasChanged: () => boolean;
        };
        type: {
            state: boolean;
        };
        projectId: {
            attribute: boolean;
        };
        disabled: {
            type: BooleanConstructor;
        };
        url: {
            attribute: boolean;
        };
    };
    protected willUpdate(changedProperties: Map<PropertyKey, unknown>): void;
    get actionText(): string;
    projectId: number | null;
    initialTask: Task<[
        number | null
    ], z.SafeParseSuccess<z.infer<typeof routes["/api/v1/projects"]["response"]>["entities"][number]> | MinimalSafeParseError | undefined>;
    userController: LoggedInUserController;
    constructor();
    render(): import("lit").TemplateResult<1>;
}
