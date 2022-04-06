# SPDX-License-Identifier: AGPL-3.0-or-later
# SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
FROM node
RUN apt-get update && apt-get full-upgrade -y && apt-get install -y chromium chromium-driver firefox-esr
WORKDIR /opt/projektwahl-lit
RUN chown node:node /opt/projektwahl-lit
USER node
RUN curl -OL https://github.com/mozilla/geckodriver/releases/download/v0.30.0/geckodriver-v0.30.0-linux64.tar.gz
RUN tar xf geckodriver-v0.30.0-linux64.tar.gz
#RUN apt-get update && apt-get full-upgrade && apt-get install -y nano
COPY --chown=node:node /opt/projektwahl-lit/package.json
RUN npm install
CMD ["/bin/bash"]
COPY . .

# docker build -t getting-started . && docker run -it getting-started npm run format:check
# docker build -t getting-started . && docker run --mount type=bind,source="$(pwd)"/build.js,target=/opt/projektwahl-lit/build.js -it getting-started npm run format