import { LitElement, TemplateResult } from "lit";
import { OptionalResult } from "../result";
export declare class PwInput<T> extends LitElement {
    private history;
    label: string;
    type: "text" | "password";
    name: keyof T;
    autocomplete: "username" | "current-password";
    randomId: string;
    result: Promise<OptionalResult<T, {
        network?: string;
    } & {
        [key in keyof T]?: string;
    }>>;
    constructor();
    protected createRenderRoot(): this;
    render(): TemplateResult<1>;
}
