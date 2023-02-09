import type { routes } from "../../lib/routes.js";
import { PwInput } from "./pw-input.js";
export declare function pwInputCheckbox<P extends keyof typeof routes>(props: Pick<PwInputCheckbox<P>, "type" | "autocomplete" | "disabled" | "enabled" | "initial" | "label" | "name" | "url" | "get" | "set" | "options" | "task" | "defaultValue" | "trueValue" | "falseValue" | "resettable">): import("lit").TemplateResult<1>;
export declare class PwInputCheckbox<P extends keyof typeof routes> extends PwInput<P, boolean | undefined, HTMLInputElement> {
    static get properties(): {
        label: {
            attribute: boolean;
        };
        name: {
            attribute: boolean;
            hasChanged: (newVal: (string | number)[], oldVal: (string | number)[]) => boolean;
        };
        type: {
            type: StringConstructor;
        };
        options: {
            attribute: boolean;
            hasChanged: (newVal: (string | number)[], oldVal: (string | number)[]) => boolean;
        };
        autocomplete: {
            type: StringConstructor;
        };
        disabled: {
            type: BooleanConstructor;
        };
        enabled: {
            type: BooleanConstructor;
        };
        randomId: {
            state: boolean;
        };
        defaultValue: {
            attribute: boolean;
        };
        url: {
            attribute: boolean;
        };
        task: {
            attribute: boolean;
            hasChanged: () => boolean;
        };
        initial: {
            attribute: boolean;
        };
        resettable: {
            attribute: boolean;
        };
        trueValue: {
            attribute: boolean;
        };
        falseValue: {
            attribute: boolean;
        };
    };
    falseValue: boolean | undefined;
    trueValue: boolean | undefined;
    mypwinputchangeDispatcher: () => void;
}
