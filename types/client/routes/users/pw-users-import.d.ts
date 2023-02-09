import "../../form/pw-form.js";
import { PwForm } from "../../form/pw-form.js";
import "../../form/pw-input.js";
export declare function pwUsersImport(props: Pick<PwUsersImport, "url">): import("lit").TemplateResult<1>;
declare class PwUsersImport extends PwForm<"/api/v1/users/create-or-update"> {
    static get properties(): {
        _task: {
            state: boolean;
            hasChanged: () => boolean;
        };
        type: {
            state: boolean;
        };
        initial: {
            attribute: boolean;
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
export {};
