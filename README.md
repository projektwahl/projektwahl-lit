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
- Node 21 (tested version)
- npm
- Postgresql database 16.2 (tested version)
- OpenID credentials (optional)

## Important notes

To ensure data security you need two users to access the database. One privileged user and one unprivileged user. The privileged user is not subject to row level security and is used for e.g. triggers and the unprivileged user is subject to row level security. If you don't use two users then unprivileged clients like voters can read all users.

## Setup

```bash
git clone https://github.com/projektwahl/projektwahl-lit.git
cd projektwahl-lit/

sudo docker-compose up -d

npm i
# generate tls certificate
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout key.pem -out cert.pem
#npm run localize-build
LANGUAGE=de npm run build

psql postgres://postgres:mysecretpassword@localhost
CREATE ROLE projektwahl_production LOGIN PASSWORD 'projektwahl'; -- CHANGE/REMOVE THIS PASSWORD
CREATE ROLE projektwahl_production_admin IN ROLE projektwahl_production LOGIN PASSWORD 'projektwahl'; -- CHANGE/REMOVE THIS PASSWORD
CREATE DATABASE projektwahl_production OWNER projektwahl_production_admin;
exit

psql postgres://projektwahl_production_admin:projektwahl@localhost/projektwahl_production --single-transaction < src/server/setup.sql

NODE_ENV=production DATABASE_URL=postgres://projektwahl_production:projektwahl@localhost/projektwahl_production npm run setup

OPENID_URL=https://login.microsoftonline.com/tenant-id/v2.0
CLIENT_ID=client-id
openid_client_secret

PORT=8443 BASE_URL=https://localhost:8443 DATABASE_URL=postgres://projektwahl@projektwahl/projektwahl CREDENTIALS_DIRECTORY=$PWD npm run server

```

## Development environment

```bash
ln -s $PWD/pre-commit .git/hooks/pre-commit

NODE_ENV=development PORT=8443 BASE_URL=https://localhost:8443 CREDENTIALS_DIRECTORY=$PWD DATABASE_HOST=localhost DATABASE_URL=postgres://projektwahl_staging:projektwahl@localhost/projektwahl_staging npm run server
```

## Security

See [SECURITY.md](SECURITY.md)

## Translation

Currently https://github.com/vslavik/poedit.

## Browser support

This application will probably never work without JavaScript as this would require bad API design because forms are just terrible.

## Licenses of dependencies

```
npx license-checker --production --summary
```
