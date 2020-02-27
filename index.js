const { Docker } = require('node-docker-api')
const { Monitor } = require('./src/Monitor')
const { Notifier } = require('./src/Notifier')
const { CommandServer } = require('./src/CommandServer')
const { HealthServer } = require('./src/HealthServer')

const { SOCKET_PATH, SLACK_TOKEN, SLACK_CHANNEL, SLACK_SIGNING_SECRET } = process.env
const PORT = parseInt(process.env.PORT, 10)
if (!SLACK_TOKEN) throw new Error('Missing SLACK_TOKEN')
if (!SLACK_SIGNING_SECRET) throw new Error('Missing SLACK_SIGNING_SECRET')

async function main() {
  const docker = new Docker({
    socketPath: SOCKET_PATH || '/var/run/docker.sock'
  })

  const monitor = new Monitor({ docker })
  
  const notifier = new Notifier({
    token: SLACK_TOKEN,
    channel: SLACK_CHANNEL || '#docker'
  })

  const server = new CommandServer({
    signing_secret: SLACK_SIGNING_SECRET,
    port: PORT || 3000,
    docker
  })
  
  const healthServer = new HealthServer({ port: 8080 })
  
  monitor.on('container', ({ event, name, message }) => notifier.notify({ event, name, message }))
  
  await notifier.start()
  await monitor.start()
  await server.start()
  await healthServer.start()
}

main().catch(err => console.error(err))
