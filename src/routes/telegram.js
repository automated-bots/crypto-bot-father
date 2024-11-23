import { Router } from 'express'
const router = Router()

// We are receiving updates at the route below
router.post(`/bot${global.TelegramSecretHash}`, (req, res) => {
  req.telegram_bot.processUpdate(req.body)
  res.sendStatus(200)
})

export default router
