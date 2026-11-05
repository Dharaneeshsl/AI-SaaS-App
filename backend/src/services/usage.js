import { mkdir, readFile, writeFile, rename, unlink } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { config } from '../config.js'

let queue = Promise.resolve()
const directory = path.resolve(config.dataDir)
const file = path.join(directory, 'usage.json')

// Local single-process fallback. MongoDB performs equivalent conditional updates
// in the database, so multiple API instances share the same quota.
export const changeLocalUsage = (key, delta, limit) => {
  const operation = queue.then(async () => {
    let records = {}
    try { records = JSON.parse(await readFile(file, 'utf8')) }
    catch (error) { if (error.code !== 'ENOENT') throw error }
    const used = records[key] || 0
    if (delta > 0 && used >= limit) return null
    records[key] = Math.max(0, used + delta)
    await mkdir(directory, { recursive: true })
    const temporary = `${file}.${randomUUID()}.tmp`
    try {
      await writeFile(temporary, JSON.stringify(records), { mode: 0o600 })
      await rename(temporary, file)
    } finally { await unlink(temporary).catch(() => {}) }
    return records[key]
  })
  queue = operation.catch(() => {})
  return operation
}
