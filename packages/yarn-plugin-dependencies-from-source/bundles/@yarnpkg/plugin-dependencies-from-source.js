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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsicG5wOi9ob21lL21vcml0ei9Eb2N1bWVudHMvcHJvamVrdHdhaGwtbGl0L3BhY2thZ2VzL3lhcm4tcGx1Z2luLWRlcGVuZGVuY2llcy1mcm9tLXNvdXJjZS9zb3VyY2VzL2luZGV4LnRzIiwgInBucDovaG9tZS9tb3JpdHovRG9jdW1lbnRzL3Byb2pla3R3YWhsLWxpdC9wYWNrYWdlcy95YXJuLXBsdWdpbi1kZXBlbmRlbmNpZXMtZnJvbS1zb3VyY2Uvc291cmNlcy9NeUN1c3RvbVJlc29sdmVyLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgdHlwZSB7UGx1Z2lufSBmcm9tICdAeWFybnBrZy9jb3JlJztcbmltcG9ydCB7QmFzZUNvbW1hbmR9IGZyb20gJ0B5YXJucGtnL2NsaSc7XG5pbXBvcnQge09wdGlvbn0gZnJvbSAnY2xpcGFuaW9uJztcbmltcG9ydCB7IE15Q3VzdG9tUmVzb2x2ZXIgfSBmcm9tICcuL015Q3VzdG9tUmVzb2x2ZXInO1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20veWFybnBrZy9iZXJyeS90cmVlL21hc3Rlci9wYWNrYWdlcy9wbHVnaW4tZ2l0L3NvdXJjZXNcblxuLy8gaHR0cHM6Ly95YXJucGtnLmNvbS9hcGkvaW50ZXJmYWNlcy95YXJucGtnX2NvcmUucmVzb2x2ZXIuaHRtbFxuY29uc3QgcGx1Z2luOiBQbHVnaW4gPSB7XG4gIHJlc29sdmVyczogW1xuICAgIE15Q3VzdG9tUmVzb2x2ZXJcbiAgXVxufTtcblxuZXhwb3J0IGRlZmF1bHQgcGx1Z2luO1xuIiwgImltcG9ydCB7RGVzY3JpcHRvciwgTG9jYXRvciwgUmVzb2x2ZXIsIFJlc29sdmVPcHRpb25zLCBNaW5pbWFsUmVzb2x2ZU9wdGlvbnMsIFBhY2thZ2UsIERlc2NyaXB0b3JIYXNoLCBzdHJ1Y3RVdGlscywgfSBmcm9tICdAeWFybnBrZy9jb3JlJztcbmltcG9ydCB7IE5wbVNlbXZlclJlc29sdmVyIH0gZnJvbSAnQHlhcm5wa2cvcGx1Z2luLW5wbS9saWIvTnBtU2VtdmVyUmVzb2x2ZXInXG5cbmV4cG9ydCBjbGFzcyBNeUN1c3RvbVJlc29sdmVyIGltcGxlbWVudHMgUmVzb2x2ZXIge1xuXG4gIHN0YXRpYyBQUk9UT0NPTCA9IFwiY3VzdG9tOlwiO1xuXG4gIHN1cHBvcnRzRGVzY3JpcHRvcihkZXNjcmlwdG9yOiBEZXNjcmlwdG9yLCBvcHRzOiBNaW5pbWFsUmVzb2x2ZU9wdGlvbnMpIHtcbiAgICAvL2NvbnNvbGUubG9nKFwiZGVzY3JpcHRvclwiKVxuICAgIC8vY29uc29sZS5sb2coZGVzY3JpcHRvcilcblxuICAgIHJldHVybiBkZXNjcmlwdG9yLnJhbmdlLnN0YXJ0c1dpdGgoTXlDdXN0b21SZXNvbHZlci5QUk9UT0NPTClcbiAgfVxuXG4gIC8vIGluIHRoZSBvcHRpbWFsIGNhc2Ugd2UgcmVzb2x2ZSB0byBsb2NhdG9ycyBvZiBvdGhlciByZXNvbHZlcnNcbiAgc3VwcG9ydHNMb2NhdG9yKGxvY2F0b3I6IExvY2F0b3IsIG9wdHM6IE1pbmltYWxSZXNvbHZlT3B0aW9ucykge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiBzaG91bGRQZXJzaXN0UmVzb2x1dGlvbihsb2NhdG9yOiBMb2NhdG9yLCBvcHRzOiBNaW5pbWFsUmVzb2x2ZU9wdGlvbnMpIHtcbiAgICByZXR1cm4gZmFsc2U7IC8vIGZvciB0ZXN0aW5nXG4gIH1cbiBcbiAgLy8gc2hvdWxkIGJlIGdvb2RcbiAgYmluZERlc2NyaXB0b3IoZGVzY3JpcHRvcjogRGVzY3JpcHRvciwgZnJvbUxvY2F0b3I6IExvY2F0b3IsIG9wdHM6IE1pbmltYWxSZXNvbHZlT3B0aW9ucykge1xuICAgIHJldHVybiBkZXNjcmlwdG9yO1xuICB9XG5cbiAgLy8gc2hvdWxkIGJlIGdvb2RcbiAgZ2V0UmVzb2x1dGlvbkRlcGVuZGVuY2llcyhkZXNjcmlwdG9yOiBEZXNjcmlwdG9yLCBvcHRzOiBNaW5pbWFsUmVzb2x2ZU9wdGlvbnMpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBhc3luYyBnZXRDYW5kaWRhdGVzKGRlc2NyaXB0b3I6IERlc2NyaXB0b3IsIGRlcGVuZGVuY2llczogTWFwPERlc2NyaXB0b3JIYXNoLCBQYWNrYWdlPiwgb3B0czogUmVzb2x2ZU9wdGlvbnMpIHtcbiAgICBjb25zdCBuZXh0RGVzY3JpcHRvciA9IHN0cnVjdFV0aWxzLnBhcnNlRGVzY3JpcHRvcihgJHtkZXNjcmlwdG9yLnNjb3BlP2BAJHtkZXNjcmlwdG9yLnNjb3BlfS9gOlwiXCJ9JHtkZXNjcmlwdG9yLm5hbWV9QG5wbToke2Rlc2NyaXB0b3IucmFuZ2Uuc2xpY2UoTXlDdXN0b21SZXNvbHZlci5QUk9UT0NPTC5sZW5ndGgpfWAsIHRydWUpO1xuICAgIC8vY29uc29sZS5sb2coXCJuZXh0ZGVzY3JpcHRvcjpcIiwgbmV4dERlc2NyaXB0b3IpXG5cbiAgICBsZXQgY2FuZGlkYXRlcyA9IGF3YWl0IG9wdHMucmVzb2x2ZXIuZ2V0Q2FuZGlkYXRlcyhuZXh0RGVzY3JpcHRvciwgZGVwZW5kZW5jaWVzLCBvcHRzKTtcbiAgICAvL2NvbnNvbGUubG9nKGNhbmRpZGF0ZXMpXG5cbiAgICAvLyBodHRwczovL3lhcm5wa2cuY29tL2ZlYXR1cmVzL3Byb3RvY29sc1xuICAgIHJldHVybiBjYW5kaWRhdGVzLm1hcChsb2NhdG9yID0+IHtcbiAgICAgIGlmIChsb2NhdG9yLnNjb3BlID09PSBcIm9wZW4td2NcIiAmJiBsb2NhdG9yLm5hbWUgPT0gXCJkZXYtc2VydmVyLWhtclwiICYmIGxvY2F0b3IucmVmZXJlbmNlID09PSBcIm5wbTowLjEuMlwiKSB7XG4gICAgICAgIC8vcmV0dXJuIHN0cnVjdFV0aWxzLnBhcnNlTG9jYXRvcihcImdpdEBnaXRodWIuY29tOnlhcm5wa2cvYmVycnkuZ2l0I3dvcmtzcGFjZT1AeWFybnBrZy9zaGVsbCZ0YWc9QHlhcm5wa2cvc2hlbGwvMi4xLjBcIiwgdHJ1ZSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBsb2NhdG9yXG4gICAgfSlcbiAgfVxuXG4gIC8vIHNob3VsZCBiZSBnb29kXG4gIGFzeW5jIGdldFNhdGlzZnlpbmcoZGVzY3JpcHRvcjogRGVzY3JpcHRvciwgcmVmZXJlbmNlczogQXJyYXk8c3RyaW5nPiwgb3B0czogUmVzb2x2ZU9wdGlvbnMpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIHNob3VsZCBiZSBnb29kXG4gIGFzeW5jIHJlc29sdmUobG9jYXRvcjogTG9jYXRvciwgb3B0czogUmVzb2x2ZU9wdGlvbnMpOiBQcm9taXNlPFBhY2thZ2U+IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJub3Qgc3VwcG9ydGVkXCIpO1xuICB9XG59Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDQUEsb0JBQTJIO0FBR3BILGdDQUEyQztBQUFBLElBSWhELG1CQUFtQixZQUF3QixNQUE2QjtBQUl0RSxhQUFPLFdBQVcsTUFBTSxXQUFXLGtCQUFpQjtBQUFBO0FBQUEsSUFJdEQsZ0JBQWdCLFNBQWtCLE1BQTZCO0FBQzdELGFBQU87QUFBQTtBQUFBLElBR1Ysd0JBQXdCLFNBQWtCLE1BQTZCO0FBQ3BFLGFBQU87QUFBQTtBQUFBLElBSVQsZUFBZSxZQUF3QixhQUFzQixNQUE2QjtBQUN4RixhQUFPO0FBQUE7QUFBQSxJQUlULDBCQUEwQixZQUF3QixNQUE2QjtBQUM3RSxhQUFPO0FBQUE7QUFBQSxVQUdILGNBQWMsWUFBd0IsY0FBNEMsTUFBc0I7QUFDNUcsWUFBTSxpQkFBaUIsd0JBQVksZ0JBQWdCLEdBQUcsV0FBVyxRQUFNLElBQUksV0FBVyxXQUFTLEtBQUssV0FBVyxZQUFZLFdBQVcsTUFBTSxNQUFNLGtCQUFpQixTQUFTLFdBQVc7QUFHdkwsVUFBSSxhQUFhLE1BQU0sS0FBSyxTQUFTLGNBQWMsZ0JBQWdCLGNBQWM7QUFJakYsYUFBTyxXQUFXLElBQUksYUFBVztBQUMvQixZQUFJLFFBQVEsVUFBVSxhQUFhLFFBQVEsUUFBUSxvQkFBb0IsUUFBUSxjQUFjLGFBQWE7QUFBQTtBQUcxRyxlQUFPO0FBQUE7QUFBQTtBQUFBLFVBS0wsY0FBYyxZQUF3QixZQUEyQixNQUFzQjtBQUMzRixhQUFPO0FBQUE7QUFBQSxVQUlILFFBQVEsU0FBa0IsTUFBd0M7QUFDdEUsWUFBTSxJQUFJLE1BQU07QUFBQTtBQUFBO0FBckRiO0FBRUUsRUFGRixpQkFFRSxXQUFXOzs7QURHcEIsTUFBTSxTQUFpQjtBQUFBLElBQ3JCLFdBQVc7QUFBQSxNQUNUO0FBQUE7QUFBQTtBQUlKLE1BQU8sa0JBQVE7IiwKICAibmFtZXMiOiBbXQp9Cg==
