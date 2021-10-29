import "../../lib/form/pw-form";
import { LitElement, TemplateResult } from "lit";
import { Routes } from "../../routes";
import { OptionalResult } from "../../lib/result";
import "../../lib/form/pw-input";
export declare const pwLogin: () => Promise<TemplateResult>;
export declare class PwLogin<P extends keyof Routes> extends LitElement {
    result: Promise<OptionalResult<Routes[P], {
        network?: string;
    } & {
        [key in keyof Routes[P]]?: string;
    }>>;
    render(): TemplateResult<1>;
}
