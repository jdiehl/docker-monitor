const { createServer } = require('http')
const { parse } = require('querystring')

class CommandServer {

  constructor({ docker, port }) {
    this.docker = docker
    this.port = port
  }

  start() {
    this.server = createServer((req, res) => {
      const chunks = []
      req.on('data', chunk =>  chunks.push(chunk))
      req.on('end', async () => {
        const body = Buffer.concat(chunks).toString();
        console.log('BODY:', body)
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
    if (!container) console.error('Invalid container')
    await container[command]()
  }

}

exports.CommandServer = CommandServer
