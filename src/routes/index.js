const express = require('express')
const router = express.Router()
const aboutRoute = require('./about')
const telegramRoute = require('./telegram')

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to Crypto bot father' })
})
  .use('/about', aboutRoute)
  .use('/telegram', telegramRoute)

router.get('/health', (req, res) => {
  if (global.ErrorState) {
    res.status(500).json({ result: 'NOK' })
  } else {
    res.status(200).json({ result: 'OK' })
  }
})

module.exports = router
