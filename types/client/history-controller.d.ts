/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import type { ReactiveController, ReactiveControllerHost } from "lit";
export type HistoryState = Record<string, unknown>;
export declare class HistoryController implements ReactiveController {
    host: ReactiveControllerHost;
    urlPattern: RegExp;
    url: URL;
    state: HistoryState;
    private navigateListener;
    constructor(host: ReactiveControllerHost, urlPattern: RegExp);
    hostConnected(): void;
    hostDisconnected(): void;
    static goto(url: URL, state: HistoryState, replace: boolean): void;
}
