import {Descriptor, Locator, Resolver, ResolveOptions, MinimalResolveOptions, Package, DescriptorHash, structUtils, } from '@yarnpkg/core';
import { NpmSemverResolver } from '@yarnpkg/plugin-npm/lib/NpmSemverResolver'

export class MyCustomResolver implements Resolver {

  static PROTOCOL = "custom:";

  supportsDescriptor(descriptor: Descriptor, opts: MinimalResolveOptions) {
    console.log("descriptor")
    console.log(descriptor)

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
    console.log("nextdescriptor:", nextDescriptor)

    let candidates = await opts.resolver.getCandidates(nextDescriptor, dependencies, opts);
    console.log(candidates)

    return candidates.map(locator => {
      if () {

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