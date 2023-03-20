const { Bot } = require('../../lib/telegrafBot')
const { channelLogsId } = require('../../config')

function successLog() {
  Bot.telegram.sendMessage(
    channelLogsId,
    `
    <b>SUCCESS</b>
    <i>Everything OK!, finished...</i>
    `,
    {
      parse_mode: 'HTML'
    }
  )
}

module.exports = successLog
