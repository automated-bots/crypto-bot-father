import { randomBytes } from 'crypto'
const globalState = {
  telegramSecretHash: randomBytes(20).toString('hex'),
  errorState: false
}

export { globalState }
