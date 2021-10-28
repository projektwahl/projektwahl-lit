/* eslint-disable */
//prettier-ignore
module.exports = {
name: "@yarnpkg/plugin-dependencies-from-source",
factory: function (require) {
var plugin = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
  var __require = (x) => {
    if (typeof require !== "undefined")
      return require(x);
    throw new Error('Dynamic require of "' + x + '" is not supported');
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, {get: all[name], enumerable: true});
  };
  var __reExport = (target, module, desc) => {
    if (module && typeof module === "object" || typeof module === "function") {
      for (let key of __getOwnPropNames(module))
        if (!__hasOwnProp.call(target, key) && key !== "default")
          __defProp(target, key, {get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable});
    }
    return target;
  };
  var __toModule = (module) => {
    return __reExport(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", module && module.__esModule && "default" in module ? {get: () => module.default, enumerable: true} : {value: module, enumerable: true})), module);
  };

  // pnp:/home/moritz/Documents/projektwahl-lit/packages/yarn-plugin-dependencies-from-source/sources/index.ts
  var sources_exports = {};
  __export(sources_exports, {
    default: () => sources_default
  });

  // pnp:/home/moritz/Documents/projektwahl-lit/packages/yarn-plugin-dependencies-from-source/sources/MyCustomResolver.ts
  var import_core = __toModule(__require("@yarnpkg/core"));
  var _MyCustomResolver = class {
    supportsDescriptor(descriptor, opts) {
      console.log("descriptor");
      console.log(descriptor);
      return descriptor.range.startsWith(_MyCustomResolver.PROTOCOL);
    }
    supportsLocator(locator, opts) {
      return false;
    }
    shouldPersistResolution(locator, opts) {
      return false;
    }
    bindDescriptor(descriptor, fromLocator, opts) {
      return descriptor;
    }
    getResolutionDependencies(descriptor, opts) {
      return [];
    }
    async getCandidates(descriptor, dependencies, opts) {
      const nextDescriptor = import_core.structUtils.parseDescriptor(`${descriptor.scope ? `@${descriptor.scope}/` : ""}${descriptor.name}@npm:${descriptor.range.slice(_MyCustomResolver.PROTOCOL.length)}`, true);
      console.log("nextdescriptor:", nextDescriptor);
      let candidates = await opts.resolver.getCandidates(nextDescriptor, dependencies, opts);
      console.log(candidates);
      return candidates.map((locator) => {
      });
    }
    async getSatisfying(descriptor, references, opts) {
      return null;
    }
    async resolve(locator, opts) {
      throw new Error("not supported");
    }
  };
  var MyCustomResolver = _MyCustomResolver;
  MyCustomResolver.PROTOCOL = "custom:";

  // pnp:/home/moritz/Documents/projektwahl-lit/packages/yarn-plugin-dependencies-from-source/sources/index.ts
  var plugin = {
    resolvers: [
      MyCustomResolver
    ]
  };
  var sources_default = plugin;
  return sources_exports;
})();
return plugin;
}
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsicG5wOi9ob21lL21vcml0ei9Eb2N1bWVudHMvcHJvamVrdHdhaGwtbGl0L3BhY2thZ2VzL3lhcm4tcGx1Z2luLWRlcGVuZGVuY2llcy1mcm9tLXNvdXJjZS9zb3VyY2VzL2luZGV4LnRzIiwgInBucDovaG9tZS9tb3JpdHovRG9jdW1lbnRzL3Byb2pla3R3YWhsLWxpdC9wYWNrYWdlcy95YXJuLXBsdWdpbi1kZXBlbmRlbmNpZXMtZnJvbS1zb3VyY2Uvc291cmNlcy9NeUN1c3RvbVJlc29sdmVyLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgdHlwZSB7UGx1Z2lufSBmcm9tICdAeWFybnBrZy9jb3JlJztcbmltcG9ydCB7QmFzZUNvbW1hbmR9IGZyb20gJ0B5YXJucGtnL2NsaSc7XG5pbXBvcnQge09wdGlvbn0gZnJvbSAnY2xpcGFuaW9uJztcbmltcG9ydCB7IE15Q3VzdG9tUmVzb2x2ZXIgfSBmcm9tICcuL015Q3VzdG9tUmVzb2x2ZXInO1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20veWFybnBrZy9iZXJyeS90cmVlL21hc3Rlci9wYWNrYWdlcy9wbHVnaW4tZ2l0L3NvdXJjZXNcblxuLy8gaHR0cHM6Ly95YXJucGtnLmNvbS9hcGkvaW50ZXJmYWNlcy95YXJucGtnX2NvcmUucmVzb2x2ZXIuaHRtbFxuY29uc3QgcGx1Z2luOiBQbHVnaW4gPSB7XG4gIHJlc29sdmVyczogW1xuICAgIE15Q3VzdG9tUmVzb2x2ZXJcbiAgXVxufTtcblxuZXhwb3J0IGRlZmF1bHQgcGx1Z2luO1xuIiwgImltcG9ydCB7RGVzY3JpcHRvciwgTG9jYXRvciwgUmVzb2x2ZXIsIFJlc29sdmVPcHRpb25zLCBNaW5pbWFsUmVzb2x2ZU9wdGlvbnMsIFBhY2thZ2UsIERlc2NyaXB0b3JIYXNoLCBzdHJ1Y3RVdGlscywgfSBmcm9tICdAeWFybnBrZy9jb3JlJztcbmltcG9ydCB7IE5wbVNlbXZlclJlc29sdmVyIH0gZnJvbSAnQHlhcm5wa2cvcGx1Z2luLW5wbS9saWIvTnBtU2VtdmVyUmVzb2x2ZXInXG5cbmV4cG9ydCBjbGFzcyBNeUN1c3RvbVJlc29sdmVyIGltcGxlbWVudHMgUmVzb2x2ZXIge1xuXG4gIHN0YXRpYyBQUk9UT0NPTCA9IFwiY3VzdG9tOlwiO1xuXG4gIHN1cHBvcnRzRGVzY3JpcHRvcihkZXNjcmlwdG9yOiBEZXNjcmlwdG9yLCBvcHRzOiBNaW5pbWFsUmVzb2x2ZU9wdGlvbnMpIHtcbiAgICBjb25zb2xlLmxvZyhcImRlc2NyaXB0b3JcIilcbiAgICBjb25zb2xlLmxvZyhkZXNjcmlwdG9yKVxuXG4gICAgcmV0dXJuIGRlc2NyaXB0b3IucmFuZ2Uuc3RhcnRzV2l0aChNeUN1c3RvbVJlc29sdmVyLlBST1RPQ09MKVxuICB9XG5cbiAgLy8gaW4gdGhlIG9wdGltYWwgY2FzZSB3ZSByZXNvbHZlIHRvIGxvY2F0b3JzIG9mIG90aGVyIHJlc29sdmVyc1xuICBzdXBwb3J0c0xvY2F0b3IobG9jYXRvcjogTG9jYXRvciwgb3B0czogTWluaW1hbFJlc29sdmVPcHRpb25zKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuIHNob3VsZFBlcnNpc3RSZXNvbHV0aW9uKGxvY2F0b3I6IExvY2F0b3IsIG9wdHM6IE1pbmltYWxSZXNvbHZlT3B0aW9ucykge1xuICAgIHJldHVybiBmYWxzZTsgLy8gZm9yIHRlc3RpbmdcbiAgfVxuIFxuICAvLyBzaG91bGQgYmUgZ29vZFxuICBiaW5kRGVzY3JpcHRvcihkZXNjcmlwdG9yOiBEZXNjcmlwdG9yLCBmcm9tTG9jYXRvcjogTG9jYXRvciwgb3B0czogTWluaW1hbFJlc29sdmVPcHRpb25zKSB7XG4gICAgcmV0dXJuIGRlc2NyaXB0b3I7XG4gIH1cblxuICAvLyBzaG91bGQgYmUgZ29vZFxuICBnZXRSZXNvbHV0aW9uRGVwZW5kZW5jaWVzKGRlc2NyaXB0b3I6IERlc2NyaXB0b3IsIG9wdHM6IE1pbmltYWxSZXNvbHZlT3B0aW9ucykge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIGFzeW5jIGdldENhbmRpZGF0ZXMoZGVzY3JpcHRvcjogRGVzY3JpcHRvciwgZGVwZW5kZW5jaWVzOiBNYXA8RGVzY3JpcHRvckhhc2gsIFBhY2thZ2U+LCBvcHRzOiBSZXNvbHZlT3B0aW9ucykge1xuICAgIGNvbnN0IG5leHREZXNjcmlwdG9yID0gc3RydWN0VXRpbHMucGFyc2VEZXNjcmlwdG9yKGAke2Rlc2NyaXB0b3Iuc2NvcGU/YEAke2Rlc2NyaXB0b3Iuc2NvcGV9L2A6XCJcIn0ke2Rlc2NyaXB0b3IubmFtZX1AbnBtOiR7ZGVzY3JpcHRvci5yYW5nZS5zbGljZShNeUN1c3RvbVJlc29sdmVyLlBST1RPQ09MLmxlbmd0aCl9YCwgdHJ1ZSk7XG4gICAgY29uc29sZS5sb2coXCJuZXh0ZGVzY3JpcHRvcjpcIiwgbmV4dERlc2NyaXB0b3IpXG5cbiAgICBsZXQgY2FuZGlkYXRlcyA9IGF3YWl0IG9wdHMucmVzb2x2ZXIuZ2V0Q2FuZGlkYXRlcyhuZXh0RGVzY3JpcHRvciwgZGVwZW5kZW5jaWVzLCBvcHRzKTtcbiAgICBjb25zb2xlLmxvZyhjYW5kaWRhdGVzKVxuXG4gICAgcmV0dXJuIGNhbmRpZGF0ZXMubWFwKGxvY2F0b3IgPT4ge1xuXG4gICAgfSlcbiAgfVxuXG4gIC8vIHNob3VsZCBiZSBnb29kXG4gIGFzeW5jIGdldFNhdGlzZnlpbmcoZGVzY3JpcHRvcjogRGVzY3JpcHRvciwgcmVmZXJlbmNlczogQXJyYXk8c3RyaW5nPiwgb3B0czogUmVzb2x2ZU9wdGlvbnMpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIHNob3VsZCBiZSBnb29kXG4gIGFzeW5jIHJlc29sdmUobG9jYXRvcjogTG9jYXRvciwgb3B0czogUmVzb2x2ZU9wdGlvbnMpOiBQcm9taXNlPFBhY2thZ2U+IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJub3Qgc3VwcG9ydGVkXCIpO1xuICB9XG59Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDQUEsb0JBQTJIO0FBR3BILGdDQUEyQztBQUFBLElBSWhELG1CQUFtQixZQUF3QixNQUE2QjtBQUN0RSxjQUFRLElBQUk7QUFDWixjQUFRLElBQUk7QUFFWixhQUFPLFdBQVcsTUFBTSxXQUFXLGtCQUFpQjtBQUFBO0FBQUEsSUFJdEQsZ0JBQWdCLFNBQWtCLE1BQTZCO0FBQzdELGFBQU87QUFBQTtBQUFBLElBR1Ysd0JBQXdCLFNBQWtCLE1BQTZCO0FBQ3BFLGFBQU87QUFBQTtBQUFBLElBSVQsZUFBZSxZQUF3QixhQUFzQixNQUE2QjtBQUN4RixhQUFPO0FBQUE7QUFBQSxJQUlULDBCQUEwQixZQUF3QixNQUE2QjtBQUM3RSxhQUFPO0FBQUE7QUFBQSxVQUdILGNBQWMsWUFBd0IsY0FBNEMsTUFBc0I7QUFDNUcsWUFBTSxpQkFBaUIsd0JBQVksZ0JBQWdCLEdBQUcsV0FBVyxRQUFNLElBQUksV0FBVyxXQUFTLEtBQUssV0FBVyxZQUFZLFdBQVcsTUFBTSxNQUFNLGtCQUFpQixTQUFTLFdBQVc7QUFDdkwsY0FBUSxJQUFJLG1CQUFtQjtBQUUvQixVQUFJLGFBQWEsTUFBTSxLQUFLLFNBQVMsY0FBYyxnQkFBZ0IsY0FBYztBQUNqRixjQUFRLElBQUk7QUFFWixhQUFPLFdBQVcsSUFBSSxhQUFXO0FBQUE7QUFBQTtBQUFBLFVBTTdCLGNBQWMsWUFBd0IsWUFBMkIsTUFBc0I7QUFDM0YsYUFBTztBQUFBO0FBQUEsVUFJSCxRQUFRLFNBQWtCLE1BQXdDO0FBQ3RFLFlBQU0sSUFBSSxNQUFNO0FBQUE7QUFBQTtBQWpEYjtBQUVFLEVBRkYsaUJBRUUsV0FBVzs7O0FER3BCLE1BQU0sU0FBaUI7QUFBQSxJQUNyQixXQUFXO0FBQUEsTUFDVDtBQUFBO0FBQUE7QUFJSixNQUFPLGtCQUFROyIsCiAgIm5hbWVzIjogW10KfQo=
