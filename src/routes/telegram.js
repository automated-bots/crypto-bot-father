import 'dotenv/config'
import { Router } from 'express'
const router = Router()
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN

// We are receiving updates at the route below
router.post(`/bot${TELEGRAM_TOKEN}`, (req, res) => {
  //if (req.body) {
  // Trigger processUpdate function always
  req.telegram_bot.processUpdate(req.body)
  res.sendStatus(200)
})

export default router
