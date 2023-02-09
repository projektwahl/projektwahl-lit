import "../../form/pw-form.js";
import { PwForm } from "../../form/pw-form.js";
import "../../form/pw-input.js";
export declare function pwLogin(props: Record<string, never>): import("lit").TemplateResult<1>;
declare class PwLogin extends PwForm<"/api/v1/login"> {
    static get properties(): {
        url: {
            attribute: boolean;
        };
        actionText: {
            type: StringConstructor;
        };
        _task: {
            state: boolean;
            hasChanged: () => boolean;
        };
        disabled: {
            type: BooleanConstructor;
        };
    };
    get actionText(): string;
    constructor();
    render(): import("lit").TemplateResult<1>;
}
export { PwLogin };
