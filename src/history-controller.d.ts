import { ReactiveController, ReactiveControllerHost } from "lit";
export declare type HistoryState = Record<string, unknown>;
export declare class HistoryController implements ReactiveController {
    host: ReactiveControllerHost;
    url: URL;
    state: HistoryState;
    private popstateListener;
    private navigateListener;
    constructor(host: ReactiveControllerHost);
    hostConnected(): void;
    hostDisconnected(): void;
    static goto(url: URL, state: HistoryState): void;
}
//# sourceMappingURL=history-controller.d.ts.map