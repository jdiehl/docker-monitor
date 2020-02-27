const { createServer } = require('http')

class HealthServer {

  constructor({ port }) {
    this.port = port
  }

  start() {
    this.server = createServer((req, res) => {
      res.end('OK')
    })
    this.server.listen(this.port)
  }

}

exports.HealthServer = HealthServer
