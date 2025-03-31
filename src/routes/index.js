import { Router } from 'express'
import aboutRoutes from './about.js'
import telegramRoutes from './telegram.js'
import logger from '../logger.js'
import { globalState } from '../globalState.js'
const router = Router()

const sendInterceptor = (res, send) => (content) => {
  if (res.req.originalUrl !== '/favicon.ico' && res.req.originalUrl !== '/health') {
    logger.info({
      reqId: res.req.id,
      res: {
        body: content,
        statusCode: res.statusCode,
        ...(res.get('link') && { linkHeader: res.get('link') })
      },
      req: {
        host: res.req.hostname,
        method: res.req.method
      }
    }, 'request completed')
  }
  res.send = send
  res.send(content)
}

// Request middleware for logger
router.use((req, res, next) => {
  // Only ignore favicon.ico & health requests
  if (req.originalUrl !== '/favicon.ico' && res.req.originalUrl !== '/health') {
    const path = (req.originalUrl) ? req.originalUrl : req.path
    logger.info({
      reqId: req.id,
      req: {
        host: req.hostname,
        method: req.method,
        path: path,
        ...(req.body && Object.keys(req.body).length !== 0 && { body: req.body }),
        ip: req.ip
      }
    }, 'incoming request')
  }

  // Override send to capture the response data
  res.send = sendInterceptor(res, res.send)
  next()
})

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to Crypto bot father' })
})
  .use('/about', aboutRoutes)
  .use('/telegram', telegramRoutes)

router.get('/health', (req, res) => {
  const errorCode = (globalState.errorState) ? 500 : 200
  const result = (globalState.errorState) ? 'NOK' : 'OK'
  res.status(errorCode).json({ result: result })
})

export default router
