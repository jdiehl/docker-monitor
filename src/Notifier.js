const { WebClient } = require('@slack/web-api')

const textGenerator = {
  start(name) {
    return `:white_check_mark: *${name}* has *started*`
  },
  stop(name) {
    return `:octagonal_sign: *${name}* has *stopped*`
  },
  error(name, message) {
    return `:warning: *${name}* has reported an *error:*\n\`\`\`${message.trim()}\`\`\``
  }
}

class Notifier {

  constructor({ token, channel }) {
    this.client = new WebClient(token)
    this.channel = channel
  }

  async start() {
    const text = '*Docker Monitor online*'
    await this.client.chat.postMessage({ channel: this.channel, text });
  }

  async notify({ event, name, message }) {
    const text = textGenerator[event](name, message)
    await this.client.chat.postMessage({ channel: this.channel, text });
  }

}

exports.Notifier = Notifier
