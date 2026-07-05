# AI SaaS App

A full-stack AI SaaS starter with a production-ready React frontend and a Node.js backend API. The app includes authentication-ready UI, live AI content tools powered by Claude, persisted creations, a real dashboard and community feed, media tool endpoints, local production builds, and verification scripts.

## Features

- AI Article Writer (live Claude generation)
- Blog Title Generator (live Claude generation)
- AI Image Prompt Generator (live Claude generation)
- Resume Reviewer (live Claude generation)
- Background Removal API placeholder
- Object Removal API placeholder
- Persisted creations with a real per-user dashboard
- Community feed with publish and like actions
- Clerk-ready authentication and billing UI
- Backend health check and tool APIs
- CORS, security headers, request body limits, and rate limiting
- Deterministic demo mode when no provider key is configured — switches to live Claude generation when `ANTHROPIC_API_KEY` is set
- Production build pipeline with local static preview

## How AI works

The backend calls Claude (`claude-opus-4-8` by default, via the official `@anthropic-ai/sdk`) for the article, title, image-prompt, and resume tools. When `ANTHROPIC_API_KEY` is not set — or a request fails — it falls back to deterministic demo output so the app is always fully functional with zero configuration. Set `ANTHROPIC_API_KEY` (and optionally `AI_MODEL`) in `backend/.env` to enable live generation.

Every generation is persisted through a JSON file store (`backend/data/creations.json`), scoped to the requesting user, and surfaced on the dashboard. Users can publish a creation to the community feed and like others' creations. Swap `backend/src/services/store.js` for a real database (Postgres, Mongo, etc.) to scale beyond a single instance.

## Project Structure

```text
AI-SaaS-App/
  backend/
    src/
      server.js
      routes.js
      config.js
      http.js
      rateLimit.js
      auth.js
      providers/
        anthropic.js       # live Claude client (optional, key-gated)
      services/
        ai.js              # AI tools: live Claude + demo fallback
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
        config/
        lib/
        pages/
      scripts/
      package.json
```

## Requirements

- Node.js 20 or newer
- npm
- Python 3, only for the frontend static preview script

## Environment

Frontend env:

```bash
VITE_CLERK_PUBLISHABLE_KEY=
VITE_API_BASE_URL=http://127.0.0.1:8787
```

Backend env (see `backend/.env.example`):

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

The app runs without any provider keys in deterministic demo mode. Set `ANTHROPIC_API_KEY` to connect live Claude generation; add `CLERK_SECRET_KEY` and image-provider keys when you are ready to enable protected backend auth and media processing.

## Install

Install frontend dependencies:

```bash
cd frontend/AI-SASS
npm install
```

Install backend dependencies:

```bash
cd ../../backend
npm install
```

## Run Locally

Start the backend:

```bash
cd backend
npm start
```

Build and preview the frontend:

```bash
cd frontend/AI-SASS
npm run build
npm run preview
```

Default URLs:

- Frontend: `http://127.0.0.1:4173`
- Backend health: `http://127.0.0.1:8787/api/health`

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

User identity is read from an `Authorization: Bearer <clerk-jwt>` header or an `x-user-id` header. The frontend sends the Clerk user id automatically when signed in. For hardened production, verify the Clerk JWT signature in `backend/src/auth.js` (e.g. with `@clerk/backend`).

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
- Live AI calls live in `backend/src/providers/anthropic.js`; media (background/object removal) still returns provider-ready placeholders — plug in an image-editing provider to complete them.
- Persistence uses a JSON file store (`backend/src/services/store.js`). Swap it for a managed database before running multiple backend instances.
- Harden `backend/src/auth.js` to verify the Clerk JWT signature before trusting user identity in production.

## Verification Status

The project was verified with:

- Frontend lint passing
- Frontend production build passing
- Frontend audit clean
- Backend lint passing
- Backend API tests passing
- Backend audit clean
- Full smoke test passing for frontend, backend health, and backend AI route

## License

Private project. Add a license before publishing publicly if needed.
