const { Bot } = require('../../lib/telegrafBot')
const { channelLogsId } = require('../../config')

function warningLog({ message, functionName }) {
  Bot.telegram.sendMessage(
    channelLogsId,
    `
    <b>Warning</b>
    <b>Msg: ${message}</b>
    <i>Function: ${functionName}</i>
    `,
    {
      parse_mode: 'HTML'
    }
  )
}

module.exports = warningLog
