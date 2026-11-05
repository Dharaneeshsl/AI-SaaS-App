import { defineConfig } from '@playwright/test'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

export default defineConfig({
  testDir: './e2e', workers: 1, use: { baseURL: 'http://127.0.0.1:4173', channel: 'chrome' },
  webServer: [
    { command: 'node ../../backend/src/server.js', url: 'http://127.0.0.1:8787/api/health', env: {
      PORT: '8787', NODE_ENV: 'development', ALLOW_DEMO_AUTH: 'true', MONGODB_URI: '',
      ANTHROPIC_API_KEY: '', OPENAI_API_KEY: '', CLERK_SECRET_KEY: '', RATE_LIMIT_MAX: '1000',
      DATA_DIR: mkdtempSync(path.join(tmpdir(), 'quickai-browser-')),
    } },
    { command: 'node scripts/preview.cjs', url: 'http://127.0.0.1:4173', env: { PORT: '4173' } },
  ],
})
