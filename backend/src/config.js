const parseNumber = (value, fallback) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const config = {
  port: parseNumber(process.env.PORT, 8787),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://127.0.0.1:4173',
  nodeEnv: process.env.NODE_ENV || 'development',
  maxBodyBytes: parseNumber(process.env.MAX_BODY_BYTES, 1_000_000),
  rateLimitWindowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
  rateLimitMax: parseNumber(process.env.RATE_LIMIT_MAX, 90),
  hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
  hasClerkSecret: Boolean(process.env.CLERK_SECRET_KEY),
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  hasAnthropicKey: Boolean(process.env.ANTHROPIC_API_KEY),
  anthropicModel: process.env.AI_MODEL || 'claude-opus-4-8',
  dataDir: process.env.DATA_DIR || 'data',
}
