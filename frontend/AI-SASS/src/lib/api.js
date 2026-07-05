import { API_BASE_URL } from '../config/env'

const endpointMap = {
  article: '/api/ai/article',
  title: '/api/ai/title',
  image: '/api/ai/image',
  resume: '/api/ai/resume',
  background: '/api/media/remove-background',
  object: '/api/media/remove-object',
}

const buildHeaders = (userId) => {
  const headers = { 'content-type': 'application/json' }
  if (userId) {
    headers['x-user-id'] = userId
  }
  return headers
}

const request = async (path, { method = 'GET', body, userId } = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: buildHeaders(userId),
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok || data.ok === false) {
    throw new Error(data.error || 'The backend request failed.')
  }

  return data
}

export const submitToolRequest = async (outputType, values, userId) => {
  const endpoint = endpointMap[outputType]

  if (!endpoint) {
    throw new Error('Unsupported tool type.')
  }

  const payload = Object.entries(values).reduce((body, [key, value]) => {
    body[key] = value instanceof File ? value.name : value
    return body
  }, {})

  const data = await request(endpoint, { method: 'POST', body: payload, userId })
  return { output: data.output, id: data.id, mode: data.mode }
}

export const fetchCreations = async (userId) => {
  const data = await request('/api/creations', { userId })
  return data.creations || []
}

export const fetchCommunity = async () => {
  const data = await request('/api/community')
  return data.creations || []
}

export const publishCreation = async (id, userId, publish = true) => {
  const data = await request(`/api/creations/${id}/publish`, {
    method: 'POST',
    body: { publish },
    userId,
  })
  return data.creation
}

export const likeCreation = async (id, userId) => {
  const data = await request(`/api/creations/${id}/like`, { method: 'POST', userId })
  return data.creation
}
