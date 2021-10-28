import "./pw-input";
import { LitElement, TemplateResult } from "lit";
import { Ref } from "lit/directives/ref.js";
import { Routes } from "../../routes";
import { OptionalResult } from "../result";
export declare class PwForm<P extends keyof Routes> extends LitElement {
    private history;
    url: P;
    actionText: string;
    fakeSlot: TemplateResult;
    form: Ref<HTMLFormElement>;
    result: Promise<OptionalResult<Routes[P], {
        network?: string;
    } & {
        [key in keyof Routes[P]]?: string;
    }>>;
    submit: (event: SubmitEvent) => void;
    render(): TemplateResult<1>;
}
//# sourceMappingURL=pw-form.d.ts.map