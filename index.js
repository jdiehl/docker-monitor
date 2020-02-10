const { Monitor } = require('./src/Monitor')
const { Notifier } = require('./src/Notifier')

const { SOCKET_PATH, SLACK_TOKEN, SLACK_CHANNEL } = process.env
if (!SLACK_TOKEN) throw new Error('Missing SLACK_TOKEN')

async function main() {
  monitor = new Monitor({
    socketPath: SOCKET_PATH || '/var/run/docker.sock'
  })
  
  notifier = new Notifier({
    token: SLACK_TOKEN,
    channel: SLACK_CHANNEL || '#docker'
  })
  
  monitor.on('container', ({ event, name, message }) => notifier.notify({ event, name, message }))
  
  await notifier.start()
  await monitor.start()
}

main().catch(err => console.error(err))
