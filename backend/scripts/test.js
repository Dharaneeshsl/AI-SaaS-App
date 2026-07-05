import assert from 'node:assert/strict'
import { once } from 'node:events'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

process.env.NODE_ENV = 'test'
// Isolate persistence so tests never touch the real data directory.
const testDataDir = await mkdtemp(path.join(tmpdir(), 'ai-sass-test-'))
process.env.DATA_DIR = testDataDir

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
  assert.ok(health.body.integrations)
  assert.ok('anthropicConfigured' in health.body.integrations)

  const userHeaders = {
    'content-type': 'application/json',
    'x-user-id': 'test-user-1',
  }

  const article = await requestJson(`${baseUrl}/api/ai/article`, {
    method: 'POST',
    headers: userHeaders,
    body: JSON.stringify({ topic: 'AI for founders', tone: 'Professional', length: 'Short' }),
  })
  assert.equal(article.response.status, 200)
  assert.equal(article.body.ok, true)
  assert.match(article.body.output, /AI for founders/)
  assert.ok(article.body.id, 'article response should include a creation id')

  const title = await requestJson(`${baseUrl}/api/ai/title`, {
    method: 'POST',
    headers: userHeaders,
    body: JSON.stringify({ keyword: 'automation', category: 'Startup' }),
  })
  assert.equal(title.response.status, 200)
  assert.equal(title.body.ok, true)
  assert.match(title.body.output, /automation/)

  // The two creations above should be listed for this user.
  const creations = await requestJson(`${baseUrl}/api/creations`, { headers: userHeaders })
  assert.equal(creations.response.status, 200)
  assert.equal(creations.body.creations.length, 2)

  // Another user should not see them.
  const otherCreations = await requestJson(`${baseUrl}/api/creations`, {
    headers: { 'x-user-id': 'test-user-2' },
  })
  assert.equal(otherCreations.body.creations.length, 0)

  // Publish the article, then it should appear in the community feed.
  const articleId = article.body.id
  const publish = await requestJson(`${baseUrl}/api/creations/${articleId}/publish`, {
    method: 'POST',
    headers: userHeaders,
    body: JSON.stringify({ publish: true }),
  })
  assert.equal(publish.response.status, 200)
  assert.equal(publish.body.creation.publish, true)

  const community = await requestJson(`${baseUrl}/api/community`)
  assert.equal(community.response.status, 200)
  assert.equal(community.body.creations.length, 1)

  // Likes toggle on and off.
  const like = await requestJson(`${baseUrl}/api/creations/${articleId}/like`, {
    method: 'POST',
    headers: { 'x-user-id': 'test-user-2' },
  })
  assert.equal(like.body.creation.likes.length, 1)
  const unlike = await requestJson(`${baseUrl}/api/creations/${articleId}/like`, {
    method: 'POST',
    headers: { 'x-user-id': 'test-user-2' },
  })
  assert.equal(unlike.body.creation.likes.length, 0)

  // Liking without a user id is rejected.
  const anonLike = await requestJson(`${baseUrl}/api/creations/${articleId}/like`, {
    method: 'POST',
  })
  assert.equal(anonLike.response.status, 401)

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
  .finally(async () => {
    server.close()
    await rm(testDataDir, { recursive: true, force: true })
  })
