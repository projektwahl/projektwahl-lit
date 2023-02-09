import { HistoryController } from "../history-controller.js";
import type { entityRoutes } from "../../lib/routes.js";
import type { z } from "zod";
import { PwInput } from "../form/pw-input.js";
type entitiesType1 = {
    [P in keyof typeof entityRoutes]: z.infer<typeof entityRoutes[P]["request"]>["sorting"][number][0];
};
type entitiesType2 = {
    [P in keyof typeof entityRoutes]: z.infer<typeof entityRoutes[P]["request"]>["sorting"][number][2];
};
export declare function pwOrder<P extends keyof typeof entityRoutes, X extends string>(props: Pick<PwOrder<P, X>, "url" | "name" | "prefix" | "title" | "value" | "orderBy" | "get" | "set" | "initial" | "defaultValue">): import("lit").TemplateResult<1>;
export declare class PwOrder<P extends keyof typeof entityRoutes, X extends string> extends PwInput<P, Array<z.infer<typeof entityRoutes[P]["request"]>["sorting"][number]>, HTMLButtonElement> {
    static get properties(): {
        title: {
            attribute: boolean;
        };
        path: {
            attribute: boolean;
        };
        url: {
            attribute: boolean;
        };
        prefix: {
            attribute: boolean;
        };
        orderBy: {
            attribute: boolean;
        };
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
    prefix: X;
    orderBy: entitiesType1[P];
    value: entitiesType2[P];
    title: string;
    randomId: string;
    history: HistoryController;
    url: P;
    constructor();
    mypwinputchangeDispatcher: () => void;
    protected willUpdate(changedProperties: Map<PropertyKey, unknown>): void;
    render(): import("lit").TemplateResult<1>;
}
export {};
