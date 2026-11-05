import { API_BASE_URL } from '../config/env'

const endpointMap = {
  article: '/api/ai/article',
  title: '/api/ai/title',
  image: '/api/ai/image',
  resume: '/api/ai/resume',
  background: '/api/media/remove-background',
  object: '/api/media/remove-object',
}

const buildHeaders = (userId, token) => {
  const headers = { 'content-type': 'application/json' }
  if (token) {
    headers.authorization = `Bearer ${token}`
  } else if (userId) {
    headers['x-user-id'] = userId
  }
  return headers
}

const request = async (path, { method = 'GET', body, userId, token } = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: buildHeaders(userId, token),
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(150_000),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok || data.ok !== true) {
    throw new Error(data.error || 'The backend request failed.')
  }

  return data
}

export const submitToolRequest = async (outputType, values, userId, token) => {
  const endpoint = endpointMap[outputType]

  if (!endpoint) {
    throw new Error('Unsupported tool type.')
  }

  const payload = {}
  for (const [key, value] of Object.entries(values)) {
    if (value instanceof File) {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(value.type) || value.size > 5 * 1024 * 1024 || !value.size) {
        throw new Error('Choose a PNG, JPEG, or WebP image up to 5 MB.')
      }
      payload.fileName = value.name
      payload.imageData = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error('Could not read the selected image.'))
        reader.readAsDataURL(value)
      })
    } else {
      payload[key] = value
    }
  }

  const data = await request(endpoint, { method: 'POST', body: payload, userId, token })
  return { output: data.output, id: data.id, mode: data.mode }
}

export const fetchCreations = async (userId, token) => {
  const data = await request('/api/creations', { userId, token })
  return data.creations || []
}

export const fetchCommunity = async (userId, token) => {
  const data = await request('/api/community', { userId, token })
  return data.creations || []
}

export const publishCreation = async (id, userId, publish = true, token) => {
  const data = await request(`/api/creations/${id}/publish`, {
    method: 'POST',
    body: { publish },
    userId,
    token,
  })
  return data.creation
}

export const likeCreation = async (id, userId, token) => {
  const data = await request(`/api/creations/${id}/like`, { method: 'POST', userId, token })
  return data.creation
}

export const deleteCreation = (id, userId, token) =>
  request(`/api/creations/${id}/delete`, { method: 'POST', userId, token })
