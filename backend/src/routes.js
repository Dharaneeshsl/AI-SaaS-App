import { config } from './config.js'
import { readJsonBody, sendCorsJson } from './http.js'
import { getUserId } from './auth.js'
import { decodeImage } from './providers/images.js'
import {
  generateArticle,
  generateTitles,
  prepareBackgroundRemoval,
  prepareImagePrompt,
  prepareObjectRemoval,
  reviewResume,
} from './services/ai.js'
import {
  listPublishedCreations,
  listUserCreations,
  persistCreation,
  changePublished,
  changeLike,
  removeCreation,
  reserveGeneration,
} from './services/store.js'

const ok = (output, meta = {}) => ({
  ok: true,
  output,
  ...meta,
})

const invalid = (message) => {
  const error = new Error(message)
  error.status = 400
  return error
}

const optionalText = (body, field, maxLength) => {
  if (body[field] === undefined || body[field] === null || body[field] === '') {
    return
  }
  if (typeof body[field] !== 'string') {
    throw invalid(`${field} must be a string.`)
  }
  if (body[field].trim().length > maxLength) {
    throw invalid(`${field} must be ${maxLength} characters or fewer.`)
  }
}

const validateToolInput = (type, body) => {
  const limits = {
    article: { topic: 500, tone: 80, length: 40 },
    'blog-title': { keyword: 300, category: 100 },
    image: { prompt: 600, style: 100 },
    resume: { role: 200, resume: 12_000 },
    'background-removal': { fileName: 255, image: 255 },
    'object-removal': { fileName: 255, image: 255, objectName: 300 },
  }[type]

  for (const [field, maxLength] of Object.entries(limits || {})) {
    optionalText(body, field, maxLength)
  }

  if (type === 'background-removal' || type === 'object-removal') {
    decodeImage(body.imageData)
    if (type === 'object-removal' && !body.objectName?.trim()) throw invalid('Describe the object to remove.')
  } else {
    const required = { article: 'topic', 'blog-title': 'keyword', image: 'prompt', resume: 'resume' }[type]
    if (required && !body[required]?.trim()) throw invalid(`${required} is required.`)
  }
}

const mode = (result) => result?.mode || (config.hasAnthropicKey ? 'provider-live' : 'demo')

const requirePost = (req) => {
  if (req.method !== 'POST') {
    const error = new Error('Method not allowed.')
    error.status = 405
    throw error
  }
}

// A short prompt summary stored alongside each creation for the dashboard/community feeds.
const summarize = (type, body) => {
  switch (type) {
    case 'article':
      return `Article: ${body.topic || 'Untitled topic'}`
    case 'blog-title':
      return `Blog titles for "${body.keyword || 'AI growth'}" (${body.category || 'General'})`
    case 'image':
      return body.prompt || 'AI image brief'
    case 'resume':
      return `Resume review for ${body.role || 'target role'}`
    case 'background-removal':
      return `Background removal: ${body.image || body.fileName || 'image'}`
    case 'object-removal':
      return `Object removal: ${body.objectName || 'object'}`
    default:
      return type
  }
}

// Run an AI tool, persist the result as a creation, and respond.
const handleTool = async (req, res, { type, generator, publishByDefault = false }) => {
  requirePost(req)
  const userId = await getUserId(req)

  if (!userId) {
    return sendCorsJson(res, 401, { ok: false, error: 'Authentication is required.' })
  }

  const body = await readJsonBody(req)
  validateToolInput(type, body)
  const usage = await reserveGeneration(userId, req.plan || 'free')
  if (!usage.allowed) return sendCorsJson(res, 429, { ok: false, error: `Monthly generation limit reached (${usage.limit}). Resets next month.`, limit: usage.limit, month: usage.month })
  let result
  try {
    result = await generator(body)
  } catch (error) {
    await usage.release()
    throw error
  }
  const output = result.output

  let creation
  try {
  creation = await persistCreation({
    userId,
    type,
    prompt: summarize(type, body),
    content: output,
    mode: mode(result),
    publish: publishByDefault,
  })
  } catch (error) {
    await usage.release()
    throw error
  }

  return sendCorsJson(res, 200, ok(output, { id: creation.id, mode: mode(result), usage: { limit: usage.limit, month: usage.month } }))
}

