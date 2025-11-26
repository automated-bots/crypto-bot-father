import 'dotenv/config'
import { Router } from 'express'
//import logger from '../logger.js'
const router = Router()
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN

// We are receiving updates at the route below
router.post(`/bot${TELEGRAM_TOKEN}`, (req, res) => {
  //logger.error(req.body, 'Received Telegram update with body')
  // Check if undefined (in express v5 body can be undefined)
  if (req.body) {
    req.telegram_bot.processUpdate(req.body)
  }
  res.sendStatus(200)
})

export default router
