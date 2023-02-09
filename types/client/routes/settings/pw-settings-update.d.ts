import "../../form/pw-form.js";
import { Task } from "@lit-labs/task";
import { PwForm } from "../../form/pw-form.js";
import "../../form/pw-input.js";
import type { MinimalSafeParseError, routes } from "../../../lib/routes.js";
import type { z } from "zod";
export declare function pwSettingsUpdate(props: Pick<PwSettingsUpdate, "disabled" | "url">): import("lit").TemplateResult<1>;
declare class PwSettingsUpdate extends PwForm<"/api/v1/settings/update"> {
    static get properties(): {
        _task: {
            state: boolean;
            hasChanged: () => boolean;
        };
        _initialTask: {
            state: boolean;
            hasChanged: () => boolean;
        };
        disabled: {
            type: BooleanConstructor;
        };
        url: {
            attribute: boolean;
        };
    };
    get actionText(): string;
    initialTask: Task<[
    ], z.SafeParseSuccess<z.infer<typeof routes["/api/v1/settings"]["response"]>["entities"][number]> | MinimalSafeParseError | undefined>;
    constructor();
    render(): import("lit").TemplateResult<1>;
}
export {};
