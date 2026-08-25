# AI SaaS App

A full-stack AI SaaS product with a production-ready React frontend and a Node.js backend API. Authentication-ready UI, live AI content tools powered by Claude, media tool previews, persisted creations, dashboard, community feed, local production builds, and verification scripts.

## Status

**All product features are complete.** The only thing left for you is optional environment configuration (API keys). The app runs fully in deterministic **demo mode** with zero keys.

| Area | Status |
|------|--------|
| Frontend pages & routing | Complete |
| Dashboard & community | Complete |
| AI Article / Titles / Image brief / Resume | Complete (live Claude when key set) |
| Background & object removal | Complete (visual demo previews) |
| Creations store, publish, likes | Complete |
| Auth UI (Clerk-ready) + guest demo mode | Complete |
| Backend health, CORS, rate limits, security headers | Complete |
| Lint, tests, production build | Complete |
| Environment keys | **You fill these in when ready** |

## Features

- AI Article Writer (live Claude generation)
- Blog Title Generator (live Claude generation)
- AI Image Prompt Generator (live Claude generation)
- Resume Reviewer (live Claude generation)
- Background Removal (visual SVG demo preview; provider-ready)
- Object Removal (visual SVG demo preview; provider-ready)
- Persisted creations with a real per-user dashboard
- Community feed with publish and like actions
- Clerk-ready authentication and billing UI (guest demo mode without keys)
- Backend health check and tool APIs
- CORS, security headers, request body limits, and rate limiting
- Deterministic demo mode when no provider key is configured — switches to live Claude generation when `ANTHROPIC_API_KEY` is set
- Production build pipeline with local static preview

## How AI works

The backend calls Claude (`claude-opus-4-8` by default, via the official `@anthropic-ai/sdk`) for the article, title, image-prompt, and resume tools. When `ANTHROPIC_API_KEY` is not set — or a request fails — it falls back to deterministic demo output so the app is always fully functional with zero configuration. Set `ANTHROPIC_API_KEY` (and optionally `AI_MODEL`) in `backend/.env` to enable live generation.

Media tools (background/object removal) return real visual SVG previews in demo mode so the UI, dashboard, and community feed work end-to-end without an image-editing provider.

Every generation is persisted through a JSON file store (`backend/data/creations.json`), scoped to the requesting user, and surfaced on the dashboard. Users can publish a creation to the community feed and like others' creations. Swap `backend/src/services/store.js` for a real database (Postgres, Mongo, etc.) to scale beyond a single instance.

## Project Structure

```text
AI-SaaS-App/
  package.json             # root one-command scripts (install:all, start, verify)
  scripts/
    start.cjs              # launches backend + frontend together
  backend/
    src/
      server.js
      loadEnv.js           # loads backend/.env automatically
      routes.js
      config.js
      http.js
      rateLimit.js
      auth.js
      providers/
        anthropic.js       # live Claude client (optional, key-gated)
      services/
        ai.js              # AI + media tools: live Claude + demo fallback
        store.js           # JSON file store for creations
    scripts/
    package.json
    .env.example
    data/                  # created at runtime (gitignored)

  frontend/
    AI-SASS/
      src/
        auth/
        components/
        config/            # runtime API base resolution (localhost vs deployed)
        lib/
        pages/
      scripts/
        preview.cjs        # static server + same-origin /api reverse proxy
      package.json
      .env.example
```

## Requirements

- Node.js 20 or newer
- npm
- Python 3, only for the frontend static preview script

## Environment (the only remaining step)

Copy the examples and add keys when you want live providers. **Empty values are fine** — demo mode covers everything.

Frontend (`frontend/AI-SASS/.env`):

```bash
VITE_CLERK_PUBLISHABLE_KEY=
VITE_API_BASE_URL=http://127.0.0.1:8787
```

Backend (`backend/.env` — already scaffolded; see `backend/.env.example`):

```bash
PORT=8787
FRONTEND_ORIGIN=http://127.0.0.1:4173
NODE_ENV=production
DATA_DIR=data
ANTHROPIC_API_KEY=
AI_MODEL=claude-opus-4-8
CLERK_SECRET_KEY=
OPENAI_API_KEY=
```

