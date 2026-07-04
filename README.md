# AI SaaS App

A full-stack AI SaaS starter with a production-ready React frontend and a Node.js backend API. The app includes authentication-ready UI, AI content tools, media tool endpoints, dashboard pages, community previews, local production builds, and verification scripts.

## Features

- AI Article Writer
- Blog Title Generator
- AI Image Prompt Generator
- Resume Reviewer
- Background Removal API placeholder
- Object Removal API placeholder
- Dashboard and community pages
- Clerk-ready authentication and billing UI
- Backend health check and tool APIs
- CORS, security headers, request body limits, and rate limiting
- Deterministic demo mode when provider env keys are not configured
- Production build pipeline with local static preview

## Project Structure

```text
AI-SaaS-App/
  backend/
    src/
      server.js
      routes.js
      services/
    scripts/
    package.json
    .env.example

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

Backend env:

```bash
PORT=8787
FRONTEND_ORIGIN=http://127.0.0.1:4173
NODE_ENV=production
OPENAI_API_KEY=
CLERK_SECRET_KEY=
```

The app runs without AI/provider keys in deterministic demo mode. Add real provider keys when you are ready to connect live AI generation, media processing, and protected backend auth.

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
```

Example request:

```bash
curl -X POST http://127.0.0.1:8787/api/ai/article \
  -H "Content-Type: application/json" \
  -d "{\"topic\":\"AI for founders\",\"tone\":\"Professional\",\"length\":\"Short\"}"
```

## Production Notes

- Configure `VITE_CLERK_PUBLISHABLE_KEY` for live Clerk authentication and billing UI.
- Configure `OPENAI_API_KEY` or your chosen provider keys to replace demo AI responses.
- Keep `FRONTEND_ORIGIN` locked to your deployed frontend domain in production.
- The backend currently provides provider-ready deterministic responses; plug real AI/media provider calls into `backend/src/services/ai.js`.

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
