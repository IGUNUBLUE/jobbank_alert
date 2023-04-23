const { Telegraf, Markup } = require('telegraf')

const bot = new Telegraf('')

module.exports = {
  Bot: bot,
  Markup
}
