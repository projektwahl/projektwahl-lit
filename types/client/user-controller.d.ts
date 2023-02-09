/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import type { ReactiveController, ReactiveControllerHost } from "lit";
export declare class LoggedInUserController implements ReactiveController {
    host: ReactiveControllerHost;
    username: string | undefined;
    type: string | undefined;
    id: number | undefined;
    constructor(host: ReactiveControllerHost);
    updateloginstate: () => void;
    hostConnected(): void;
    hostDisconnected(): void;
}
