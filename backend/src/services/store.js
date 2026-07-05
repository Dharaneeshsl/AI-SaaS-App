import { mkdir, readFile, writeFile, rename } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { config } from '../config.js'

// A small JSON-file-backed store for creations. It keeps the starter free of an
// external database while persisting real user output across restarts. All
// writes go through a single in-process queue and an atomic rename so concurrent
// requests cannot corrupt the file. Swap this module for a real database
// (Postgres, Mongo, etc.) when scaling to multiple instances.

const dataDir = path.resolve(config.dataDir)
const dataFile = path.join(dataDir, 'creations.json')

let cache = null
let writeQueue = Promise.resolve()

const load = async () => {
  if (cache) {
    return cache
  }

  try {
    const raw = await readFile(dataFile, 'utf8')
    const parsed = JSON.parse(raw)
    cache = Array.isArray(parsed) ? parsed : []
  } catch {
    cache = []
  }

  return cache
}

const persist = async () => {
  writeQueue = writeQueue.then(async () => {
    await mkdir(dataDir, { recursive: true })
    const tempFile = `${dataFile}.${randomUUID()}.tmp`
    await writeFile(tempFile, JSON.stringify(cache, null, 2))
    await rename(tempFile, dataFile)
  })

  return writeQueue
}

/**
 * Persist a new creation and return the stored record.
 */
export const saveCreation = async ({ userId, type, prompt, content, publish = false }) => {
  const creations = await load()

  const record = {
    id: randomUUID(),
    user_id: userId || 'anonymous',
    type,
    prompt: typeof prompt === 'string' ? prompt : '',
    content: typeof content === 'string' ? content : '',
    publish: Boolean(publish),
    likes: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  creations.unshift(record)
  await persist()
  return record
}

/**
 * Return the creations belonging to a specific user, newest first.
 */
export const listUserCreations = async (userId) => {
  const creations = await load()
  return creations.filter((item) => item.user_id === (userId || 'anonymous'))
}

/**
 * Return all published creations, newest first.
 */
export const listPublishedCreations = async () => {
  const creations = await load()
  return creations.filter((item) => item.publish)
}

/**
 * Toggle whether a creation is published. Only the owner may change it.
 */
export const setPublished = async (id, userId, publish) => {
  const creations = await load()
  const record = creations.find((item) => item.id === id && item.user_id === userId)

  if (!record) {
    return null
  }

  record.publish = Boolean(publish)
  record.updated_at = new Date().toISOString()
  await persist()
  return record
}

/**
 * Toggle a like on a creation for a given user and return the updated record.
 */
export const toggleLike = async (id, userId) => {
  const creations = await load()
  const record = creations.find((item) => item.id === id)

  if (!record || !userId) {
    return null
  }

  const index = record.likes.indexOf(userId)
  if (index === -1) {
    record.likes.push(userId)
  } else {
    record.likes.splice(index, 1)
  }

  record.updated_at = new Date().toISOString()
  await persist()
  return record
}
