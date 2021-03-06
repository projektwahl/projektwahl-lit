/*
projektwahl-lit is a software to manage choosing projects and automatically assigning people to projects.
Copyright (C) 2021 Moritz Hedtke

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see https://www.gnu.org/licenses/.
*/
/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/

// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: 2018 open-wc

// @ts-nocheck
/* eslint-disable no-param-reassign, no-console */

// Adapted from https://github.com/open-wc/open-wc/blob/master/packages/dev-server-hmr/src/presets/litElement.js licensed under MIT License
import { adoptStyles, LitElement } from "lit";

// static callback
LitElement.hotReplacedCallback = function hotReplacedCallback() {
  this.finalize();
};
// instance callback
LitElement.prototype.hotReplacedCallback = function hotReplacedCallback() {
  // delete styles to ensure that they get recalculated, including picking up
  // changes from parent classes
  this.constructor.finalizeStyles();
  if (window.ShadowRoot && this.renderRoot instanceof window.ShadowRoot) {
    adoptStyles(this.renderRoot, this.constructor.elementStyles);
  }
  this.requestUpdate();
};

// Adapted from https://github.com/open-wc/open-wc/blob/master/packages/dev-server-hmr/src/wcHmrRuntime.js licensed under MIT License

// override global define to allow double registrations
const originalDefine = window.customElements.define;
window.customElements.define = (name, ...rest) => {
  if (!window.customElements.get(name)) {
    originalDefine.call(window.customElements, name, ...rest);
  }
};

const proxiesForKeys = new Map();
const keysForClasses = new Map();

function trackConnectedElements(hmrClass) {
  const connectedElements = new Set();
  const originalCb = hmrClass.prototype.connectedCallback;
  hmrClass.prototype.connectedCallback = function connectedCallback(...args) {
    if (originalCb) {
      originalCb.call(this, ...args);
    }
    connectedElements.add(this);
  };

  const originalDcb = hmrClass.prototype.disconnectedCallback;
  hmrClass.prototype.disconnectedCallback = function disconnectedCallback(
    ...args
  ) {
    if (originalDcb) {
      originalDcb.call(this, ...args);
    }
    connectedElements.delete(this);
  };
  return connectedElements;
}

const proxyMethods = [
  "construct",
  "defineProperty",
  "deleteProperty",
  "getOwnPropertyDescriptor",
  "getPrototypeOf",
  "setPrototypeOf",
  "isExtensible",
  "ownKeys",
  "preventExtensions",
  "has",
  "get",
  "set",
];

/**
 * Creates a proxy for the given target, and fowards any calls to the most up to the latest
 * version of the target. (ex. the latest hot replaced class).
 */
function createProxy(originalTarget, getCurrentTarget) {
  const proxyHandler = {};
  for (const method of proxyMethods) {
    proxyHandler[method] = (_, ...args) => {
      if (method === "get" && args[0] === "prototype") {
        // prototype must always return original target value
        return Reflect[method](_, ...args);
      }
      return Reflect[method](getCurrentTarget(), ...args);
    };
  }
  return new Proxy(originalTarget, proxyHandler);
}

/**
 * Replaces all prototypes in the inheritance chain with a proxy
 * that references the latest implementation
 */
function replacePrototypesWithProxies(instance) {
  let previous = instance;
  let proto = Object.getPrototypeOf(instance);

  while (proto && proto.constructor !== HTMLElement) {
    const key = keysForClasses.get(proto.constructor);
    if (key) {
      // this is a prototype that might be hot-replaced later
      const getCurrentProto = () =>
        proxiesForKeys.get(key).currentClass.prototype;
      Object.setPrototypeOf(previous, createProxy(proto, getCurrentProto));
    }

    previous = proto;
    proto = Object.getPrototypeOf(proto);
  }
}

