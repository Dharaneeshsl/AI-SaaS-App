const parseNumber = (value, fallback, minimum = 1) => {
  if (value === undefined || String(value).trim() === '') return fallback
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed >= minimum ? parsed : fallback
}

export const config = {
  port: parseNumber(process.env.PORT, 8787, 0),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://127.0.0.1:4173',
  nodeEnv: process.env.NODE_ENV || 'development',
  // Media tool payloads can include longer prompts / metadata; keep headroom.
  maxBodyBytes: parseNumber(process.env.MAX_BODY_BYTES, 8_000_000),
  rateLimitWindowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
  rateLimitMax: parseNumber(process.env.RATE_LIMIT_MAX, 90),
  trustProxy: process.env.TRUST_PROXY === 'true',
  allowDemoAuth: process.env.ALLOW_DEMO_AUTH === 'true' || (process.env.ALLOW_DEMO_AUTH !== 'false' && (process.env.NODE_ENV || 'development') !== 'production'),
  hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  imageModel: process.env.IMAGE_MODEL || 'gpt-image-1.5',
  hasClerkSecret: Boolean(process.env.CLERK_SECRET_KEY),
  clerkSecretKey: process.env.CLERK_SECRET_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  hasAnthropicKey: Boolean(process.env.ANTHROPIC_API_KEY),
  anthropicModel: process.env.AI_MODEL || 'claude-opus-4-8',
  dataDir: process.env.DATA_DIR || 'data',
  mongoUri: process.env.MONGODB_URI || '',
  mongoDatabase: process.env.MONGODB_DATABASE || 'quickai',
  freeMonthlyLimit: parseNumber(process.env.FREE_MONTHLY_LIMIT, 10),
  proMonthlyLimit: parseNumber(process.env.PRO_MONTHLY_LIMIT, 500),
  proPlanSlug: process.env.CLERK_PRO_PLAN_SLUG || 'pro',
}
