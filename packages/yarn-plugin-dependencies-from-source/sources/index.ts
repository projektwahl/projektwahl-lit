import type {Plugin} from '@yarnpkg/core';
import {BaseCommand} from '@yarnpkg/cli';
import {Option} from 'clipanion';
import { MyCustomResolver } from './MyCustomResolver';

// https://github.com/yarnpkg/berry/tree/master/packages/plugin-git/sources

// https://yarnpkg.com/api/interfaces/yarnpkg_core.resolver.html
const plugin: Plugin = {
  resolvers: [
    MyCustomResolver
  ]
};

export default plugin;
