import { Ref } from "lit/directives/ref.js";
import type { routes, ResponseType } from "../../lib/routes.js";
import type { Task } from "@lit-labs/task";
import { PwElement } from "../pw-element.js";
import type { z } from "zod";
declare class PwForm<P extends keyof typeof routes> extends PwElement {
    static get properties(): {
        disabled: {
            type: BooleanConstructor;
        };
        url: {
            attribute: boolean;
        };
    };
    disabled: boolean;
    get actionText(): string;
    _task: Task<[URLSearchParams], ResponseType<P>>;
    form: import("lit/directives/ref").Ref<HTMLFormElement>;
    url: P;
    errors: Ref<HTMLDivElement>;
    formData: z.infer<typeof routes[P]["request"]>;
    constructor();
    getErrors(): import("lit").TemplateResult<1>;
    protected updated(): void;
}
export { PwForm };
