FROM node
WORKDIR /app
COPY dangerous-package.json /app/package.json
RUN npm install
CMD ["/bin/bash"]
COPY . .

# docker build -t getting-started .
# docker run -it getting-started