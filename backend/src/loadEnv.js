import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Minimal .env loader so the backend picks up backend/.env without an extra
// dependency. Existing process.env values always win (do not overwrite).
export const loadEnv = (filePath) => {
  const resolved = path.resolve(filePath)

  if (!existsSync(resolved)) {
    return
  }

  const content = readFileSync(resolved, 'utf8')

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()

    if (!line || line.startsWith('#')) {
      continue
    }

    const eq = line.indexOf('=')
    if (eq <= 0) {
      continue
    }

    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

// Load backend/.env relative to this package (works regardless of cwd).
const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
loadEnv(path.join(backendRoot, '.env'))
