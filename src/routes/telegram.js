const express = require('express')
const router = express.Router()
const app = express()
const telegramBot = app.get('telegram_bot')

// We are receiving updates at the route below
router.post(`/bot${global.TelegramSecretHash}`, (req, res) => {
  telegramBot.processUpdate(req.body)
  res.sendStatus(200)
})

module.exports = router
