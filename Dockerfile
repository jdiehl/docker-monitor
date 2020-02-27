FROM node:alpine
RUN apk update && apk upgrade

WORKDIR /home/node
HEALTHCHECK CMD wget localhost:8080 -q -O -
ENTRYPOINT node index
EXPOSE 80

# Install packages
ADD package.json yarn.lock ./
RUN yarn --frozen-lockfile --prod

# Copy source
ADD index.js ./
ADD src ./src

ENV SOCKET_PATH=/var/run/docker.sock
ENV SLACK_CHANNEL=#docker
ENV PORT=80
