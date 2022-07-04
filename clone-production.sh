

psql --u postgres --command="DROP DATABASE projektwahl_staging;"
psql --u postgres --command="CREATE DATABASE projektwahl_staging OWNER projektwahl_staging_admin;"
psql --username projektwahl_staging_admin --set ON_ERROR_STOP=on projektwahl_staging < '/home/moritz/Documents/Projektwoche/dumps/dump_2022-07-04 12:16:52.sql'
psql --username projektwahl_staging_admin --single-transaction --db projektwahl_staging < src/server/setup.sql

NODE_ENV=testing PORT=8443 BASE_URL=https://localhost:8443 CREDENTIALS_DIRECTORY=$PWD DATABASE_HOST=localhost DATABASE_URL=postgres://projektwahl_staging:projektwahl@localhost/projektwahl_staging npm run server


DATABASE_URL=postgres://projektwahl_production:projektwahl_production@127.0.0.1/projektwahl_production DATABASE_HOST=/run/postgresql npm run evaluate
