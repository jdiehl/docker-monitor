const { createServer } = require('http')
const { createHmac } = require('crypto')
const { parse } = require('querystring')

class CommandServer {

  constructor({ docker, port, signing_secret }) {
    this.docker = docker
    this.port = port
    this.signing_secret = signing_secret
  }

  start() {
    this.server = createServer((req, res) => {
      const chunks = []
      req.on('data', chunk =>  chunks.push(chunk))
      req.on('end', async () => {
        const body = Buffer.concat(chunks).toString()
        if (!this.verify(req, body)) {
          res.writeHead(401, 'Forbidden')
          res.end()
          return
        }
        try {
          const params = parse(body)
          await this.handle(params.text)
        } catch (err) {
          res.writeHead(400, 'Bad Request')
        }
        res.end()
      })
    })
    this.server.listen(this.port)
    console.log(`Command Server listening on port ${this.port}...`)
  }

  async handle(message) {
    const [command, target] = message.split(/\s+/)
    const container = await this.docker.container.get(target)
    if (!container) throw new Error('Invalid container')
    if (typeof container[command] !== 'function') throw new Error('Invalid command')
    container[command]()
  }

  // See: https://api.slack.com/docs/verifying-requests-from-slack
  verify(req, body) {
    
    // get their hash    
    const theirs = req.headers['x-slack-signature']
    if (!theirs) return false

    // ensure that the request is recent
    const timestamp = req.headers['x-slack-request-timestamp']
    if (!timestamp) return false
    if (Math.floor(new Date().getTime() / 1000) - parseInt(timestamp, 10) > 300) return false

    // construct our the hash
    const content = `v0:${timestamp}:${body}`
    const mine = 'v0=' + createHmac('sha256', this.signing_secret).update(content).digest('hex')

    console.log('X-Slack-Request-Timestamp:', timestamp)
    console.log('content:', content)
    console.log('mine:', mine)
    console.log('theirs:', theirs)

    return mine === theirs
  }

}

exports.CommandServer = CommandServer
