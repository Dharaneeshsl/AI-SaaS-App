import test from 'node:test'
import assert from 'node:assert/strict'
import { config } from '../src/config.js'
import { decodeImage, generateImage } from '../src/providers/images.js'

const image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1cAAAAASUVORK5CYII='

test('image generation and editing use the documented API and fail without a fake success', async () => {
  const originalFetch = globalThis.fetch
  const previous = { hasOpenAiKey: config.hasOpenAiKey, openAiApiKey: config.openAiApiKey }
  try {
    config.hasOpenAiKey = false
    assert.equal(await generateImage({ prompt: 'A tree' }), null)
    config.hasOpenAiKey = true
    config.openAiApiKey = 'test-only'
    const calls = []
    globalThis.fetch = async (url, options) => {
      calls.push({ url, options })
      return Response.json({ data: [{ b64_json: image.split(',')[1] }] })
    }
    assert.equal((await generateImage({ prompt: 'A tree' })).output, image)
    assert.equal(calls[0].url, 'https://api.openai.com/v1/images/generations')
    assert.equal(JSON.parse(calls[0].options.body).prompt, 'A tree')
    assert.equal(calls[0].options.headers.authorization, 'Bearer test-only')
    assert.equal((await generateImage({ prompt: 'Remove background', image, transparent: true })).mode, 'provider-live')
    const edit = calls[1]
    assert.equal(edit.url, 'https://api.openai.com/v1/images/edits')
    assert.equal(edit.options.body.get('background'), 'transparent')
    assert.equal(edit.options.body.get('image').type, 'image/png')
    assert.deepEqual(Buffer.from(await edit.options.body.get('image').arrayBuffer()), decodeImage(image).bytes)
    globalThis.fetch = async () => Response.json({ error: { message: 'secret provider details' } }, { status: 429 })
    await assert.rejects(generateImage({ prompt: 'A tree' }), (error) => error.status === 502 && !error.message.includes('secret'))
    globalThis.fetch = async () => Response.json({ data: [] })
    await assert.rejects(generateImage({ prompt: 'A tree' }), { status: 502 })
    globalThis.fetch = async () => { throw new DOMException('timeout', 'TimeoutError') }
    await assert.rejects(generateImage({ prompt: 'A tree' }), { status: 504 })
  } finally {
    globalThis.fetch = originalFetch
    Object.assign(config, previous)
  }
})