export const routeRequest = async (req, res, pathname) => {
  if (req.method === 'GET' && pathname === '/api/health') {
    return sendCorsJson(res, 200, {
      ok: true,
      service: 'ai-sass-backend',
      env: config.nodeEnv,
      integrations: {
        anthropicConfigured: config.hasAnthropicKey,
        aiMode: config.hasAnthropicKey ? 'provider-live' : 'demo',
        clerkConfigured: config.hasClerkSecret,
        openAiConfigured: config.hasOpenAiKey,
        mediaMode: config.hasOpenAiKey ? 'provider-live' : 'demo-preview',
      },
    })
  }

  if (pathname === '/api/ai/article') {
    return handleTool(req, res, { type: 'article', generator: generateArticle })
  }

  if (pathname === '/api/ai/title') {
    return handleTool(req, res, { type: 'blog-title', generator: generateTitles })
  }

  if (pathname === '/api/ai/image') {
    return handleTool(req, res, { type: 'image', generator: prepareImagePrompt })
  }

  if (pathname === '/api/ai/resume') {
    return handleTool(req, res, { type: 'resume', generator: reviewResume })
  }

  if (pathname === '/api/media/remove-background') {
    return handleTool(req, res, { type: 'background-removal', generator: prepareBackgroundRemoval })
  }

  if (pathname === '/api/media/remove-object') {
    return handleTool(req, res, { type: 'object-removal', generator: prepareObjectRemoval })
  }

  // Creations owned by the requesting user (dashboard feed).
  if (req.method === 'GET' && pathname === '/api/creations') {
    const userId = await getUserId(req)
    if (!userId) {
      return sendCorsJson(res, 401, { ok: false, error: 'Authentication is required.' })
    }
    const creations = await listUserCreations(userId)
    return sendCorsJson(res, 200, { ok: true, creations })
  }

  // Publicly published creations (community feed).
  if (req.method === 'GET' && pathname === '/api/community') {
    const creations = await listPublishedCreations(await getUserId(req))
    return sendCorsJson(res, 200, { ok: true, creations })
  }

  // Toggle publish state for one of the user's own creations.
  const publishMatch = pathname.match(/^\/api\/creations\/([^/]+)\/publish$/)
  if (publishMatch) {
    requirePost(req)
    const userId = await getUserId(req)
    if (!userId) {
      return sendCorsJson(res, 401, { ok: false, error: 'Authentication is required.' })
    }
    const body = await readJsonBody(req)
    if (typeof body.publish !== 'boolean') throw invalid('publish must be a boolean.')
    const record = await changePublished(publishMatch[1], userId, body.publish)

    if (!record) {
      return sendCorsJson(res, 404, { ok: false, error: 'Creation not found.' })
    }

    return sendCorsJson(res, 200, { ok: true, creation: record })
  }

  const deleteMatch = pathname.match(/^\/api\/creations\/([^/]+)\/delete$/)
  if (deleteMatch) {
    requirePost(req)
    const userId = await getUserId(req)
    if (!userId) return sendCorsJson(res, 401, { ok: false, error: 'Authentication is required.' })
    const record = await removeCreation(deleteMatch[1], userId)
    if (!record) return sendCorsJson(res, 404, { ok: false, error: 'Creation not found.' })
    return sendCorsJson(res, 200, { ok: true })
  }

  // Only published creations can be liked.
  const likeMatch = pathname.match(/^\/api\/creations\/([^/]+)\/like$/)
  if (likeMatch) {
    requirePost(req)
    const userId = await getUserId(req)

    if (!userId) {
      return sendCorsJson(res, 401, { ok: false, error: 'Sign in to like creations.' })
    }

    const record = await changeLike(likeMatch[1], userId)

    if (!record) {
      return sendCorsJson(res, 404, { ok: false, error: 'Creation not found.' })
    }

    return sendCorsJson(res, 200, { ok: true, creation: record })
  }

  return sendCorsJson(res, 404, {
    ok: false,
    error: 'Route not found.',
  })
}
