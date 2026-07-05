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
        console.warn('Anthropic SDK unavailable, falling back to demo mode:', error.message)
        return null
      })
  }

  return clientPromise
}

export const isLiveAiEnabled = () => config.hasAnthropicKey

/**
 * Generate text with Claude. Streams the response so large outputs do not hit
 * HTTP timeouts, and returns the concatenated text. Returns null when live AI
 * is not configured or the request fails, so callers can fall back to demo output.
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
      thinking: { type: 'adaptive' },
      output_config: { effort: 'medium' },
      system,
      messages: [{ role: 'user', content: prompt }],
    })

    const message = await stream.finalMessage()

    return message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim()
  } catch (error) {
    console.error('Anthropic request failed, using demo fallback:', error.message)
    return null
  }
}
