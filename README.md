<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->

# projektwahl-lit

Software to manage choosing projects and automatically assigning people to projects.

This software is licensed under the GNU Affero General Public License v3.0 or any later version.

## Requirements

- Node 16/17
- npm
- Postgresql database
- OpenID credentials (optional)

## Setup

```bash
git clone https://github.com/projektwahl/projektwahl-lit.git
cd projektwahl-lit/
npm install
npx node-pre-gyp rebuild -C ./node_modules/argon2
npm run localize-build

DATABASE_URL=postgres://projektwahl:projektwahl@projektwahl/projektwahl npm run setup
DATABASE_URL=postgres://projektwahl:projektwahl@projektwahl/projektwahl OPENID_URL=openid_url CLIENT_ID=client_id CLIENT_SECRET=secret npm run server
# or
DATABASE_URL=postgres://projektwahl:projektwahl@projektwahl/projektwahl npm run server
# https://localhost:8443/
```

## Database access

```
psql --username=projektwahl --host=projektwahl
```

## Firefox

`about:config`: `layout.css.constructable-stylesheets.enabled = true`

## Security

See [SECURITY.md](SECURITY.md)

## Translation

<a href="https://weblate.selfmade4u.de/engage/projektwahl/">
<img src="https://weblate.selfmade4u.de/widgets/projektwahl/-/open-graph.png" alt="Translation status" />
</a>

## Browser support

This application will probably never work without JavaScript as this would require bad API design because forms are just terrible.
