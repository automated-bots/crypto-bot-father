import assert from 'node:assert/strict'
import { test } from 'node:test'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { once } from 'node:events'

test('actual app starts, registers its webhook, and serves HTTP routes', { timeout: 15000 }, async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'crypto-bot-test-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const fulcrum = createServer()
  fulcrum.listen(0, '127.0.0.1')
  await once(fulcrum, 'listening')
  t.after(() => fulcrum.close())
  const reserve = createServer()
  reserve.listen(0, '127.0.0.1')
  await once(reserve, 'listening')
  const port = reserve.address().port
  await new Promise((resolve) => reserve.close(resolve))
  const preload = join(directory, 'mock.mjs')
  await writeFile(
    preload,
    `
    globalThis.fetch = async (url, options) => {
      if (!url.startsWith('https://api.telegram.org/')) throw new Error('Unexpected external request');
      const method = url.split('/').at(-1);
      if (method === 'setWebhook') {
        const params = new URLSearchParams(options.body);
        if (params.get('url') !== 'https://example.invalid/telegram/botlocal-test-secret') throw new Error('Incorrect webhook');
      }
      console.log('MOCK_TELEGRAM:' + method);
      return Response.json({ ok: true, result: true });
    };
  `
  )
  const child = spawn(process.execPath, ['--import', preload, 'src/index.js'], {
    env: {
      ...process.env,
      DOTENV_CONFIG_PATH: '/dev/null',
      BOT_PATH_SECRET: 'local-test-secret',
      TELEGRAM_TOKEN: 'local-test-token',
      TELEGRAM_BOT_URL: 'https://example.invalid',
      PORT: String(port),
      FULCRUM_RPC_HOST: '127.0.0.1',
      FULCRUM_RPC_PORT: String(fulcrum.address().port),
      LOG_LEVEL: 'info'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  })
  t.after(async () => {
    if (child.exitCode === null) {
      child.kill()
      await once(child, 'exit')
    }
  })
  let output = ''
  child.stdout.on('data', (data) => {
    output += data
  })
  child.stderr.on('data', (data) => {
    output += data
  })
  const origin = `http://127.0.0.1:${port}`
  let ready = false
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      ready = (await fetch(origin)).ok
      if (ready) break
    } catch {}
    assert.equal(child.exitCode, null, output)
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  assert.ok(ready, output)
  assert.deepEqual(await (await fetch(`${origin}/health`)).json(), { result: 'OK' })
  assert.equal((await fetch(`${origin}/about`)).status, 200)
  assert.equal((await fetch(`${origin}/missing`)).status, 404)
  assert.equal((await fetch(`${origin}/favicon.ico`)).status, 404)
  const webhook = `${origin}/telegram/botlocal-test-secret`
  const response = await fetch(webhook, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      update_id: 1,
      message: { message_id: 1, date: 1, chat: { id: 42, type: 'private' }, from: { id: 42, first_name: 'Tester' }, text: '/help' }
    })
  })
  assert.equal(response.status, 200)
  assert.equal((await fetch(webhook, { method: 'POST' })).status, 200)
  assert.equal((await fetch(`${origin}/telegram/botwrong`, { method: 'POST' })).status, 404)
  await new Promise((resolve) => setTimeout(resolve, 50))
  assert.match(output, /MOCK_TELEGRAM:setWebhook/)
  assert.match(output, /MOCK_TELEGRAM:sendMessage/)
  assert.equal((await fetch(`${origin}/health`)).status, 200)
})
