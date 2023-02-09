import type { routes } from "../../lib/routes.js";
import { PwInput } from "./pw-input.js";
import { Ref } from "lit/directives/ref.js";
export declare function pwInputSelect<P extends keyof typeof routes, T extends string | boolean | number | undefined>(props: Pick<PwInputSelect<P, T>, "type" | "autocomplete" | "disabled" | "enabled" | "initial" | "label" | "name" | "url" | "get" | "set" | "options" | "task" | "defaultValue" | "resettable"> & {
    pwRef?: Ref<PwInputSelect<P, T>>;
}): import("lit").TemplateResult<1>;
export declare class PwInputSelect<P extends keyof typeof routes, T extends string | boolean | number | undefined> extends PwInput<P, T, HTMLSelectElement> {
    mypwinputchangeDispatcher: () => void;
}
