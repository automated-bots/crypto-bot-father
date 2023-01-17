require('dotenv').config()
// NTBA = node-telegram-bot-api fixes
process.env.NTBA_FIX_319 = 1
process.env.NTBA_FIX_350 = 1
// constants
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN
const BITCOIN_RPC_HOST = process.env.BITCOIN_RPC_HOST || 'localhost'
const BITCOIN_RPC_PORT = process.env.BITCOIN_RPC_PORT || 8332
const BITCOIN_RPC_USER = process.env.BITCOIN_RPC_USERNAME || 'bitcoin'
const BITCOIN_RPC_PASS = process.env.BITCOIN_RPC_PASSWORD || ''
const FULCRUM_RPC_HOST = process.env.FULCRUM_RPC_HOST || 'localhost'
const FULCRUM_RPC_PORT = process.env.FULCRUM_RPC_PORT || 50001
const botUrl = process.env.TELEGRAM_BOT_URL || 'https://cryptofather.melroy.org'
const port = process.env.PORT || 3007

const createError = require('http-errors')
const crypto = require('crypto')
global.TelegramSecretHash = crypto.randomBytes(20).toString('hex')
const TelegramBot = require('node-telegram-bot-api')
const express = require('express')
const bodyParser = require('body-parser')
const BitcoinCash = require('./bitcoin')
const Fulcrum = require('./fulcrum')
const Fetcher = require('./fetcher')
const Telegram = require('./telegram')
const routes = require('./routes')
global.ErrorState = false

if (!TELEGRAM_TOKEN) {
  console.error('\x1b[31mERROR: Provide your Telegram token, by setting the TELEGRAM_TOKEN environment variable first! See README.md.\nExit.\x1b[0m')
  process.exit(1)
}

// Create helper objects
const bitcoinCash = new BitcoinCash(BITCOIN_RPC_HOST, BITCOIN_RPC_PORT, BITCOIN_RPC_USER, BITCOIN_RPC_PASS)
const fulcrum = new Fulcrum(FULCRUM_RPC_PORT, FULCRUM_RPC_HOST)
const fetcher = new Fetcher(bitcoinCash, fulcrum)

const telegramBot = new TelegramBot(TELEGRAM_TOKEN, {
  filepath: false
})
const tel = new Telegram(telegramBot, fetcher)

telegramBot.on('error', (error) => {
  console.error(error)
  global.ErrorState = true
})

// Create the Express app
const app = express()
// parse the updates to JSON
app.use(bodyParser.json())

// This informs the Telegram servers of the new webhook
telegramBot.setWebHook(`${botUrl}/telegram/bot${global.TelegramSecretHash}`).catch((error) => {
  console.error(error)
  global.ErrorState = true
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
    console.log(err)
    res.send('Internal error')
  }
})

// Set routes
app.use('/', routes)

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// Error handler
app.use((error, req, res, next) => {
  // Only print errors in development
  if (req.app.get('env') === 'development') {
    console.error(error)
  }
  // Render the error page
  res.status(error.status || 500).json()
})

// Set Telegram commands
tel.setCommands()

// Start server
app.listen(port, () => {
  console.log(`Crypto Bot Father server is listening on ${port}`)
})
