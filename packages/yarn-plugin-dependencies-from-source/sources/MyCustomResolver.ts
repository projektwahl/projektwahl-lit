import {Descriptor, Locator, Resolver, ResolveOptions, MinimalResolveOptions, Package, DescriptorHash, structUtils, } from '@yarnpkg/core';

export class MyCustomResolver implements Resolver {

  static PROTOCOL = "custom:";

  supportsDescriptor(descriptor: Descriptor, opts: MinimalResolveOptions) {
    //console.log("descriptor")
    //console.log(descriptor)

    return descriptor.range.startsWith(MyCustomResolver.PROTOCOL)
  }

  // in the optimal case we resolve to locators of other resolvers
  supportsLocator(locator: Locator, opts: MinimalResolveOptions) {
    return false
  }

 shouldPersistResolution(locator: Locator, opts: MinimalResolveOptions) {
    return false; // for testing
  }
 
  // should be good
  bindDescriptor(descriptor: Descriptor, fromLocator: Locator, opts: MinimalResolveOptions) {
    return descriptor;
  }

  // should be good
  getResolutionDependencies(descriptor: Descriptor, opts: MinimalResolveOptions) {
    return [];
  }

  async getCandidates(descriptor: Descriptor, dependencies: Map<DescriptorHash, Package>, opts: ResolveOptions) {
    const nextDescriptor = structUtils.parseDescriptor(`${descriptor.scope?`@${descriptor.scope}/`:""}${descriptor.name}@npm:${descriptor.range.slice(MyCustomResolver.PROTOCOL.length)}`, true);
    //console.log("nextdescriptor:", nextDescriptor)

    let candidates = await opts.resolver.getCandidates(nextDescriptor, dependencies, opts);
    //console.log(candidates)

    // https://yarnpkg.com/features/protocols
    // yarn workspaces info - yarn classis seems to name workspaces differently
    return candidates.map(locator => {
      if (locator.scope === "open-wc" && locator.name == "dev-server-hmr" && locator.reference === "npm:0.1.2") {
        //return structUtils.parseLocator("git@github.com:open-wc/open-wc.git#workspace=@open-wc/dev-server-hmr&tag=@open-wc/dev-server-hmr@0.1.2-next.0", true)

        // https://github.com/yarnpkg/berry/blob/554257087edb4a103633e808253323fb9a21250d/packages/plugin-git/sources/GitResolver.ts#L30
        // it wants a locked version

        return structUtils.makeLocator(structUtils.convertToIdent(locator), "git@github.com:open-wc/open-wc.git#workspace=%40open-wc%2Fdev-server-hmr&commit=e99947128fdda2411387a171de74519331c0e8e8")
      }
      return locator
    })
  }

  // should be good
  async getSatisfying(descriptor: Descriptor, references: Array<string>, opts: ResolveOptions) {
    return null;
  }

  // should be good
  async resolve(locator: Locator, opts: ResolveOptions): Promise<Package> {
    throw new Error("not supported");
  }
}
