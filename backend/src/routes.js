import { config } from './config.js'
import { readJsonBody, sendCorsJson } from './http.js'
import {
  generateArticle,
  generateTitles,
  prepareBackgroundRemoval,
  prepareImagePrompt,
  prepareObjectRemoval,
  reviewResume,
} from './services/ai.js'

const ok = (output, meta = {}) => ({
  ok: true,
  output,
  mode: config.hasOpenAiKey ? 'provider-ready' : 'demo',
  ...meta,
})

const requirePost = (req) => {
  if (req.method !== 'POST') {
    const error = new Error('Method not allowed.')
    error.status = 405
    throw error
  }
}

export const routeRequest = async (req, res, pathname) => {
  if (req.method === 'GET' && pathname === '/api/health') {
    return sendCorsJson(res, 200, {
      ok: true,
      service: 'ai-sass-backend',
      env: config.nodeEnv,
      integrations: {
        openAiConfigured: config.hasOpenAiKey,
        clerkConfigured: config.hasClerkSecret,
      },
    })
  }

  if (pathname === '/api/ai/article') {
    requirePost(req)
    const body = await readJsonBody(req)
    return sendCorsJson(res, 200, ok(generateArticle(body)))
  }

  if (pathname === '/api/ai/title') {
    requirePost(req)
    const body = await readJsonBody(req)
    return sendCorsJson(res, 200, ok(generateTitles(body)))
  }

  if (pathname === '/api/ai/image') {
    requirePost(req)
    const body = await readJsonBody(req)
    return sendCorsJson(res, 200, ok(prepareImagePrompt(body)))
  }

  if (pathname === '/api/ai/resume') {
    requirePost(req)
    const body = await readJsonBody(req)
    return sendCorsJson(res, 200, ok(reviewResume(body)))
  }

  if (pathname === '/api/media/remove-background') {
    requirePost(req)
    const body = await readJsonBody(req)
    return sendCorsJson(res, 200, ok(prepareBackgroundRemoval(body)))
  }

  if (pathname === '/api/media/remove-object') {
    requirePost(req)
    const body = await readJsonBody(req)
    return sendCorsJson(res, 200, ok(prepareObjectRemoval(body)))
  }

  return sendCorsJson(res, 404, {
    ok: false,
    error: 'Route not found.',
  })
}
