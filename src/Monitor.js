const { EventEmitter } = require('events')
const { Docker } = require('node-docker-api')

function isTrue(labels, key) {
  return labels[key] && labels[key].toLowerCase() === 'true'
}

class Monitor extends EventEmitter {
  constructor({ socketPath }) {
    super()
    this.docker = new Docker({ socketPath })
    this.ids = {}
  }

  async start() {
    // discover and init containers
    const containers = await this.docker.container.list()
    for (const container of containers) {
      this.initContainer(container.data.Id)
    }

    // listen to events
    const stream = await this.docker.events()
    stream.on('data', buf => {
      const event = JSON.parse(buf)
      this.processEvent(event)
    })
  }

  async initContainer(id) {
    // load container
    const container = await this.docker.container.get(id).status()
    const { Labels } = container.data.Config

    // ensure that monitoring is enabled for the container
    if (!isTrue(Labels, 'monitor.enable')) return
    this.ids[id] = container.data.Name.substr(1)

    // enabled log monitoring
    if (isTrue(Labels, 'monitor.errors')) {
      const stream = await container.logs({ stderr: true, follow: true, tail: 0 })
      let timeout, message
      stream.on('data', buf => {
        if (!timeout) {
          message = buf.toString()
          timeout = setTimeout(() => {
            this.notify('error', id, message)
            message = timeout = undefined
          }, 1000)
        } else {
          message += buf.toString()
        }
      })
    }
  }

  async processEvent({ id, Type, Action }) {
    if (Type !== 'container') return
    switch (Action) {
      case 'die':
        if (this.ids[id]) await this.notify('stop', id)
        delete this.ids[id]
        return
      case 'start':
        await this.initContainer(id)
        if (this.ids[id]) await this.notify('start', id)
        return
    }
  }

  async notify(event, id, message) {
    const name = this.ids[id]
    if (!name) return
    this.emit('container', { event, id, name, message })
  }
}

exports.Monitor = Monitor
