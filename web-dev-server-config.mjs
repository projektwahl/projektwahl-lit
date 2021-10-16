// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { hmrPlugin, presets } from "@open-wc/dev-server-hmr";
import { esbuildPlugin } from "@web/dev-server-esbuild";
import proxy from "koa-proxies";

// https://github.com/open-wc/open-wc/issues/2327
// https://open-wc.org/docs/development/hot-module-replacement/
// https://modern-web.dev/docs/dev-server/cli-and-configuration/
export default {
  plugins: [
    esbuildPlugin({ ts: true, target: "auto" }),
    hmrPlugin({
      include: ["src/**/*"],
      presets: [presets.lit],
    }),
  ],
  mimeTypes: {
    "**/*.ts": "ts",
  },
  port: 9000,
  middleware: [
    proxy("/api", {
      target: "http://localhost:9001",
    }),
  ],
};
