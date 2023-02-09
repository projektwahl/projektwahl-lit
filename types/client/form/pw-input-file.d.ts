import type { routes } from "../../lib/routes.js";
import { PwInput } from "./pw-input.js";
export declare function pwInputFile<P extends keyof typeof routes>(props: Pick<PwInputFile<P>, "type" | "autocomplete" | "disabled" | "enabled" | "initial" | "label" | "name" | "url" | "get" | "set" | "options" | "task" | "defaultValue" | "resettable">): import("lit").TemplateResult<1>;
export declare class PwInputFile<P extends keyof typeof routes> extends PwInput<P, Promise<string> | undefined, HTMLInputElement> {
    mypwinputchangeDispatcher: () => void;
}
