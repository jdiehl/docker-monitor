FROM node:alpine

WORKDIR /home/node

ENTRYPOINT node index

# Install packages
ADD package.json yarn.lock ./
RUN yarn --frozen-lockfile --prod

# Copy source
ADD index.js ./
ADD src ./src

ENV SOCKET_PATH=/var/run/docker.sock
ENV SLACK_CHANNEL=#docker
