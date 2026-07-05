import { config } from './config.js'

const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'no-referrer',
}

export const sendJson = (res, status, payload) => {
  res.writeHead(status, jsonHeaders)
  res.end(JSON.stringify(payload))
}

export const sendOptions = (res) => {
  res.writeHead(204, corsHeaders())
  res.end()
}

export const corsHeaders = () => ({
  ...jsonHeaders,
  'access-control-allow-origin': config.frontendOrigin === '*' ? '*' : config.frontendOrigin,
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type,authorization,x-user-id',
  'access-control-max-age': '86400',
})

export const sendCorsJson = (res, status, payload) => {
  res.writeHead(status, corsHeaders())
  res.end(JSON.stringify(payload))
}

export const readJsonBody = async (req) => {
  const chunks = []
  let size = 0

  for await (const chunk of req) {
    size += chunk.length

    if (size > config.maxBodyBytes) {
      const error = new Error('Request body is too large.')
      error.status = 413
      throw error
    }

    chunks.push(chunk)
  }

  if (chunks.length === 0) {
    return {}
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    const error = new Error('Request body must be valid JSON.')
    error.status = 400
    throw error
  }
}

export const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for']

  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }

  return req.socket.remoteAddress || 'unknown'
}
