import { PwElement } from "../pw-element.js";
import { LoggedInUserController } from "../user-controller.js";
import { ClockController } from "../clock-controller.js";
import { Task } from "@lit-labs/task";
import type { ResponseType } from "../../lib/routes.js";
export declare function pwWelcome(props: Record<string, never>): import("lit").TemplateResult<1>;
export declare class PwWelcome extends PwElement {
    userController: LoggedInUserController;
    clockController: ClockController;
    task: Task<[string | undefined], ResponseType<"/api/v1/settings">>;
    userTask: Task<[string | undefined], [number, string, boolean] | undefined>;
    constructor();
    protected render(): import("lit").TemplateResult<1>;
}
