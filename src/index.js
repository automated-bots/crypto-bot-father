import 'dotenv/config'

// NTBA = node-telegram-bot-api fixes
process.env.NTBA_FIX_319 = 1
process.env.NTBA_FIX_350 = 1
// constants
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN
const BITCOIN_RPC_HOST = process.env.BITCOIN_RPC_HOST || '127.0.0.1'
const BITCOIN_RPC_PORT = process.env.BITCOIN_RPC_PORT || 8332
const BITCOIN_RPC_USER = process.env.BITCOIN_RPC_USERNAME || 'bitcoin'
const BITCOIN_RPC_PASS = process.env.BITCOIN_RPC_PASSWORD || ''
const FULCRUM_RPC_HOST = process.env.FULCRUM_RPC_HOST || '127.0.0.1'
const FULCRUM_RPC_PORT = process.env.FULCRUM_RPC_PORT || 50001
const botUrl = process.env.TELEGRAM_BOT_URL
const port = process.env.PORT || 3007

import TelegramBot from 'node-telegram-bot-api'
import express from 'express'
import { globalState } from './globalState.js'
import { createError } from 'http-errors-enhanced'
import bodyParser from 'body-parser'
import BitcoinCash from './bitcoin.js'
import Fulcrum from './fulcrum.js'
import Fetcher from './fetcher.js'
import Telegram from './telegram.js'
import routes from './routes/index.js'
import logger from './logger.js'

if (!botUrl) {
  logger.fatal('No Telegram bot URL provided!')
  throw new Error('\x1b[31mERROR: Provide your Telegram bot URL, by setting the TELEGRAM_BOT_URL environment variable first! See README.md.\nExit.\x1b[0m')
}

if (!TELEGRAM_TOKEN) {
  logger.fatal('No Telegram token provided!')
  throw new Error('\x1b[31mERROR: Provide your Telegram token, by setting the TELEGRAM_TOKEN environment variable first! See README.md.\nExit.\x1b[0m')
}

// Create helper objects
const bitcoinCash = new BitcoinCash(BITCOIN_RPC_HOST, BITCOIN_RPC_PORT, BITCOIN_RPC_USER, BITCOIN_RPC_PASS)
const fulcrum = new Fulcrum(FULCRUM_RPC_PORT, FULCRUM_RPC_HOST)
const fetcher = new Fetcher(bitcoinCash, fulcrum)

const telegramBot = new TelegramBot(TELEGRAM_TOKEN, {
  filepath: false
})
const tg = new Telegram(telegramBot, fetcher)

telegramBot.on('error', (error) => {
  logger.error(error)
  globalState.errorState = true
})

// Create the Express app
const app = express()
// Disable powered by by header
app.disable('x-powered-by')
// parse the updates to JSON
app.use(bodyParser.json())

// This informs the Telegram servers of the new webhook
telegramBot.setWebHook(`${botUrl}/telegram/bot${globalState.telegramSecretHash}`).catch((error) => {
  logger.error(error)
  globalState.errorState = true
})

// Add telegram object to request
app.use((req, res, next) => {
  req.telegram_bot = telegramBot
  next()
})

// Test interface (HTML output)
app.get('/test', async (req, res) => {
  try {
    const quote = await fetcher.priceQuotes('BCH')
    const quote2 = await fetcher.priceQuotes('BCH', 'BTC')
    const quote3 = await fetcher.detailedPriceQuotes('BTC')
    const stats = await fetcher.marketStats('BCH')
    const overview = await fetcher.marketOverview()
    const age = await fetcher.bitcoinAge()
    const html = `<h2>Quote BCH</h2>
    <pre><code>${quote}</code></pre>
    <h2>Quote BCH for BTC only</h2>
    <pre><code>${quote2} </code></pre>
    <h2>Detailed quote BTC</h2>
    <pre><code>${quote3}</code></pre>
    <h2>Market statistics BCH</h2>
    <pre><code>${stats}</code></pre>
    <h2>Market Overview</h2>
    <pre><code>${overview}</code></pre>
    <h2>Ages</h2>
    <pre><code>${age}</code></pre>`
    res.send(html)
  } catch (err) {
    logger.error(err)
    res.send('Internal error')
  }
})

// Set routes
app.use('/', routes)

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  if (req.originalUrl.includes('favicon.ico')) {
    res.sendStatus(404)
  } else {
    next(createError(404, 'Page not found'))
  }
})

// Error handler
app.use((error, req, res, next) => {
  logger.error(error)
  // Render the error page
  res.status(error.status || 500).json()
})

// Set Telegram commands
tg.setCommands()

// Start server
app.listen(port, () => {
  logger.info(`Crypto Bot Father server is listening on http://localhost:${port}`)
})
