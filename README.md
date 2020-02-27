# Docker Monitor

Monitors your docker containers and send a slack notification whenever a monitored process dies or reports an error to stderr.

## Usage with Docker Compose

Add the docker-monitor service:

```yml
  docker-monitor:
    container_name: docker-monitor
    image: jdiehl/docker-monitor
    restart: always
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      TZ: Europe/Berlin
      SLACK_TOKEN: xoxb-xxx
      SLACK_SIGNING_SECRET: xxx
      # SOCKET_PATH: /var/run/docker.sock
      # SLACK_CHANNEL: "#docker"
```

Enable monitoring for another container using labels:

```yml
  monitored-process:
    container_name: test
    image: test
    labels:
    - monitor.enable=true
    - monitor.errors=true
```

## Optional Slash Commands

To enable slash commands, configure a proxy (nginx / haproxy / traefik) to map the endpoint from Slack to port 80 of the container.

## Building

```sh
docker build -t jdiehl/docker-monitor .
docker push jdiehl/docker-monitor
```
