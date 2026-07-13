import { config } from './config.js'
import { readJsonBody, sendCorsJson } from './http.js'
import { getUserId } from './auth.js'
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
  saveCreation,
  setPublished,
  toggleLike,
} from './services/store.js'

const mode = () => (config.hasAnthropicKey ? 'provider-live' : 'demo')

const ok = (output, meta = {}) => ({
  ok: true,
  output,
  mode: mode(),
  ...meta,
})

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
  const body = await readJsonBody(req)
  const userId = getUserId(req)
  const output = await generator(body)

  const creation = await saveCreation({
    userId,
    type,
    prompt: summarize(type, body),
    content: output,
    publish: publishByDefault,
  })

  return sendCorsJson(res, 200, ok(output, { id: creation.id }))
}

export const routeRequest = async (req, res, pathname) => {
  if (req.method === 'GET' && pathname === '/api/health') {
    return sendCorsJson(res, 200, {
      ok: true,
      service: 'ai-sass-backend',
      env: config.nodeEnv,
      integrations: {
        anthropicConfigured: config.hasAnthropicKey,
        aiMode: mode(),
        clerkConfigured: config.hasClerkSecret,
        openAiConfigured: config.hasOpenAiKey,
        mediaMode: 'demo-preview',
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
    const userId = getUserId(req)
    const creations = await listUserCreations(userId)
    return sendCorsJson(res, 200, { ok: true, creations })
  }

  // Publicly published creations (community feed).
  if (req.method === 'GET' && pathname === '/api/community') {
    const creations = await listPublishedCreations()
    return sendCorsJson(res, 200, { ok: true, creations })
  }

  // Toggle publish state for one of the user's own creations.
  const publishMatch = pathname.match(/^\/api\/creations\/([^/]+)\/publish$/)
  if (publishMatch) {
    requirePost(req)
    const userId = getUserId(req)
    const body = await readJsonBody(req)
    const record = await setPublished(publishMatch[1], userId, body.publish !== false)

    if (!record) {
      return sendCorsJson(res, 404, { ok: false, error: 'Creation not found.' })
    }

    return sendCorsJson(res, 200, { ok: true, creation: record })
  }

  // Toggle a like on any creation.
  const likeMatch = pathname.match(/^\/api\/creations\/([^/]+)\/like$/)
  if (likeMatch) {
    requirePost(req)
    const userId = getUserId(req)

    if (!userId) {
      return sendCorsJson(res, 401, { ok: false, error: 'Sign in to like creations.' })
    }

    const record = await toggleLike(likeMatch[1], userId)

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
