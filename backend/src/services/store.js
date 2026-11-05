import { mkdir, readFile, writeFile, rename, unlink } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { config } from '../config.js'
import { changeLocalUsage } from './usage.js'

// A small JSON-file-backed store for creations. It keeps the starter free of an
// external database while persisting real user output across restarts. All
// writes go through a single in-process queue and an atomic rename so concurrent
// requests cannot corrupt the file. Swap this module for a real database
// (Postgres, Mongo, etc.) when scaling to multiple instances.

const dataDir = path.resolve(config.dataDir)
const dataFile = path.join(dataDir, 'creations.json')

let cache = null
let loading = null
let writeQueue = Promise.resolve()
let mongoPromise = null
let mongoDatabase = null

const mongoCollection = async () => {
  if (!config.mongoUri) return null
  if (!mongoPromise) {
    mongoPromise = import('mongodb').then(async ({ MongoClient }) => {
      const client = new MongoClient(config.mongoUri, { serverSelectionTimeoutMS: 5000 })
      await client.connect()
      mongoDatabase = client.db(config.mongoDatabase)
      const collection = mongoDatabase.collection('creations')
      await collection.createIndex({ user_id: 1, created_at: -1 })
      await collection.createIndex({ publish: 1, created_at: -1 })
      return collection
    }).catch((error) => {
      mongoPromise = null
      throw new Error(`MongoDB unavailable: ${error.message}`)
    })
  }
  return mongoPromise
}

export const reserveGeneration = async (userId, plan) => {
  const date = new Date()
  const month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
  const limit = plan === 'pro' ? config.proMonthlyLimit : config.freeMonthlyLimit
  const creations = await mongoCollection()
  if (creations) {
    const usage = mongoDatabase.collection('monthly_usage')
    const id = `${userId}:${month}`
    try {
      await usage.updateOne({ _id: id }, { $setOnInsert: { user_id: userId, month, used: 0 } }, { upsert: true })
    } catch (error) {
      if (error.code !== 11000) throw error
    }
    const updated = await usage.findOneAndUpdate({ _id: id, used: { $lt: limit } }, { $inc: { used: 1 } }, { returnDocument: 'after' })
    if (!updated) return { allowed: false, limit, month }
    return { allowed: true, limit, month, release: () => usage.updateOne({ _id: id, used: { $gt: 0 } }, { $inc: { used: -1 } }) }
  }
  const key = `${userId}:${month}`
  const used = await changeLocalUsage(key, 1, limit)
  if (used === null) return { allowed: false, limit, month }
  return { allowed: true, limit, month, release: () => changeLocalUsage(key, -1, limit) }
}

const load = async () => {
  if (cache) {
    return cache
  }

  if (loading) return loading
  loading = (async () => {
    try {
      const raw = await readFile(dataFile, 'utf8')
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        throw new Error('Creations store must contain an array.')
      }
      cache = parsed
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw new Error(`Unable to load creations store: ${error.message}`)
      }
      cache = []
    }

    return cache
  })().finally(() => { loading = null })
  return loading
}

const transact = (mutate) => {
  const write = async () => {
    const next = structuredClone(await load())
    const result = mutate(next)
    if (result === null) return null
    await mkdir(dataDir, { recursive: true })
    const tempFile = `${dataFile}.${randomUUID()}.tmp`
    try {
      await writeFile(tempFile, JSON.stringify(next), { mode: 0o600 })
      await rename(tempFile, dataFile)
    } finally {
      await unlink(tempFile).catch(() => {})
    }
    cache = next
    return structuredClone(result)
  }

  const operation = writeQueue.then(write)
  writeQueue = operation.catch(() => {})
  return operation
}

/**
 * Persist a new creation and return the stored record.
 */
const createRecord = ({ userId, type, prompt, content, mode = 'demo', publish = false }) => ({
  id: randomUUID(), user_id: userId || 'anonymous', type, mode,
  prompt: typeof prompt === 'string' ? prompt : '', content: typeof content === 'string' ? content : '',
  publish: Boolean(publish), likes: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
})

export const persistCreation = async (input) => {
  const collection = await mongoCollection()
  if (!collection) return transact((creations) => { const record = createRecord(input); creations.unshift(record); return record })
  const record = createRecord(input)
  await collection.insertOne({ ...record, _id: record.id })
  return record
}

export const saveCreation = persistCreation

/**
 * Return the creations belonging to a specific user, newest first.
 */
export const listUserCreations = async (userId) => {
  const collection = await mongoCollection()
  if (collection) return collection.find({ user_id: userId }).sort({ created_at: -1 }).toArray()
  await writeQueue
  const creations = await load()
  return structuredClone(creations.filter((item) => item.user_id === userId))
}

export const publicCreation = (record, viewerId) => ({
  id: record.id, type: record.type, prompt: record.prompt, content: record.content,
  mode: record.mode || 'demo', publish: record.publish, created_at: record.created_at,
  updated_at: record.updated_at, like_count: record.likes.length,
  liked_by_me: Boolean(viewerId && record.likes.includes(viewerId)),
})

/**
 * Return all published creations, newest first.
 */
export const listPublishedCreations = async (viewerId) => {
  const collection = await mongoCollection()
  if (collection) return (await collection.find({ publish: true }).sort({ created_at: -1 }).toArray()).map((item) => publicCreation(item, viewerId))
  await writeQueue
  const creations = await load()
  return creations.filter((item) => item.publish).map((item) => publicCreation(item, viewerId))
}

/**
 * Toggle whether a creation is published. Only the owner may change it.
 */
export const setPublished = (id, userId, publish) => transact((creations) => {
  const record = creations.find((item) => item.id === id && item.user_id === userId)

  if (!record) {
    return null
  }

  record.publish = Boolean(publish)
  record.updated_at = new Date().toISOString()
  return record
})

export const changePublished = async (id, userId, publish) => {
  const collection = await mongoCollection()
  if (!collection) return setPublished(id, userId, publish)
  return collection.findOneAndUpdate({ _id: id, user_id: userId }, { $set: { publish, updated_at: new Date().toISOString() } }, { returnDocument: 'after' })
}

export const deleteCreation = (id, userId) => transact((creations) => {
  const index = creations.findIndex((item) => item.id === id && item.user_id === userId)
  if (index === -1) return null
  return creations.splice(index, 1)[0]
})

export const removeCreation = async (id, userId) => {
  const collection = await mongoCollection()
  if (!collection) return deleteCreation(id, userId)
  const result = await collection.deleteOne({ _id: id, user_id: userId })
  return result.deletedCount ? true : null
}

/**
 * Toggle a like on a creation for a given user and return the updated record.
 */
export const toggleLike = (id, userId) => transact((creations) => {
  const record = creations.find((item) => item.id === id && item.publish)

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
  return publicCreation(record, userId)
})

export const changeLike = async (id, userId) => {
  const collection = await mongoCollection()
  if (!collection) return toggleLike(id, userId)
  const updated = await collection.findOneAndUpdate(
    { _id: id, publish: true },
    [{ $set: { likes: { $cond: [{ $in: [userId, '$likes'] }, { $setDifference: ['$likes', [userId]] }, { $concatArrays: ['$likes', [userId]] }] }, updated_at: new Date().toISOString() } }],
    { returnDocument: 'after' },
  )
  return updated ? publicCreation(updated, userId) : null
}
