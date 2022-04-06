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
- Node 16+
- npm
- Postgresql database 13+
- OpenID credentials (optional)

## Important notes

To ensure data security you need two users to access the database. One privileged user and one unprivileged user. The privileged user is not subject to row level security and is used for e.g. triggers and the unprivileged user is subject to row level security. If you don't use two users then unprivileged clients like voters can read all users.

## Setup

```bash
sudo useradd -m projektwahl_staging
sudo useradd -m projektwahl_staging_admin

git clone https://github.com/projektwahl/projektwahl-lit.git
cd projektwahl-lit/

# this is important as our optional dependencies are not audited in comparison to the other dependencies
npm ci --ignore-scripts --omit=optional
touch key.pem cert.pem
chown projektwahl_staging key.pem cert.pem
sudo -u projektwahl_staging openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout key.pem -out cert.pem
./node_modules/@dev.mohe/argon2/build.sh /usr/include/node/
npm run localize-build
npm run build


sudo -u postgres psql
CREATE ROLE projektwahl SUPERUSER LOGIN PASSWORD 'projektwahl'; -- CHANGE/REMOVE THIS PASSWORD

CREATE ROLE projektwahl_staging LOGIN PASSWORD 'projektwahl'; -- CHANGE/REMOVE THIS PASSWORD
CREATE ROLE projektwahl_staging_admin LOGIN PASSWORD 'projektwahl'; -- CHANGE/REMOVE THIS PASSWORD
CREATE DATABASE projektwahl_staging OWNER projektwahl_staging_admin;

sudo -u postgres psql --db projektwahl_staging
REVOKE CREATE ON SCHEMA public FROM PUBLIC;


sudo -u projektwahl_staging_admin psql --single-transaction --db projektwahl_staging < src/server/setup.sql


sudo -u projektwahl_staging_admin psql --db projektwahl_staging
ALTER DATABASE projektwahl_staging SET default_transaction_isolation = 'serializable';
GRANT SELECT,INSERT,UPDATE ON users_with_deleted TO projektwahl_staging;
GRANT SELECT,INSERT,UPDATE ON users TO projektwahl_staging;
GRANT SELECT,INSERT,UPDATE ON projects_with_deleted TO projektwahl_staging;
GRANT SELECT,INSERT,UPDATE ON projects TO projektwahl_staging;
GRANT SELECT,INSERT,UPDATE ON choices TO projektwahl_staging;
GRANT INSERT ON settings TO projektwahl_staging;
GRANT SELECT,INSERT,UPDATE,DELETE ON sessions TO projektwahl_staging;
ALTER VIEW users OWNER TO projektwahl_staging;
ALTER VIEW present_voters OWNER TO projektwahl_staging;
ALTER VIEW projects OWNER TO projektwahl_staging;

sudo -u projektwahl_staging NODE_ENV=development DATABASE_HOST=/run/postgresql DATABASE_URL=postgres://projektwahl_staging@localhost/projektwahl_staging npm run setup


PORT=8443 BASE_URL=https://localhost:8443 DATABASE_URL=postgres://projektwahl@projektwahl/projektwahl CREDENTIALS_DIRECTORY=$PWD node  --enable-source-maps dist/server.js

```

## Development environment

```bash
ln -s $PWD/pre-commit .git/hooks/pre-commit

sudo -u projektwahl_staging NODE_ENV=development PORT=8443 BASE_URL=https://localhost:8443 CREDENTIALS_DIRECTORY=$PWD DATABASE_HOST=/run/postgresql DATABASE_URL=postgres://projektwahl_staging@localhost/projektwahl_staging npm run server
```

## Testing

```
sudo -u projektwahl_staging NODE_ENV=testing PORT=8443 BASE_URL=https://localhost:8443 CREDENTIALS_DIRECTORY=$PWD DATABASE_HOST=/run/postgresql DATABASE_URL=postgres://projektwahl_staging@localhost/projektwahl_staging npm run server

NODE_ENV=testing PORT=8443 BASE_URL=https://localhost:8443 CREDENTIALS_DIRECTORY=$PWD DATABASE_HOST=/run/postgresql DATABASE_URL=postgres://projektwahl_staging_admin:projektwahl@localhost/projektwahl_staging npm run test


```

## Database access

```
psql --username=projektwahl --host=projektwahl

# sudo tail -f /var/lib/postgresql/14/log/postgresql-2022-03-31_201007.log
```

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
