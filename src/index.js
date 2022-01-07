// NTBA = node-telegram-bot-api fixes
process.env.NTBA_FIX_319 = 1
process.env.NTBA_FIX_350 = 1
// constants
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN
const COINMARKETCAP_API_TOKEN = process.env.COINMARKETCAP_API_TOKEN
const BITCOIN_HOST = 'localhost'
const BITCOIN_PORT = process.env.BITCOIN_PORT || 8332
const BITCOIN_RPC_USER = process.env.BITCOIN_RPC_USERNAME || 'bitcoin'
const BITCOIN_RPC_PASS = process.env.BITCOIN_RPC_PASSWORD || 'xyz'
const botUrl = process.env.TELEGRAM_BOT_URL || 'https://cryptofather.melroy.org'
const port = process.env.PORT || 3007

const crypto = require('crypto')
global.TelegramSecretHash = crypto.randomBytes(20).toString('hex')
const TelegramBot = require('node-telegram-bot-api')
const express = require('express')
const bodyParser = require('body-parser')
const Bitcoin = require('./bitcoin')
const Exchange = require('./exchange')
const Telegram = require('./telegram')
const routes = require('./routes')

if (!TELEGRAM_TOKEN) {
  console.error('\x1b[31mERROR: Provide your Telegram token, by setting the TELEGRAM_TOKEN enviroment variable first! See README.md.\nExit.\x1b[0m')
  process.exit(1)
}

// Create helper objects
const bitcoin = new Bitcoin(BITCOIN_HOST, BITCOIN_PORT, BITCOIN_RPC_USER, BITCOIN_RPC_PASS)
const exchange = new Exchange(COINMARKETCAP_API_TOKEN)

const telegramBot = new TelegramBot(TELEGRAM_TOKEN)
// This informs the Telegram servers of the new webhook.
telegramBot.setWebHook(`${botUrl}/telegram/bot${TelegramSecretHash}`)

const tel = new Telegram(telegramBot, bitcoin, exchange)

// Create the Express app
const app = express()
app.set('telegram_bot', telegramBot)
// parse the updates to JSON
app.use(bodyParser.json())

// Set routes
app.use('/', routes)

// Set Telegram commands
tel.setCommands()

// Start server
app.listen(port, () => {
  console.log(`Bitcoin Bot service is listening on ${port}`)
})
