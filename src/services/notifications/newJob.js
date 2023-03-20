const { channelId } = require('../../config')
const { Bot, Markup } = require('../../lib/telegrafBot')
const errorLog = require('../logs/errorLog')

async function newJob({ message, linkDetails }) {
  try {
    const buttonUrl = Markup.button.url('🔗 Apply now', `${linkDetails}`)
    await Bot.telegram.sendMessage(channelId, message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[buttonUrl]]
      }
    })
    return null
  } catch (err) {
    errorLog({ err, functionName: 'newJobsNotification' })
  }
}

module.exports = newJob
