import { LitElement } from "lit";
export declare const aClick: (event: MouseEvent) => void;
export declare class PwADontUse extends LitElement {
    protected createRenderRoot(): this;
    href: string;
    class?: string;
    role?: "button";
    ariaCurrent: "page" | "step" | "location" | "date" | "time" | "true" | "false";
    clickHandler: (event: MouseEvent) => void;
    render(): import("lit-html").TemplateResult<1>;
}
