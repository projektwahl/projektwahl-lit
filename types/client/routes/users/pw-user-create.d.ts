import "../../form/pw-form.js";
import { Task } from "@lit-labs/task";
import { PwForm } from "../../form/pw-form.js";
import "../../form/pw-input.js";
import type { MinimalSafeParseError, routes } from "../../../lib/routes.js";
import type { z } from "zod";
import { Ref } from "lit/directives/ref.js";
import { PwInputSelect } from "../../form/pw-input-select.js";
import "./pw-user-projects.js";
export declare function pwUserCreatePreloaded(id: number, viewOnly?: boolean): import("lit").TemplateResult<1>;
export declare function pwUserCreate(props: Pick<PwUserCreate, "disabled" | "userId" | "url">): import("lit").TemplateResult<1>;
declare class PwUserCreate extends PwForm<"/api/v1/users/create-or-update"> {
    static get properties(): {
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
        userId: {
            attribute: boolean;
        };
        disabled: {
            type: BooleanConstructor;
        };
        url: {
            attribute: boolean;
        };
    };
    get actionText(): string;
    userId: number | null;
    initialTask: Task<[
        number | null
    ], z.SafeParseSuccess<(z.infer<typeof routes["/api/v1/users"]["response"]>["entities"][number] & {
        action: "update";
    })[]> | MinimalSafeParseError | undefined>;
    typeRef: Ref<PwInputSelect<"/api/v1/users/create-or-update", "voter" | "helper" | "admin" | undefined>>;
    constructor();
    protected willUpdate(changedProperties: Map<PropertyKey, unknown>): void;
    render(): import("lit").TemplateResult<1>;
}
export {};
