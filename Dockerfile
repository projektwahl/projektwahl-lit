# SPDX-License-Identifier: AGPL-3.0-or-later
# SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
FROM node
RUN apt-get update && apt-get full-upgrade -y && apt-get install -y chromium chromium-driver firefox-esr postgresql-client
WORKDIR /opt/projektwahl-lit
RUN chown node:node /opt/projektwahl-lit
USER node
RUN curl -OL https://github.com/mozilla/geckodriver/releases/download/v0.30.0/geckodriver-v0.30.0-linux64.tar.gz
RUN tar xf geckodriver-v0.30.0-linux64.tar.gz
#RUN apt-get update && apt-get full-upgrade && apt-get install -y nano
COPY --chown=node:node package.json package-lock.json /opt/projektwahl-lit/
RUN npm ci --ignore-scripts
RUN ./node_modules/@dev.mohe/argon2/build.sh /usr/local/include/node/
CMD ["/bin/bash"]
COPY . .