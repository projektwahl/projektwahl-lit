sudo -u postgres psql -c "CREATE ROLE projektwahl_staging LOGIN PASSWORD 'projektwahl';"
sudo -u postgres psql -c "CREATE ROLE projektwahl_staging_admin IN ROLE projektwahl_staging LOGIN PASSWORD 'projektwahl';"
sudo -u postgres psql -c "CREATE DATABASE projektwahl_staging OWNER projektwahl_staging_admin;"
psql postgres://projektwahl_staging_admin:projektwahl@localhost/projektwahl_staging --single-transaction < src/server/setup.sql
DATABASE_URL=postgres://projektwahl_staging:projektwahl@localhost/projektwahl_staging npm run setup
PORT=8443 BASE_URL=https://localhost:8443 DATABASE_URL=postgres://projektwahl:projektwahl@backend/projektwahl CREDENTIALS_DIRECTORY=. node --enable-source-maps dist/server.js
