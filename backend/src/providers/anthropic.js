import { config } from '../config.js'

// The Anthropic SDK is an optional dependency. It is loaded lazily so the
// backend still boots (in deterministic demo mode) on hosts where the package
// is not installed or the API key is not configured.
let clientPromise = null

const getClient = async () => {
  if (!config.hasAnthropicKey) {
    return null
  }

  if (!clientPromise) {
    clientPromise = import('@anthropic-ai/sdk')
      .then(({ default: Anthropic }) => new Anthropic({ apiKey: config.anthropicApiKey }))
      .catch((error) => {
        console.warn('Anthropic SDK unavailable:', error.name)
        throw Object.assign(new Error('Text provider unavailable.'), { status: 503 })
      })
  }

  return clientPromise
}

export const isLiveAiEnabled = () => config.hasAnthropicKey

/**
 * Generate text with Claude. Streams the response so large outputs do not hit
 * HTTP timeouts, and returns the concatenated text. Returns null when live AI
 * is not configured. Configured provider failures are reported to the caller.
 */
export const generateText = async ({ system, prompt, maxTokens = 2048 }) => {
  const client = await getClient()

  if (!client) {
    return null
  }

  try {
    const stream = client.messages.stream({
      model: config.anthropicModel,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: prompt }],
    })

    const message = await stream.finalMessage()

    const output = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim()
    if (!output) throw new Error('Provider returned no text.')
    return output
  } catch (error) {
    console.error('Anthropic request failed:', error.status || error.name)
    throw Object.assign(new Error('Text provider unavailable. Please try again later.'), { status: 502 })
  }
}
