const { Bot } = require('../../lib/telegrafBot')
const { channelLogsId } = require('../../config')

function errorLog({ err, functionName }) {
  Bot.telegram.sendMessage(
    channelLogsId,
    `
    <b>Error: ${err?.response?.status}</b>
    <b>Link: ${err?.config?.url}</b>
    <b>Msg: ${err.message}</b>
    <i>Function: ${functionName}</i>
    `,
    {
      parse_mode: 'HTML'
    }
  )
}

module.exports = errorLog
