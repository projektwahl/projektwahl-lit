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

- **Remove/Adapt https://github.com/projektwahl/projektwahl-lit/blob/main/src/client/routes/pw-privacy.ts and https://github.com/projektwahl/projektwahl-lit/blob/main/src/client/routes/pw-imprint.ts**
- Node 16/17
- npm
- Postgresql database
- OpenID credentials (optional)

## Production environment

```bash
git clone https://github.com/projektwahl/projektwahl-lit.git
cd projektwahl-lit/
npm ci --ignore-scripts --omit=optional
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout key.pem -out cert.pem
npx node-gyp rebuild -C ./node_modules/@dev.mohe/argon2/
npm run localize-build
npm run build

DATABASE_URL=postgres://projektwahl:projektwahl@projektwahl/projektwahl node --enable-source-maps dist/setup.cjs

PORT=8443 BASE_URL=https://localhost:8443 DATABASE_URL=postgres://projektwahl:projektwahl@projektwahl/projektwahl CREDENTIALS_DIRECTORY=$PWD node  --enable-source-maps dist/server.cjs

```

## Development environment

```bash
ln -s $PWD/pre-commit .git/hooks/pre-commit

psql --username=moritz < src/server/setup.sql

export DATABASE_HOST=/run/postgresql
export DATABASE_URL=postgres://moritz@localhost/moritz

NODE_ENV=development npm run setup

NODE_ENV=development npm run evaluate

nano $CREDENTIALS_DIRECTORY/openid_client_secret

NODE_ENV=development PORT=8443 BASE_URL=https://localhost:8443 OPENID_URL=openid_url CLIENT_ID=client_id  CREDENTIALS_DIRECTORY=$PWD npm run server
# or
NODE_ENV=development PORT=8443 BASE_URL=https://localhost:8443 CREDENTIALS_DIRECTORY=$PWD npm run server

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

Currently https://github.com/vslavik/poedit.

Maybe https://github.com/mozilla/pontoon/ at some point.

## Browser support

This application will probably never work without JavaScript as this would require bad API design because forms are just terrible.

## Licenses of dependencies

```
npx license-checker --production --summary
```

node node_modules/@lit/localize-tools/bin/lit-localize.js
