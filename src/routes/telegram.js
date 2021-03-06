const express = require('express')
const app = express()

// We are receiving updates at the route below
app.post(`/bot${global.TelegramSecretHash}`, (req, res) => {
  app.get('telegram_bot').processUpdate(req.body)
  res.sendStatus(200)
})

module.exports = app
