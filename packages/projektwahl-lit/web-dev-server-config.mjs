// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { hmrPlugin, presets } from "@open-wc/dev-server-hmr";
import proxy from "koa-proxies";
import { startDevServer } from "@web/dev-server";

// https://github.com/open-wc/open-wc/issues/2327
// https://open-wc.org/docs/development/hot-module-replacement/
// https://modern-web.dev/docs/dev-server/cli-and-configuration/

async function main() {
  const server = await startDevServer({
    config: {
      nodeResolve: true,
      appIndex: "index.html",
      plugins: [
        hmrPlugin({
          include: ["src/**/*"],
          presets: [presets.lit],
        }),
      ],
      port: 9000,
      middleware: [
        proxy("/api", {
          target: "http://localhost:9001",
        }),
      ],
    },
  });
}

main();
