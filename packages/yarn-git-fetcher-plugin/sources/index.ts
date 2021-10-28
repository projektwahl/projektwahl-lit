import {Plugin} from '@yarnpkg/core';

const plugin: Plugin {
    name: `plugin-hello-world`,
    factory: require => ({
      hooks: {
        setupScriptEnvironment(project, scriptEnv) {
          scriptEnv.HELLO_WORLD = `my first plugin!`;
        },
      },
    })
  };

  // https://github.com/yarnpkg/berry/tree/master/packages/plugin-exec

  // https://github.com/yarnpkg/berry/blob/master/packages/plugin-essentials/sources/commands/install.ts
  // https://github.com/yarnpkg/berry/blob/e95a1df42f6b94fc7a308af1b038e43c7278ac5a/packages/yarnpkg-core/sources/Project.ts#L1725
  // https://github.com/yarnpkg/berry/blob/e95a1df42f6b94fc7a308af1b038e43c7278ac5a/packages/yarnpkg-core/sources/Project.ts#L1440
  // https://github.com/yarnpkg/berry/blob/e95a1df42f6b94fc7a308af1b038e43c7278ac5a/packages/yarnpkg-core/sources/Project.ts#L644
  