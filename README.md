# Docker Monitor

This node script monitors your docker host and sends a slack notification whenever a monitored process dies or reports an error to stderr

## Installation

1. Build the docker image
2. Create a Slack App and generate a token (allow chat:post and invite the app into #docker)
3. Configure your SLACK_TOKEN as env in docker-compose.yml
4. Configure all docker images to be monitored with the labels `monitor.enable=true` and optionally `monitor.errors=true`
5. Deploy the image using docker-compose

## Optional Slash Commands

You can configure the endpoint of a slash command to the container. It will then execute that command as a docker command.
