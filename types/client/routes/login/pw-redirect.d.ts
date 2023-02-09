import "../../form/pw-form.js";
import { PwForm } from "../../form/pw-form.js";
import "../../form/pw-input.js";
export declare function pwRedirect(props: Record<string, never>): import("lit").TemplateResult<1>;
declare class PwRedirect extends PwForm<"/api/v1/redirect"> {
    static get properties(): {
        _task: {
            state: boolean;
            hasChanged: () => boolean;
        };
        disabled: {
            type: BooleanConstructor;
        };
        url: {
            attribute: boolean;
        };
    };
    get actionText(): string;
    constructor();
    render(): import("lit").TemplateResult<1>;
}
export { PwRedirect };
