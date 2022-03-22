# SPDX-License-Identifier: AGPL-3.0-or-later
# SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
FROM node
WORKDIR /app
RUN chown node:node /app
USER node
#RUN apt-get update && apt-get full-upgrade && apt-get install -y nano
COPY --chown=node:node dangerous-package.json /app/package.json
RUN npm install
CMD ["/bin/bash"]
COPY . .
COPY dangerous-package.json /app/package.json

# docker build -t getting-started . && docker run -it getting-started npm run format:check
# docker build -t getting-started . && docker run --mount type=bind,source="$(pwd)"/build.js,target=/app/build.js -it getting-started npm run format