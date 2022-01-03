<!--
/*
projektwahl-lit is a software to manage choosing projects and automatically assigning people to projects.
Copyright (C) 2021 Moritz Hedtke

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see https://www.gnu.org/licenses/.
*/
/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
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
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout localhost-privkey.pem -out localhost-cert.pem # or use actual certificates
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

## Licenses of dependencies

```
npx license-checker --production --summary
```