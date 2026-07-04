import assert from 'node:assert/strict'
import { once } from 'node:events'

process.env.NODE_ENV = 'test'

const { default: server } = await import('../src/server.js')

const listen = async () => {
  if (!server.listening) {
    server.listen(0)
    await once(server, 'listening')
  }

  const address = server.address()
  return `http://127.0.0.1:${address.port}`
}

const requestJson = async (url, options) => {
  const response = await fetch(url, options)
  const body = await response.json()
  return { response, body }
}

const run = async () => {
  const baseUrl = await listen()

  const health = await requestJson(`${baseUrl}/api/health`)
  assert.equal(health.response.status, 200)
  assert.equal(health.body.ok, true)
  assert.equal(health.body.service, 'ai-sass-backend')

  const article = await requestJson(`${baseUrl}/api/ai/article`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ topic: 'AI for founders', tone: 'Professional', length: 'Short' }),
  })
  assert.equal(article.response.status, 200)
  assert.equal(article.body.ok, true)
  assert.match(article.body.output, /AI for founders/)

  const missing = await requestJson(`${baseUrl}/api/missing`)
  assert.equal(missing.response.status, 404)
  assert.equal(missing.body.ok, false)

  console.log('Backend API tests passed.')
}

run()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => {
    server.close()
  })
