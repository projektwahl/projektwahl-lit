FROM node
WORKDIR /app
RUN apt-get update && apt-get full-upgrade && apt-get install -y nano
COPY dangerous-package.json /app/package.json
RUN npm install
CMD ["/bin/bash"]
COPY . .

# docker build -t getting-started . && docker run -it getting-started npm run format:check
# docker build -t getting-started . && docker run --mount type=bind,source="$(pwd)"/build.js,target=/app/build.js -it getting-started npm run format