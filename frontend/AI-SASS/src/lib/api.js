import { API_BASE_URL } from '../config/env'

const endpointMap = {
  article: '/api/ai/article',
  title: '/api/ai/title',
  image: '/api/ai/image',
  resume: '/api/ai/resume',
  background: '/api/media/remove-background',
  object: '/api/media/remove-object',
}

export const submitToolRequest = async (outputType, values) => {
  const endpoint = endpointMap[outputType]

  if (!endpoint) {
    throw new Error('Unsupported tool type.')
  }

  const payload = Object.entries(values).reduce((body, [key, value]) => {
    body[key] = value instanceof File ? value.name : value
    return body
  }, {})

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok || !data.ok) {
    throw new Error(data.error || 'The backend request failed.')
  }

  return data.output
}
