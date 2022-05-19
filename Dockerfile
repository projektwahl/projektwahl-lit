# SPDX-License-Identifier: AGPL-3.0-or-later
# SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
# https://docs.docker.com/engine/reference/builder/
# docker build -f Dockerfile -t projektwahl .

# TODO https://github.com/moby/buildkit/blob/master/frontend/dockerfile/docs/syntax.md

FROM node
WORKDIR /opt/projektwahl-lit
RUN chown node:node /opt/projektwahl-lit
USER node:node
COPY package.json package-lock.json /opt/projektwahl-lit/
RUN openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout key.pem -out cert.pem
RUN npm ci --ignore-scripts
RUN ./node_modules/@dev.mohe/argon2/build.sh /usr/local/include/node/
COPY . .
RUN npm run build
ENV PORT=8443
ENV BASE_URL=https://localhost:8443
ENV DATABASE_URL=postgres://projektwahl@projektwahl/projektwahl
ENV CREDENTIALS_DIRECTORY=.
CMD ["/bin/bash"]
#CMD ["--enable-source-maps", "dist/server.js"]
