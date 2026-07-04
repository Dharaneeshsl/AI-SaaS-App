import { config } from './config.js'

const buckets = new Map()

export const isRateLimited = (key) => {
  const now = Date.now()
  const current = buckets.get(key)

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + config.rateLimitWindowMs })
    return false
  }

  current.count += 1
  return current.count > config.rateLimitMax
}

export const cleanupRateLimits = () => {
  const now = Date.now()

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key)
    }
  }
}
