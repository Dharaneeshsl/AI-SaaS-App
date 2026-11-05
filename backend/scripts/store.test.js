import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rename, mkdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

test('cold concurrent writes survive restart and failed writes never enter the cache', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'ai-saas-store-'))
  process.env.DATA_DIR = directory
  const store = await import('../src/services/store.js')
  const file = path.join(directory, 'creations.json')
  try {
    await Promise.all(Array.from({ length: 20 }, (_, i) => store.saveCreation({ userId: 'owner', type: 'article', prompt: String(i), content: 'private' })))
    assert.equal((await store.listUserCreations('owner')).length, 20)
    assert.equal(JSON.parse(await readFile(file, 'utf8')).length, 20)
    const restarted = await import('../src/services/store.js?restart')
    assert.equal((await restarted.listUserCreations('owner')).length, 20)
    await rename(file, `${file}.backup`)
    await mkdir(file)
    await assert.rejects(store.saveCreation({ userId: 'owner', type: 'article', prompt: 'failed', content: 'not committed' }))
    assert.equal((await store.listUserCreations('owner')).length, 20)
    await rm(file, { recursive: true })
    await rename(`${file}.backup`, file)
    await store.saveCreation({ userId: 'owner', type: 'article', prompt: 'recovery', content: 'committed' })
    assert.equal(JSON.parse(await readFile(file, 'utf8')).length, 21)
    const reservations = await Promise.all(Array.from({ length: 12 }, () => store.reserveGeneration('quota-owner', 'free')))
    assert.equal(reservations.filter((item) => item.allowed).length, 10)
    await reservations.find((item) => item.allowed).release()
    assert.equal((await restarted.reserveGeneration('quota-owner', 'free')).allowed, true)
    assert.equal((await restarted.reserveGeneration('quota-owner', 'free')).allowed, false)
    const usage = JSON.parse(await readFile(path.join(directory, 'usage.json'), 'utf8'))
    assert.equal(Object.values(usage)[0], 10)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
