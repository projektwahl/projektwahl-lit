/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import { TemplateResult } from "lit";
import { Task } from "@lit-labs/task";
import { PwElement } from "./pw-element.js";
import { LoggedInUserController } from "./user-controller.js";
export declare const getLocale: (() => string) & {
    _LIT_LOCALIZE_GET_LOCALE_?: undefined;
}, setLocale: ((newLocale: string) => Promise<void>) & {
    _LIT_LOCALIZE_SET_LOCALE_?: undefined;
};
declare const pages: {
    "^/privacy$": () => TemplateResult<1>;
    "^/imprint$": () => TemplateResult<1>;
    "^/evaluation$": () => TemplateResult<1>;
    "^/$": () => TemplateResult<1>;
    "^/redirect$": () => TemplateResult<1>;
    "^/login$": () => TemplateResult<1>;
    "^/users$": (url: URL) => Promise<TemplateResult<1>>;
    "^/users/create$": () => TemplateResult<1>;
    "^/users/import$": () => TemplateResult<1>;
    "^/users/edit/\\d+$": (url: URL) => TemplateResult<1>;
    "^/users/view/\\d+$": (url: URL) => TemplateResult<1>;
    "^/projects$": (url: URL) => Promise<TemplateResult<1>>;
    "^/projects-overview$": (url: URL) => Promise<TemplateResult<1>>;
    "^/projects/create$": () => TemplateResult<1>;
    "^/projects/edit/\\d+$": (url: URL) => TemplateResult<1>;
    "^/projects/view/\\d+$": (url: URL) => TemplateResult<1>;
    "^/vote$": (url: URL) => Promise<TemplateResult<1>>;
    "^/sessions$": (url: URL) => Promise<TemplateResult<1>>;
    "^/settings$": () => TemplateResult<1>;
};
export declare function pwApp(props: Record<string, never>): TemplateResult<1>;
export declare class PwApp extends PwElement {
    static get properties(): {
        initial: {
            attribute: boolean;
        };
        navbarOpen: {
            state: boolean;
        };
        username: {
            state: boolean;
        };
    };
    private history;
    initial: import("lit").TemplateResult | undefined;
    navbarOpen: boolean;
    private popstateListener;
    protected _apiTask: Task<[keyof typeof pages | undefined], TemplateResult>;
    nextPage: ([key]: [
        keyof typeof pages | undefined
    ]) => Promise<TemplateResult>;
    userController: LoggedInUserController;
    private navigateListener;
    connectedCallback(): void;
    disconnectedCallback(): void;
    constructor();
    render(): TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'pw-app': PwApp;
    }
}
export {};
