import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Readable } from 'node:stream'
import { Bot } from 'node-telegram-bot-api'
import Telegram from '../src/telegram.js'
import { globalState } from '../src/globalState.js'

function setup(fetcher = {}) {
  const calls = []
  const bot = new Bot('local-test-token', {
    maxRetries: 0,
    fetch: async (url, options) => {
      calls.push({ method: url.split('/').at(-1), body: options.body, headers: options.headers })
      return Response.json({ ok: true, result: true })
    }
  })
  bot.catch((error) => {
    throw error
  })
  const telegram = new Telegram(bot, fetcher)
  telegram.setCommands()
  const update = (text) =>
    bot.handleUpdate({
      update_id: 1,
      message: { message_id: 7, date: 1, chat: { id: 42, type: 'private' }, from: { id: 42, first_name: 'Tester' }, text }
    })
  return { bot, telegram, calls, update }
}

test('commands retain default symbols, regex arguments, mentions, and general messages', async () => {
  const quotes = []
  const { calls, update } = setup({
    priceQuotes: async (...args) => {
      quotes.push(args)
      return 'quote'
    }
  })
  for (const command of ['/price', '!price BTC EUR', '/price@mybot ETH', '/help', '/cat']) await update(command)
  await new Promise(setImmediate)
  assert.deepEqual(quotes, [['BCH'], ['BTC', 'EUR'], ['ETH', null]])
  const messages = calls.map((call) => Object.fromEntries(new URLSearchParams(call.body)))
  assert.equal(messages.length, 5)
  assert.ok(messages.every((message) => message.chat_id === '42' && message.parse_mode === 'MarkdownV2'))
  assert.ok(messages.some((message) => message.text.includes('General:')))
})

test('overlapping command patterns continue through middleware', async () => {
  const bot = new Bot('test')
  const telegram = new Telegram(bot, {})
  const matches = []
  telegram.onText(/hello/, () => matches.push('first'))
  telegram.onText(/hello/, () => matches.push('second'))
  await bot.handleUpdate({ update_id: 1, message: { message_id: 1, date: 1, chat: { id: 42, type: 'private' }, text: 'hello' } })
  assert.deepEqual(matches, ['first', 'second'])
})

test('chart streams upload as multipart PNG files', async () => {
  const { calls, update } = setup({ chartImage: async () => Readable.from([Buffer.from('chart bytes')]) })
  await update('/chart BCH USD')
  await new Promise(setImmediate)
  const photo = calls.find((call) => call.method === 'sendPhoto')
  assert.ok(photo)
  const request = new Request('http://localhost', { method: 'POST', body: photo.body, headers: photo.headers, duplex: 'half' })
  const form = await request.formData()
  assert.equal(form.get('chat_id'), '42')
  assert.equal(await form.get('photo').text(), 'chart bytes')
})

test('price streams send drafts and release active streams', async () => {
  const { telegram, calls, update } = setup({ streamBchPrice: async (onPrice) => onPrice({ price: '123' }) })
  await update('/streamprice')
  await new Promise(setImmediate)
  const drafts = calls.filter((call) => call.method === 'sendMessageDraft').map((call) => Object.fromEntries(new URLSearchParams(call.body)))
  assert.equal(drafts.length, 2)
  assert.deepEqual(drafts[1], { chat_id: '42', draft_id: '7', text: 'BCH Price: $123' })
  assert.equal(telegram.activeStreams.size, 0)
})

test('failed message delivery marks the health state', async () => {
  const { bot, telegram } = setup()
  bot.api.sendMessage = async () => {
    throw new Error('simulated Telegram failure')
  }
  globalState.errorState = false
  telegram.sendMessage(42, 'test')
  await new Promise(setImmediate)
  assert.equal(globalState.errorState, true)
  globalState.errorState = false
})
