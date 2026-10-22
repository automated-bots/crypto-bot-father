import 'dotenv/config'
import { Router } from 'express'
const router = Router()
const BOT_PATH_SECRET = process.env.BOT_PATH_SECRET

// We are receiving updates at the route below
router.post(`/bot${BOT_PATH_SECRET}`, async (req, res) => {
  // Check if undefined (in express v5 body can be undefined)
  if (req.body) {
    await req.telegram_bot.handleUpdate(req.body)
  }
  res.sendStatus(200)
})

export default router
