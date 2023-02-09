import type { routes } from "../../lib/routes.js";
import { PwInput } from "./pw-input.js";
export declare function pwInputText<P extends keyof typeof routes, T extends string | undefined | null>(props: Pick<PwInputText<P, T>, "type" | "autocomplete" | "disabled" | "enabled" | "initial" | "label" | "name" | "url" | "get" | "set" | "options" | "task" | "defaultValue" | "resettable">): import("lit").TemplateResult<1>;
export declare class PwInputText<P extends keyof typeof routes, T extends string | undefined | null> extends PwInput<P, T, HTMLInputElement> {
    mypwinputchangeDispatcher: () => void;
}
