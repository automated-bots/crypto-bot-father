import 'dotenv/config'
import { Router } from 'express'
const router = Router()
const BOT_PATH_SECRET = process.env.BOT_PATH_SECRET

// We are receiving updates at the route below
router.post(`/bot${BOT_PATH_SECRET}`, (req, res) => {
  // Check if undefined (in express v5 body can be undefined)
  if (req.body) {
    req.telegram_bot.processUpdate(req.body)
  }
  res.sendStatus(200)
})

export default router
