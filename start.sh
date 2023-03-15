sleep 30 # TODO FIXME wait for postgresql to start up

NODE_ENV=development DATABASE_URL=postgres://projektwahl_staging_admin:projektwahl@postgres/projektwahl_staging npm run setup
PORT=8443 BASE_URL=https://localhost:8443 DATABASE_URL=postgres://projektwahl_staging:projektwahl@postgres/projektwahl_staging CREDENTIALS_DIRECTORY=. npm run server
