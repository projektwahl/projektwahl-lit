/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
export declare class WebComponentHmr extends HTMLElement {
    constructor(...args: any[]);
}
/**
 * Registers a web component class. Triggers a hot replacement if the
 * class was already registered before.
 */
export declare function register<T>(key: any, clazz: T): T;
export declare function setupHmr<T>(name: string, clazz: T): T;
