# SPDX-License-Identifier: AGPL-3.0-or-later
# SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
# https://docs.docker.com/engine/reference/builder/
# docker build -f Dockerfile -t projektwahl .

# TODO https://github.com/moby/buildkit/blob/master/frontend/dockerfile/docs/syntax.md

FROM node
WORKDIR /opt/projektwahl-lit
RUN chown node:node /opt/projektwahl-lit
RUN apt update && apt install -y postgresql-client
USER node:node
COPY package.json package-lock.json /opt/projektwahl-lit/
RUN openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout key.pem -out cert.pem
RUN npm ci
RUN ./node_modules/@dev.mohe/argon2/build.sh /usr/local/include/node/
COPY . .
RUN LANGUAGE=en npm run build
CMD ./start.sh