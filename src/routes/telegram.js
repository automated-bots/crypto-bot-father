import { Router } from 'express'
import { globalState } from '../globalState.js'
const router = Router()

// We are receiving updates at the route below
router.post(`/bot${globalState.telegramSecretHash}`, (req, res) => {
  req.telegram_bot.processUpdate(req.body)
  res.sendStatus(200)
})

export default router