| Key | Purpose |
|-----|---------|
| `ANTHROPIC_API_KEY` | Live Claude generation for text tools |
| `VITE_CLERK_PUBLISHABLE_KEY` | Live Clerk sign-in / billing UI |
| `CLERK_SECRET_KEY` | Optional backend JWT hardening later |
| `OPENAI_API_KEY` | Optional future media provider |

## Install

One command from the repo root:

```bash
npm run install:all
```

(Or install each package manually: `cd frontend/AI-SASS && npm install`, then `cd ../../backend && npm install`.)

## Run Locally (one command)

```bash
npm start
```

This starts the backend API on `:8787` and the frontend on `:4173` together (building the frontend first if needed), and shuts both down on Ctrl+C.

Default URLs:

- Frontend: `http://127.0.0.1:4173`
- Backend health: `http://127.0.0.1:8787/api/health`

Or run each service separately:

```bash
cd backend && npm start
cd frontend/AI-SASS && npm run build && npm run preview
```

## Verify everything

```bash
npm run verify
```

Runs backend lint, backend API tests, frontend lint, and the frontend production build in one shot.

## Deployment / reverse proxy

The frontend resolves its API base at runtime:

- Served from **localhost** → uses `VITE_API_BASE_URL` directly (default `http://127.0.0.1:8787`, CORS handled by the backend).
- Served from **any non-localhost host** (preview URL, reverse proxy, production domain) → automatically switches to **same-origin relative** `/api` requests, so a loopback URL baked into the build can never point at the visitor's own machine. The preview server (`npm run preview`) already proxies `/api/*` to `http://127.0.0.1:8787` (override with `API_PROXY_ORIGIN`). In production, point your reverse proxy's `/api` route at the backend, or set `VITE_API_BASE_URL` to your API's full public domain.

## Scripts

Frontend:

```bash
npm run lint
npm run build
npm run preview
npm audit
```

Backend:

```bash
npm run lint
npm test
npm start
npm audit
```

## API Endpoints

```text
GET  /api/health
POST /api/ai/article
POST /api/ai/title
POST /api/ai/image
POST /api/ai/resume
POST /api/media/remove-background
POST /api/media/remove-object
GET  /api/creations                 # creations owned by the requesting user
GET  /api/community                 # published creations
POST /api/creations/:id/publish     # publish/unpublish your creation
POST /api/creations/:id/like        # toggle a like
```

User identity is read from an `Authorization: Bearer <clerk-jwt>` header or an `x-user-id` header. The frontend sends the Clerk user id automatically when signed in (or `demo-guest` in demo mode). For hardened production, verify the Clerk JWT signature in `backend/src/auth.js` (e.g. with `@clerk/backend`).

Example request:

```bash
curl -X POST http://127.0.0.1:8787/api/ai/article \
  -H "Content-Type: application/json" \
  -d "{\"topic\":\"AI for founders\",\"tone\":\"Professional\",\"length\":\"Short\"}"
```

## Production Notes

- Configure `VITE_CLERK_PUBLISHABLE_KEY` for live Clerk authentication and billing UI.
- Configure `ANTHROPIC_API_KEY` (and optionally `AI_MODEL`) to enable live Claude generation; without it the AI tools run in deterministic demo mode.
- Keep `FRONTEND_ORIGIN` locked to your deployed frontend domain in production.
- Media tools return visual demo previews out of the box; plug in an image-editing provider later for photoreal cutouts.
- Persistence uses a JSON file store (`backend/src/services/store.js`). Swap it for a managed database before running multiple backend instances.
- Harden `backend/src/auth.js` to verify the Clerk JWT signature before trusting user identity in production.

## Verification Status

The project was verified with:

- Frontend lint passing
- Frontend production build passing
- Backend lint passing
- Backend API tests passing (including media, resume, image, creations, likes)
- Full smoke path for frontend, backend health, and backend AI/media routes
- Live end-to-end run: both servers up, all 6 tools, publish/like/community, dashboard scoping, SPA deep links, and same-origin `/api` proxying all verified

## License

Private project. Add a license before publishing publicly if needed.
