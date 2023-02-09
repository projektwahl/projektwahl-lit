import { Ref } from "lit/directives/ref.js";
import type { routes, ResponseType } from "../../lib/routes.js";
import type { z } from "zod";
import type { Task } from "@lit-labs/task";
import { PwElement } from "../pw-element.js";
import { PwForm } from "./pw-form.js";
export declare abstract class PwInput<P extends keyof typeof routes, T, I extends Element> extends PwElement {
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
    };
    /**
     * The url of the request.
     */
    url: P;
    /**
     * The path in the request to this inputs value.
     */
    name: (string | number)[];
    /**
     * Extracts the value from the routes request data.
     */
    get: (o: z.infer<typeof routes[P]["request"]>) => T;
    /**
     * Sets the value in the routes request data.
     */
    set: (o: z.infer<typeof routes[P]["request"]>, v: T) => void;
    disabled?: boolean;
    enabled?: boolean;
    /**
     * Whether the input is resettable. Adds a reset button that resets the value to the initial value.
     */
    resettable: boolean;
    /**
     * A random id to associate the label and input errors to the input.
     */
    randomId: string;
    /**
     * The label.
     */
    label: string | null;
    /**
     * Field type
     */
    type: "text" | "textarea" | "password" | "number" | "checkbox" | "select" | "file" | "datetime-local";
    /**
     * Autocompletion settings.
     */
    autocomplete?: "username" | "current-password" | "new-password";
    /**
     * The task that is executed in the parent form.
     */
    task: Task<[URLSearchParams], ResponseType<P>>;
    /**
     * The initial data to show and reset to.
     */
    initial?: z.infer<typeof routes[P]["request"]>;
    /**
     * A reference to the input element.
     */
    input: Ref<I>;
    options?: {
        value: T;
        text: string;
    }[];
    /**
     * The default value. This values is used if e.g. a text/number field is empty.
     */
    defaultValue: T;
    /**
     * The parent form.
     */
    pwForm: PwForm<P>;
    /**
     * The value that is currently shown to the user. This value may differ from the value in pwForm.formData e.g. in case you are updating values and have either not changed a field yet or reset the field. This is so the update on the server only updates the fields that you actually changed.
     */
    inputValue: T;
    constructor();
    abstract mypwinputchangeDispatcher: () => void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected willUpdate(changedProperties: Map<PropertyKey, unknown>): void;
    render(): import("lit").TemplateResult<2 | 1>;
}
