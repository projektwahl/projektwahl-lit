<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->

# projektwahl-lit

Software to manage choosing projects and automatically assigning people to projects.

## Setup

```bash
git clone --branch openid https://github.com/projektwahl/projektwahl-lit.git
cd projektwahl-lit/
# you need nodejs 16 or 17
npm install
DATABASE_URL=postgres://projektwahl:projektwahl@projektwahl/projektwahl npm run setup
DATABASE_URL=postgres://projektwahl:projektwahl@projektwahl/projektwahl OPENID_URL=openid_url CLIENT_ID=client_id CLIENT_SECRET=secret npm run server
# https://localhost:8443/

```













## Notes

```bash
nix develop
npm ci
cd lit
npm ci
npm run bootstrap
npm run build
npx lerna link convert
cd packages/labs/task
npm link
cd ../../../..
npm link @lit-labs/task

# maybe npx lerna bootstrap --hoist also helps


npm run setup

UPDATE users SET openid_id = 'XjGZGMJqAWgiJYYhaEtpb1tNhJklPgwsXdIkLiiC0jA' WHERE username = 'admin';
```

https://docs.joshuatz.com/cheatsheets/js/jsdoc/

TODO use https://www.npmjs.com/package/@lit-labs/task
https://github.com/lit/lit/tree/main/packages/labs/task

https://github.com/lit/lit/tree/main/packages/labs/motion

https://github.com/lit/lit/blob/94dff0a4b74877a3de192eb32534c6237bb098a7/packages/labs/motion/demo/hero.html

## Firefox

`about:config`: `layout.css.constructable-stylesheets.enabled = true`
