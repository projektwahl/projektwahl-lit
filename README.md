<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->

# projektwahl-lit

Software to manage choosing projects and automatically assigning people to projects.

## Requirements

- Node 16/17
- npm
- Postgresql database
- OpenID credentials (optional)

## Setup

```bash
git clone --branch openid https://github.com/projektwahl/projektwahl-lit.git
cd projektwahl-lit/
npm install
DATABASE_URL=postgres://projektwahl:projektwahl@projektwahl/projektwahl npm run setup
DATABASE_URL=postgres://projektwahl:projektwahl@projektwahl/projektwahl OPENID_URL=openid_url CLIENT_ID=client_id CLIENT_SECRET=secret npm run server
# https://localhost:8443/
```

## Firefox

`about:config`: `layout.css.constructable-stylesheets.enabled = true`
