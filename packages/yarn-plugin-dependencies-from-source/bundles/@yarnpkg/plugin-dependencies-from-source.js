/* eslint-disable */
//prettier-ignore
module.exports = {
name: "@yarnpkg/plugin-dependencies-from-source",
factory: function (require) {
var plugin = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {enumerable: true, configurable: true, writable: true, value}) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
  var import_core2 = __toModule(__require("@yarnpkg/core"));
  var import_core3 = __toModule(__require("@yarnpkg/core"));
  var MyCustomResolver = class {
    supportsDescriptor(descriptor, opts) {
      console.log("descriptor: " + descriptor + " opts: " + opts);
      return false;
    }
    supportsLocator(locator, opts) {
      console.log("locator: " + locator + " opts: " + opts);
      return false;
    }
    shouldPersistResolution(locator, opts) {
      return true;
    }
    bindDescriptor(descriptor, fromLocator, opts) {
      return descriptor;
    }
    getResolutionDependencies(descriptor, opts) {
      return [];
    }
    async getCandidates(descriptor, dependencies, opts) {
      return [import_core3.structUtils.convertDescriptorToLocator(descriptor)];
    }
    async getSatisfying(descriptor, references, opts) {
      return null;
    }
    async resolve(locator, opts) {
      if (!opts.fetchOptions)
        throw new Error(`Assertion failed: This resolver cannot be used unless a fetcher is configured`);
      const packageFetch = await opts.fetchOptions.fetcher.fetch(locator, opts.fetchOptions);
      const manifest = await import_core3.miscUtils.releaseAfterUseAsync(async () => {
        return await import_core.Manifest.find(packageFetch.prefixPath, {baseFs: packageFetch.packageFs});
      }, packageFetch.releaseFs);
      return __spreadProps(__spreadValues({}, locator), {
        version: manifest.version || `0.0.0`,
        languageName: manifest.languageName || opts.project.configuration.get(`defaultLanguageName`),
        linkType: import_core2.LinkType.HARD,
        conditions: manifest.getConditions(),
        dependencies: manifest.dependencies,
        peerDependencies: manifest.peerDependencies,
        dependenciesMeta: manifest.dependenciesMeta,
        peerDependenciesMeta: manifest.peerDependenciesMeta,
        bin: manifest.bin
      });
    }
  };

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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsicG5wOi9ob21lL21vcml0ei9Eb2N1bWVudHMvcHJvamVrdHdhaGwtbGl0L3BhY2thZ2VzL3lhcm4tcGx1Z2luLWRlcGVuZGVuY2llcy1mcm9tLXNvdXJjZS9zb3VyY2VzL2luZGV4LnRzIiwgInBucDovaG9tZS9tb3JpdHovRG9jdW1lbnRzL3Byb2pla3R3YWhsLWxpdC9wYWNrYWdlcy95YXJuLXBsdWdpbi1kZXBlbmRlbmNpZXMtZnJvbS1zb3VyY2Uvc291cmNlcy9NeUN1c3RvbVJlc29sdmVyLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgdHlwZSB7UGx1Z2lufSBmcm9tICdAeWFybnBrZy9jb3JlJztcbmltcG9ydCB7QmFzZUNvbW1hbmR9IGZyb20gJ0B5YXJucGtnL2NsaSc7XG5pbXBvcnQge09wdGlvbn0gZnJvbSAnY2xpcGFuaW9uJztcbmltcG9ydCB7IE15Q3VzdG9tUmVzb2x2ZXIgfSBmcm9tICcuL015Q3VzdG9tUmVzb2x2ZXInO1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20veWFybnBrZy9iZXJyeS90cmVlL21hc3Rlci9wYWNrYWdlcy9wbHVnaW4tZ2l0L3NvdXJjZXNcblxuXG5jb25zdCBwbHVnaW46IFBsdWdpbiA9IHtcbiAgcmVzb2x2ZXJzOiBbXG4gICAgTXlDdXN0b21SZXNvbHZlclxuICBdXG59O1xuXG5leHBvcnQgZGVmYXVsdCBwbHVnaW47XG4iLCAiaW1wb3J0IHtSZXNvbHZlciwgUmVzb2x2ZU9wdGlvbnMsIE1pbmltYWxSZXNvbHZlT3B0aW9uc30gZnJvbSAnQHlhcm5wa2cvY29yZSc7XG5pbXBvcnQge0Rlc2NyaXB0b3IsIExvY2F0b3IsIE1hbmlmZXN0fSAgICAgICAgICAgICAgICAgICBmcm9tICdAeWFybnBrZy9jb3JlJztcbmltcG9ydCB7TGlua1R5cGV9ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gJ0B5YXJucGtnL2NvcmUnO1xuaW1wb3J0IHttaXNjVXRpbHMsIHN0cnVjdFV0aWxzfSAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbSAnQHlhcm5wa2cvY29yZSc7XG5cblxuZXhwb3J0IGNsYXNzIE15Q3VzdG9tUmVzb2x2ZXIgaW1wbGVtZW50cyBSZXNvbHZlciB7XG4gIHN1cHBvcnRzRGVzY3JpcHRvcihkZXNjcmlwdG9yOiBEZXNjcmlwdG9yLCBvcHRzOiBNaW5pbWFsUmVzb2x2ZU9wdGlvbnMpIHtcbiAgICBjb25zb2xlLmxvZyhcImRlc2NyaXB0b3I6IFwiICsgZGVzY3JpcHRvciArIFwiIG9wdHM6IFwiICsgb3B0cylcbiAgICAvKmlmICghVEFSQkFMTF9SRUdFWFAudGVzdChkZXNjcmlwdG9yLnJhbmdlKSlcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIGlmIChQUk9UT0NPTF9SRUdFWFAudGVzdChkZXNjcmlwdG9yLnJhbmdlKSlcbiAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgcmV0dXJuIGZhbHNlOyovXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc3VwcG9ydHNMb2NhdG9yKGxvY2F0b3I6IExvY2F0b3IsIG9wdHM6IE1pbmltYWxSZXNvbHZlT3B0aW9ucykge1xuICAgIGNvbnNvbGUubG9nKFwibG9jYXRvcjogXCIgKyBsb2NhdG9yICsgXCIgb3B0czogXCIgKyBvcHRzKVxuXG5cbiAgICByZXR1cm4gZmFsc2U7XG4gICAgICAvKlxuICAgIGlmICghVEFSQkFMTF9SRUdFWFAudGVzdChsb2NhdG9yLnJlZmVyZW5jZSkpXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBpZiAoUFJPVE9DT0xfUkVHRVhQLnRlc3QobG9jYXRvci5yZWZlcmVuY2UpKVxuICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICByZXR1cm4gZmFsc2U7Ki9cbiAgfVxuXG4gIHNob3VsZFBlcnNpc3RSZXNvbHV0aW9uKGxvY2F0b3I6IExvY2F0b3IsIG9wdHM6IE1pbmltYWxSZXNvbHZlT3B0aW9ucykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgYmluZERlc2NyaXB0b3IoZGVzY3JpcHRvcjogRGVzY3JpcHRvciwgZnJvbUxvY2F0b3I6IExvY2F0b3IsIG9wdHM6IE1pbmltYWxSZXNvbHZlT3B0aW9ucykge1xuICAgIHJldHVybiBkZXNjcmlwdG9yO1xuICB9XG5cbiAgZ2V0UmVzb2x1dGlvbkRlcGVuZGVuY2llcyhkZXNjcmlwdG9yOiBEZXNjcmlwdG9yLCBvcHRzOiBNaW5pbWFsUmVzb2x2ZU9wdGlvbnMpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBhc3luYyBnZXRDYW5kaWRhdGVzKGRlc2NyaXB0b3I6IERlc2NyaXB0b3IsIGRlcGVuZGVuY2llczogdW5rbm93biwgb3B0czogUmVzb2x2ZU9wdGlvbnMpIHtcbiAgICByZXR1cm4gW3N0cnVjdFV0aWxzLmNvbnZlcnREZXNjcmlwdG9yVG9Mb2NhdG9yKGRlc2NyaXB0b3IpXTtcbiAgfVxuXG4gIGFzeW5jIGdldFNhdGlzZnlpbmcoZGVzY3JpcHRvcjogRGVzY3JpcHRvciwgcmVmZXJlbmNlczogQXJyYXk8c3RyaW5nPiwgb3B0czogUmVzb2x2ZU9wdGlvbnMpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGFzeW5jIHJlc29sdmUobG9jYXRvcjogTG9jYXRvciwgb3B0czogUmVzb2x2ZU9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdHMuZmV0Y2hPcHRpb25zKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBBc3NlcnRpb24gZmFpbGVkOiBUaGlzIHJlc29sdmVyIGNhbm5vdCBiZSB1c2VkIHVubGVzcyBhIGZldGNoZXIgaXMgY29uZmlndXJlZGApO1xuXG4gICAgY29uc3QgcGFja2FnZUZldGNoID0gYXdhaXQgb3B0cy5mZXRjaE9wdGlvbnMuZmV0Y2hlci5mZXRjaChsb2NhdG9yLCBvcHRzLmZldGNoT3B0aW9ucyk7XG5cbiAgICBjb25zdCBtYW5pZmVzdCA9IGF3YWl0IG1pc2NVdGlscy5yZWxlYXNlQWZ0ZXJVc2VBc3luYyhhc3luYyAoKSA9PiB7XG4gICAgICByZXR1cm4gYXdhaXQgTWFuaWZlc3QuZmluZChwYWNrYWdlRmV0Y2gucHJlZml4UGF0aCwge2Jhc2VGczogcGFja2FnZUZldGNoLnBhY2thZ2VGc30pO1xuICAgIH0sIHBhY2thZ2VGZXRjaC5yZWxlYXNlRnMpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmxvY2F0b3IsXG5cbiAgICAgIHZlcnNpb246IG1hbmlmZXN0LnZlcnNpb24gfHwgYDAuMC4wYCxcblxuICAgICAgbGFuZ3VhZ2VOYW1lOiBtYW5pZmVzdC5sYW5ndWFnZU5hbWUgfHwgb3B0cy5wcm9qZWN0LmNvbmZpZ3VyYXRpb24uZ2V0KGBkZWZhdWx0TGFuZ3VhZ2VOYW1lYCksXG4gICAgICBsaW5rVHlwZTogTGlua1R5cGUuSEFSRCxcblxuICAgICAgY29uZGl0aW9uczogbWFuaWZlc3QuZ2V0Q29uZGl0aW9ucygpLFxuXG4gICAgICBkZXBlbmRlbmNpZXM6IG1hbmlmZXN0LmRlcGVuZGVuY2llcyxcbiAgICAgIHBlZXJEZXBlbmRlbmNpZXM6IG1hbmlmZXN0LnBlZXJEZXBlbmRlbmNpZXMsXG5cbiAgICAgIGRlcGVuZGVuY2llc01ldGE6IG1hbmlmZXN0LmRlcGVuZGVuY2llc01ldGEsXG4gICAgICBwZWVyRGVwZW5kZW5jaWVzTWV0YTogbWFuaWZlc3QucGVlckRlcGVuZGVuY2llc01ldGEsXG5cbiAgICAgIGJpbjogbWFuaWZlc3QuYmluLFxuICAgIH07XG4gIH1cbn0iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ0NBLG9CQUE4RDtBQUM5RCxxQkFBOEQ7QUFDOUQscUJBQThEO0FBR3ZELCtCQUEyQztBQUFBLElBQ2hELG1CQUFtQixZQUF3QixNQUE2QjtBQUN0RSxjQUFRLElBQUksaUJBQWlCLGFBQWEsWUFBWTtBQVF0RCxhQUFPO0FBQUE7QUFBQSxJQUdULGdCQUFnQixTQUFrQixNQUE2QjtBQUM3RCxjQUFRLElBQUksY0FBYyxVQUFVLFlBQVk7QUFHaEQsYUFBTztBQUFBO0FBQUEsSUFXVCx3QkFBd0IsU0FBa0IsTUFBNkI7QUFDckUsYUFBTztBQUFBO0FBQUEsSUFHVCxlQUFlLFlBQXdCLGFBQXNCLE1BQTZCO0FBQ3hGLGFBQU87QUFBQTtBQUFBLElBR1QsMEJBQTBCLFlBQXdCLE1BQTZCO0FBQzdFLGFBQU87QUFBQTtBQUFBLFVBR0gsY0FBYyxZQUF3QixjQUF1QixNQUFzQjtBQUN2RixhQUFPLENBQUMseUJBQVksMkJBQTJCO0FBQUE7QUFBQSxVQUczQyxjQUFjLFlBQXdCLFlBQTJCLE1BQXNCO0FBQzNGLGFBQU87QUFBQTtBQUFBLFVBR0gsUUFBUSxTQUFrQixNQUFzQjtBQUNwRCxVQUFJLENBQUMsS0FBSztBQUNSLGNBQU0sSUFBSSxNQUFNO0FBRWxCLFlBQU0sZUFBZSxNQUFNLEtBQUssYUFBYSxRQUFRLE1BQU0sU0FBUyxLQUFLO0FBRXpFLFlBQU0sV0FBVyxNQUFNLHVCQUFVLHFCQUFxQixZQUFZO0FBQ2hFLGVBQU8sTUFBTSxxQkFBUyxLQUFLLGFBQWEsWUFBWSxDQUFDLFFBQVEsYUFBYTtBQUFBLFNBQ3pFLGFBQWE7QUFFaEIsYUFBTyxpQ0FDRixVQURFO0FBQUEsUUFHTCxTQUFTLFNBQVMsV0FBVztBQUFBLFFBRTdCLGNBQWMsU0FBUyxnQkFBZ0IsS0FBSyxRQUFRLGNBQWMsSUFBSTtBQUFBLFFBQ3RFLFVBQVUsc0JBQVM7QUFBQSxRQUVuQixZQUFZLFNBQVM7QUFBQSxRQUVyQixjQUFjLFNBQVM7QUFBQSxRQUN2QixrQkFBa0IsU0FBUztBQUFBLFFBRTNCLGtCQUFrQixTQUFTO0FBQUEsUUFDM0Isc0JBQXNCLFNBQVM7QUFBQSxRQUUvQixLQUFLLFNBQVM7QUFBQTtBQUFBO0FBQUE7OztBRHhFcEIsTUFBTSxTQUFpQjtBQUFBLElBQ3JCLFdBQVc7QUFBQSxNQUNUO0FBQUE7QUFBQTtBQUlKLE1BQU8sa0JBQVE7IiwKICAibmFtZXMiOiBbXQp9Cg==
