import type { routes } from "../../lib/routes.js";
import { PwInput } from "./pw-input.js";
export declare function pwInputNumber<P extends keyof typeof routes, T extends number | undefined | null>(props: Pick<PwInputNumber<P, T>, "type" | "autocomplete" | "disabled" | "enabled" | "initial" | "label" | "name" | "url" | "get" | "set" | "options" | "task" | "defaultValue" | "resettable">): import("lit").TemplateResult<1>;
export declare class PwInputNumber<P extends keyof typeof routes, T extends number | undefined | null> extends PwInput<P, T, HTMLInputElement> {
    mypwinputchangeDispatcher: () => void;
}
