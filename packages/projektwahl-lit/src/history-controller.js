export class HistoryController {
    constructor(host) {
        (this.host = host).addController(this);
    }
    hostConnected() {
        this.url = new URL(window.location.href);
        this.state = window.history.state;
        this.popstateListener = (event) => {
            this.url = new URL(window.location.href);
            this.state = event.state;
            this.host.requestUpdate();
        };
        window.addEventListener("popstate", this.popstateListener);
        (this.navigateListener = (event) => {
            this.url = event.detail.url;
            this.state = event.detail.state;
            this.host.requestUpdate();
        }),
            window.addEventListener("navigate", this.navigateListener);
    }
    hostDisconnected() {
        window.removeEventListener("popstate", this.popstateListener);
        window.removeEventListener("navigate", this.navigateListener);
    }
    static goto(url, state) {
        window.history.pushState(state, "", url);
        const event = new CustomEvent("navigate", {
            bubbles: true,
            cancelable: false,
            composed: true,
            detail: { url, state },
        });
        window.dispatchEvent(event);
    }
}
