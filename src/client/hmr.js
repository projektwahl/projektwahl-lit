import { adoptStyles, LitElement } from "lit";

const originalDefine = window.customElements.define;
window.customElements.define = (name, ...rest) => {
  if (!window.customElements.get(name)) {
    originalDefine.call(window.customElements, name, ...rest);
  }
};

export function setupHmr(clazz, url) {
  return;

  // https://github.com/open-wc/open-wc/blob/master/packages/dev-server-hmr/src/wcHmrRuntime.js
  clazz.connectedElements = new Set();

  const oldConnectedCallback = clazz.prototype.connectedCallback;
  clazz.prototype.connectedCallback = function () {
    oldConnectedCallback.call(this);
    clazz.connectedElements.add(this);
  };
  const oldDisconnectedCallback = clazz.prototype.disconnectedCallback;
  clazz.prototype.disconnectedCallback = function () {
    oldDisconnectedCallback.call(this);
    clazz.connectedElements.delete(this);
  };

  // static callback
  LitElement.hotReplacedCallback = function hotReplacedCallback() {
    console.log("static callback");
    this.finalize();
  };

  // instance callback
  LitElement.prototype.hotReplacedCallback = function hotReplacedCallback() {
    console.log("instance callback");
    this.constructor.finalizeStyles();
    if (window.ShadowRoot && this.renderRoot instanceof window.ShadowRoot) {
      adoptStyles(this.renderRoot, this.constructor.elementStyles);
    }
    this.requestUpdate();
  };

  var eventSource = new EventSource("/api/v1/hmr");
  eventSource.addEventListener("error", function (error) {
    console.error(error);
  });
  eventSource.addEventListener("open", function (event) {
    console.log(event);
  });
  eventSource.addEventListener("message", async function (event) {
    let updatedUrl = new URL(event.data, document.location.origin);
    let currentUrl = new URL(url);

    if (updatedUrl.toString() == currentUrl.toString()) {
      console.log("hmr updating self");

      let response = await import(`${updatedUrl.toString()}?${Date.now()}`);

      console.log(response);

      clazz.prototype.render =
        response[clazz.prototype.constructor.name].prototype.render;

      clazz.hotReplacedCallback();
      clazz.connectedElements.forEach((e) => {
        e.hotReplacedCallback();
      });
    }
  });
}
