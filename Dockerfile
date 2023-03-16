# SPDX-License-Identifier: AGPL-3.0-or-later
# SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
# https://docs.docker.com/engine/reference/builder/
# docker build -f Dockerfile -t projektwahl .

# TODO https://github.com/moby/buildkit/blob/master/frontend/dockerfile/docs/syntax.md

FROM docker.io/library/node AS backend
WORKDIR /opt/projektwahl-lit
RUN chown node:node /opt/projektwahl-lit
RUN apt update && apt install -y postgresql-client
USER node:node
COPY package.json package-lock.json /opt/projektwahl-lit/
RUN openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout key.pem -out cert.pem
RUN npm ci
RUN npx @mapbox/node-pre-gyp rebuild -C ./node_modules/argon2
COPY . .
RUN LANGUAGE=en npm run build
CMD ./start.sh

FROM docker.io/library/nginx AS frontend
COPY --from=backend /opt/projektwahl-lit /opt/projektwahl-lit
COPY ./docs/sites-enabled-projektwahl.conf /etc/nginx/conf.d/default.conf
RUN openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout key.pem -out cert.pem
