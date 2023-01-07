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
  const errorCode = (global.ErrorState) ? 500 : 200
  const result = (global.ErrorState) ? 'NOK' : 'OK'
  res.status(errorCode).json({ result: result })
})

module.exports = router
