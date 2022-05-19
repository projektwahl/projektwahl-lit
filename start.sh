DATABASE_URL=postgres://projektwahl_staging:projektwahl@postgres/projektwahl_staging npm run setup
PORT=8443 BASE_URL=https://localhost:8443 DATABASE_URL=postgres://projektwahl:projektwahl@postgres/projektwahl CREDENTIALS_DIRECTORY=. node --enable-source-maps dist/server.js
