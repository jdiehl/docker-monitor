const { Docker } = require('node-docker-api')
const { Monitor } = require('./src/Monitor')
const { Notifier } = require('./src/Notifier')
const { CommandServer } = require('./src/CommandServer')

const { SOCKET_PATH, SLACK_TOKEN, SLACK_CHANNEL } = process.env
const PORT = parseInt(process.env.PORT, 10)
if (!SLACK_TOKEN) throw new Error('Missing SLACK_TOKEN')

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
    port: PORT || 3000,
    docker
  })
  
  monitor.on('container', ({ event, name, message }) => notifier.notify({ event, name, message }))
  
  await notifier.start()
  await monitor.start()
  await server.start()
}

main().catch(err => console.error(err))
