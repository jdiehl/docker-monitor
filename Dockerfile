FROM node:alpine

WORKDIR /home/node

ENTRYPOINT node index

# Install packages
ADD package.json yarn.lock ./
RUN yarn --frozen-lockfile --prod

# Copy source
ADD index.js ./
ADD src ./src

EXPOSE 3000

ENV SOCKET_PATH=/var/run/docker.sock
ENV SLACK_CHANNEL=#docker
ENV PORT=3000
