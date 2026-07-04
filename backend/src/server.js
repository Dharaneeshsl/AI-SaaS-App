import http from 'node:http'
import { config } from './config.js'
import { cleanupRateLimits, isRateLimited } from './rateLimit.js'
import { getClientIp, sendCorsJson, sendOptions } from './http.js'
import { routeRequest } from './routes.js'

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      return sendOptions(res)
    }

    const ip = getClientIp(req)

    if (isRateLimited(ip)) {
      return sendCorsJson(res, 429, {
        ok: false,
        error: 'Too many requests. Please try again shortly.',
      })
    }

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
    return await routeRequest(req, res, url.pathname)
  } catch (error) {
    return sendCorsJson(res, error.status || 500, {
      ok: false,
      error: error.status ? error.message : 'Unexpected server error.',
    })
  }
})

setInterval(cleanupRateLimits, 60_000).unref()

if (process.env.NODE_ENV !== 'test') {
  server.listen(config.port, () => {
    console.log(`AI SaaS backend listening on http://127.0.0.1:${config.port}`)
  })
}

export default server
