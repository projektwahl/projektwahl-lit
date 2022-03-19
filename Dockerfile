FROM node
WORKDIR /app
COPY dangerous-package.json /app/package.json
RUN npm install
CMD ["npm" "run" "test"]
COPY . .

# docker build -t getting-started .
# docker run getting-started