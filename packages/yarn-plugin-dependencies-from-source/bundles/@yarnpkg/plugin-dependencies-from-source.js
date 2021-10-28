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
      let candidates = await opts.resolver.getCandidates(nextDescriptor, dependencies, opts);
      return candidates.map((locator) => {
        if (locator.scope === "open-wc" && locator.name == "dev-server-hmr" && locator.reference === "npm:0.1.2") {
          return import_core.structUtils.parseLocator("git@github.com:open-wc/open-wc.git#workspace=packages/dev-server-hmr&tag=@open-wc/dev-server-hmr@0.1.2-next.0", true);
        }
        return locator;
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsicG5wOi9ob21lL21vcml0ei9Eb2N1bWVudHMvcHJvamVrdHdhaGwtbGl0L3BhY2thZ2VzL3lhcm4tcGx1Z2luLWRlcGVuZGVuY2llcy1mcm9tLXNvdXJjZS9zb3VyY2VzL2luZGV4LnRzIiwgInBucDovaG9tZS9tb3JpdHovRG9jdW1lbnRzL3Byb2pla3R3YWhsLWxpdC9wYWNrYWdlcy95YXJuLXBsdWdpbi1kZXBlbmRlbmNpZXMtZnJvbS1zb3VyY2Uvc291cmNlcy9NeUN1c3RvbVJlc29sdmVyLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgdHlwZSB7UGx1Z2lufSBmcm9tICdAeWFybnBrZy9jb3JlJztcbmltcG9ydCB7QmFzZUNvbW1hbmR9IGZyb20gJ0B5YXJucGtnL2NsaSc7XG5pbXBvcnQge09wdGlvbn0gZnJvbSAnY2xpcGFuaW9uJztcbmltcG9ydCB7IE15Q3VzdG9tUmVzb2x2ZXIgfSBmcm9tICcuL015Q3VzdG9tUmVzb2x2ZXInO1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20veWFybnBrZy9iZXJyeS90cmVlL21hc3Rlci9wYWNrYWdlcy9wbHVnaW4tZ2l0L3NvdXJjZXNcblxuLy8gaHR0cHM6Ly95YXJucGtnLmNvbS9hcGkvaW50ZXJmYWNlcy95YXJucGtnX2NvcmUucmVzb2x2ZXIuaHRtbFxuY29uc3QgcGx1Z2luOiBQbHVnaW4gPSB7XG4gIHJlc29sdmVyczogW1xuICAgIE15Q3VzdG9tUmVzb2x2ZXJcbiAgXVxufTtcblxuZXhwb3J0IGRlZmF1bHQgcGx1Z2luO1xuIiwgImltcG9ydCB7RGVzY3JpcHRvciwgTG9jYXRvciwgUmVzb2x2ZXIsIFJlc29sdmVPcHRpb25zLCBNaW5pbWFsUmVzb2x2ZU9wdGlvbnMsIFBhY2thZ2UsIERlc2NyaXB0b3JIYXNoLCBzdHJ1Y3RVdGlscywgfSBmcm9tICdAeWFybnBrZy9jb3JlJztcbmltcG9ydCB7IE5wbVNlbXZlclJlc29sdmVyIH0gZnJvbSAnQHlhcm5wa2cvcGx1Z2luLW5wbS9saWIvTnBtU2VtdmVyUmVzb2x2ZXInXG5cbmV4cG9ydCBjbGFzcyBNeUN1c3RvbVJlc29sdmVyIGltcGxlbWVudHMgUmVzb2x2ZXIge1xuXG4gIHN0YXRpYyBQUk9UT0NPTCA9IFwiY3VzdG9tOlwiO1xuXG4gIHN1cHBvcnRzRGVzY3JpcHRvcihkZXNjcmlwdG9yOiBEZXNjcmlwdG9yLCBvcHRzOiBNaW5pbWFsUmVzb2x2ZU9wdGlvbnMpIHtcbiAgICAvL2NvbnNvbGUubG9nKFwiZGVzY3JpcHRvclwiKVxuICAgIC8vY29uc29sZS5sb2coZGVzY3JpcHRvcilcblxuICAgIHJldHVybiBkZXNjcmlwdG9yLnJhbmdlLnN0YXJ0c1dpdGgoTXlDdXN0b21SZXNvbHZlci5QUk9UT0NPTClcbiAgfVxuXG4gIC8vIGluIHRoZSBvcHRpbWFsIGNhc2Ugd2UgcmVzb2x2ZSB0byBsb2NhdG9ycyBvZiBvdGhlciByZXNvbHZlcnNcbiAgc3VwcG9ydHNMb2NhdG9yKGxvY2F0b3I6IExvY2F0b3IsIG9wdHM6IE1pbmltYWxSZXNvbHZlT3B0aW9ucykge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiBzaG91bGRQZXJzaXN0UmVzb2x1dGlvbihsb2NhdG9yOiBMb2NhdG9yLCBvcHRzOiBNaW5pbWFsUmVzb2x2ZU9wdGlvbnMpIHtcbiAgICByZXR1cm4gZmFsc2U7IC8vIGZvciB0ZXN0aW5nXG4gIH1cbiBcbiAgLy8gc2hvdWxkIGJlIGdvb2RcbiAgYmluZERlc2NyaXB0b3IoZGVzY3JpcHRvcjogRGVzY3JpcHRvciwgZnJvbUxvY2F0b3I6IExvY2F0b3IsIG9wdHM6IE1pbmltYWxSZXNvbHZlT3B0aW9ucykge1xuICAgIHJldHVybiBkZXNjcmlwdG9yO1xuICB9XG5cbiAgLy8gc2hvdWxkIGJlIGdvb2RcbiAgZ2V0UmVzb2x1dGlvbkRlcGVuZGVuY2llcyhkZXNjcmlwdG9yOiBEZXNjcmlwdG9yLCBvcHRzOiBNaW5pbWFsUmVzb2x2ZU9wdGlvbnMpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBhc3luYyBnZXRDYW5kaWRhdGVzKGRlc2NyaXB0b3I6IERlc2NyaXB0b3IsIGRlcGVuZGVuY2llczogTWFwPERlc2NyaXB0b3JIYXNoLCBQYWNrYWdlPiwgb3B0czogUmVzb2x2ZU9wdGlvbnMpIHtcbiAgICBjb25zdCBuZXh0RGVzY3JpcHRvciA9IHN0cnVjdFV0aWxzLnBhcnNlRGVzY3JpcHRvcihgJHtkZXNjcmlwdG9yLnNjb3BlP2BAJHtkZXNjcmlwdG9yLnNjb3BlfS9gOlwiXCJ9JHtkZXNjcmlwdG9yLm5hbWV9QG5wbToke2Rlc2NyaXB0b3IucmFuZ2Uuc2xpY2UoTXlDdXN0b21SZXNvbHZlci5QUk9UT0NPTC5sZW5ndGgpfWAsIHRydWUpO1xuICAgIC8vY29uc29sZS5sb2coXCJuZXh0ZGVzY3JpcHRvcjpcIiwgbmV4dERlc2NyaXB0b3IpXG5cbiAgICBsZXQgY2FuZGlkYXRlcyA9IGF3YWl0IG9wdHMucmVzb2x2ZXIuZ2V0Q2FuZGlkYXRlcyhuZXh0RGVzY3JpcHRvciwgZGVwZW5kZW5jaWVzLCBvcHRzKTtcbiAgICAvL2NvbnNvbGUubG9nKGNhbmRpZGF0ZXMpXG5cbiAgICAvLyBodHRwczovL3lhcm5wa2cuY29tL2ZlYXR1cmVzL3Byb3RvY29sc1xuICAgIHJldHVybiBjYW5kaWRhdGVzLm1hcChsb2NhdG9yID0+IHtcbiAgICAgIGlmIChsb2NhdG9yLnNjb3BlID09PSBcIm9wZW4td2NcIiAmJiBsb2NhdG9yLm5hbWUgPT0gXCJkZXYtc2VydmVyLWhtclwiICYmIGxvY2F0b3IucmVmZXJlbmNlID09PSBcIm5wbTowLjEuMlwiKSB7XG4gICAgICAgIHJldHVybiBzdHJ1Y3RVdGlscy5wYXJzZUxvY2F0b3IoXCJnaXRAZ2l0aHViLmNvbTpvcGVuLXdjL29wZW4td2MuZ2l0I3dvcmtzcGFjZT1wYWNrYWdlcy9kZXYtc2VydmVyLWhtciZ0YWc9QG9wZW4td2MvZGV2LXNlcnZlci1obXJAMC4xLjItbmV4dC4wXCIsIHRydWUpXG4gICAgICB9XG4gICAgICByZXR1cm4gbG9jYXRvclxuICAgIH0pXG4gIH1cblxuICAvLyBzaG91bGQgYmUgZ29vZFxuICBhc3luYyBnZXRTYXRpc2Z5aW5nKGRlc2NyaXB0b3I6IERlc2NyaXB0b3IsIHJlZmVyZW5jZXM6IEFycmF5PHN0cmluZz4sIG9wdHM6IFJlc29sdmVPcHRpb25zKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBzaG91bGQgYmUgZ29vZFxuICBhc3luYyByZXNvbHZlKGxvY2F0b3I6IExvY2F0b3IsIG9wdHM6IFJlc29sdmVPcHRpb25zKTogUHJvbWlzZTxQYWNrYWdlPiB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwibm90IHN1cHBvcnRlZFwiKTtcbiAgfVxufSJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ0FBLG9CQUEySDtBQUdwSCxnQ0FBMkM7QUFBQSxJQUloRCxtQkFBbUIsWUFBd0IsTUFBNkI7QUFJdEUsYUFBTyxXQUFXLE1BQU0sV0FBVyxrQkFBaUI7QUFBQTtBQUFBLElBSXRELGdCQUFnQixTQUFrQixNQUE2QjtBQUM3RCxhQUFPO0FBQUE7QUFBQSxJQUdWLHdCQUF3QixTQUFrQixNQUE2QjtBQUNwRSxhQUFPO0FBQUE7QUFBQSxJQUlULGVBQWUsWUFBd0IsYUFBc0IsTUFBNkI7QUFDeEYsYUFBTztBQUFBO0FBQUEsSUFJVCwwQkFBMEIsWUFBd0IsTUFBNkI7QUFDN0UsYUFBTztBQUFBO0FBQUEsVUFHSCxjQUFjLFlBQXdCLGNBQTRDLE1BQXNCO0FBQzVHLFlBQU0saUJBQWlCLHdCQUFZLGdCQUFnQixHQUFHLFdBQVcsUUFBTSxJQUFJLFdBQVcsV0FBUyxLQUFLLFdBQVcsWUFBWSxXQUFXLE1BQU0sTUFBTSxrQkFBaUIsU0FBUyxXQUFXO0FBR3ZMLFVBQUksYUFBYSxNQUFNLEtBQUssU0FBUyxjQUFjLGdCQUFnQixjQUFjO0FBSWpGLGFBQU8sV0FBVyxJQUFJLGFBQVc7QUFDL0IsWUFBSSxRQUFRLFVBQVUsYUFBYSxRQUFRLFFBQVEsb0JBQW9CLFFBQVEsY0FBYyxhQUFhO0FBQ3hHLGlCQUFPLHdCQUFZLGFBQWEsaUhBQWlIO0FBQUE7QUFFbkosZUFBTztBQUFBO0FBQUE7QUFBQSxVQUtMLGNBQWMsWUFBd0IsWUFBMkIsTUFBc0I7QUFDM0YsYUFBTztBQUFBO0FBQUEsVUFJSCxRQUFRLFNBQWtCLE1BQXdDO0FBQ3RFLFlBQU0sSUFBSSxNQUFNO0FBQUE7QUFBQTtBQXJEYjtBQUVFLEVBRkYsaUJBRUUsV0FBVzs7O0FER3BCLE1BQU0sU0FBaUI7QUFBQSxJQUNyQixXQUFXO0FBQUEsTUFDVDtBQUFBO0FBQUE7QUFJSixNQUFPLGtCQUFROyIsCiAgIm5hbWVzIjogW10KfQo=