export class WebComponentHmr extends HTMLElement {
  constructor(...args) {
    super(...args);
    const key = keysForClasses.get(this.constructor);
    // check if the constructor is registered
    if (key) {
      const p = proxiesForKeys.get(key);
      // replace the constructor with a proxy that references the latest implementation of this class
      this.constructor = p.currentProxy;
    }
    // replace prototype chain with a proxy to the latest prototype implementation
    replacePrototypesWithProxies(this);
  }
}

window.WebComponentHmr = WebComponentHmr;

/**
 * Injects the WebComponentHmr class into the inheritance chain
 */
function injectInheritsHmrClass(clazz) {
  let parent = clazz;
  let proto = Object.getPrototypeOf(clazz);
  // walk prototypes until we reach HTMLElement
  while (proto && proto !== HTMLElement) {
    parent = proto;
    proto = Object.getPrototypeOf(proto);
  }

  if (proto !== HTMLElement) {
    // not a web component
    return;
  }
  if (parent === WebComponentHmr) {
    // class already inherits WebComponentHmr
    return;
  }
  Object.setPrototypeOf(parent, WebComponentHmr);
}

/**
 * Registers a web component class. Triggers a hot replacement if the
 * class was already registered before.
 */
export function register<T>(key, clazz: T): T {
  const existing = proxiesForKeys.get(key);
  if (!existing) {
    // this class was not yet registered,

    // create a proxy that will forward to the latest implementation
    const proxy = createProxy(
      clazz,
      () => proxiesForKeys.get(key).currentClass
    );
    // inject a HMR class into the inheritance chain
    injectInheritsHmrClass(clazz);
    // keep track of all connected elements for this class
    const connectedElements = trackConnectedElements(clazz);

    proxiesForKeys.set(key, {
      originalProxy: proxy,
      currentProxy: proxy,
      originalClass: clazz,
      currentClass: clazz,
      connectedElements,
    });
    keysForClasses.set(clazz, key);
    return proxy;
  }
  // class was already registered before

  // register new class, all calls will be proxied to this class
  const previousProxy = existing.currentProxy;
  const currentProxy = createProxy(
    clazz,
    () => proxiesForKeys.get(key).currentClass
  );
  existing.currentClass = clazz;
  existing.currentProxy = currentProxy;

  Promise.resolve().then(() => {
    // call optional HMR on the class if they exist, after next microtask to ensure
    // module bodies have executed fully
    if (clazz.hotReplacedCallback) {
      try {
        clazz.hotReplacedCallback();
      } catch (error) {
        console.error(error);
      }
    }

    for (const element of existing.connectedElements) {
      if (element.constructor === previousProxy) {
        // we need to update the constructor of the element to match to newly created proxy
        // but we should only do this for elements that was directly created with this class
        // and not for elements that extend this
        element.constructor = currentProxy;
      }

      if (element.hotReplacedCallback) {
        try {
          element.hotReplacedCallback();
        } catch (error) {
          console.error(error);
        }
      }
    }
  });

  // the original proxy already forwards to the new class but we're return a new proxy
  // because access to `prototype` must return the original value and we need to be able to
  // manipulate the prototype on the new class
  return currentProxy;
}

if (!window.PRODUCTION) {
  const eventSource = new EventSource("/api/v1/hmr");
  eventSource.addEventListener("error", function (error) {
    console.error(error);
    // eventSource = new EventSource("/api/v1/hmr");
  });
  eventSource.addEventListener("open", function (event) {
    console.log(event);
  });
  eventSource.addEventListener("message", async function (event) {
    const updatedUrl = new URL(event.data, document.location.origin);

    console.log("hmr updating");

    const response = await import(`${updatedUrl.toString()}?${Date.now()}`);

    console.log("update", updatedUrl.toString());
  });
}

export function setupHmr<T>(name: string, clazz: T) {
  if (!window.PRODUCTION) {
    console.log("register", name, clazz);

    return register(name, clazz);
  }

  return clazz;
}
