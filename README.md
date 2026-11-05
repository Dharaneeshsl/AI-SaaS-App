# Quick AI

React workspace and Node.js API for articles, blog titles, images, image edits, resume reviews, saved creations, and a public community feed.

## Run

Requires Node.js 20+ and npm. From the repository root:

```sh
npm run install:all
npm run build
npm start
```

On Windows with PowerShell script execution disabled, use `npm.cmd`.

- Frontend: http://127.0.0.1:4173
- API health: http://127.0.0.1:8787/api/health

Without credentials, local development uses a shared demo guest and labeled sample results. Never use demo identity headers for real user data.

## Configure providers

Copy `backend/.env.example` to `backend/.env` and `frontend/AI-SASS/.env.example` to `frontend/AI-SASS/.env`. Rebuild after changing frontend settings.

| Variable | Purpose |
| --- | --- |
| `ANTHROPIC_API_KEY` | Live articles, titles, resume reviews, and image briefs |
| `AI_MODEL` | Claude model supported by your provider account |
| `OPENAI_API_KEY` | Actual image generation, background removal, and object removal |
| `IMAGE_MODEL` | Image model; defaults to `gpt-image-1.5` |
| `CLERK_SECRET_KEY` | Server verification of Clerk session tokens |
| `VITE_CLERK_PUBLISHABLE_KEY` | Frontend Clerk sign-in and configured billing UI |
| `FRONTEND_ORIGIN` | Allowed frontend origin |
| `ALLOW_DEMO_AUTH` | Explicit demo identity override; keep false in production |
| `DATA_DIR` | Creations storage directory, relative to backend process working directory |
| `TRUST_PROXY` | Trust forwarded IPs only behind your own reverse proxy |

The backend example defaults to production authentication. To run a local demo with that file, explicitly use `NODE_ENV=development` and `ALLOW_DEMO_AUTH=true`.

Image uploads include the actual file data. Both browser and server accept PNG, JPEG, or WebP up to 5 MB; the server checks signatures and rejects remote image URLs. Live media requests use the [OpenAI Images API](https://developers.openai.com/api/docs/guides/image-generation). Generated cutouts and object edits are model outputs and may change details of the original image.

Without OpenAI credentials, image generation produces a text brief and image edits return labeled SVG demonstrations. The demonstrations do not modify an upload. Configured providers return an error on failure instead of silently saving a sample as a successful live result. Automated provider tests use mocked responses; paid live requests are not part of verification.

## Saved creations and community

Generated results are private by default. The dashboard supports full result viewing, downloading, publishing, unpublishing, and confirmed deletion. Only owners can change publication or delete a result. Only published creations can be liked. Public responses expose aggregate like counts and the viewer's own like state, without owner or liker identifiers.

MongoDB stores production creations and shared monthly usage when configured. The local JSON store serializes mutations and atomically replaces its files; failed writes leave previous creation data intact. The JSON fallback supports one backend process. Configure backups, retention policies, and storage operations for your production database.

## Verify

```sh
npm run verify
npm run test:smoke
```

Verification checks backend module imports, API behavior, creation access controls, concurrent persistence, failed-write recovery, quota persistence, mocked image-provider contracts and errors, frontend syntax/imports, and the production build. Smoke tests start isolated local servers and check the built frontend, deep-link assets, API proxy, and shutdown. Run `npm run test:browser` separately for Chrome workspace interaction coverage.

## API

```text
GET  /api/health
POST /api/ai/article
POST /api/ai/title
POST /api/ai/image
POST /api/ai/resume
POST /api/media/remove-background
POST /api/media/remove-object
GET  /api/creations
GET  /api/community
POST /api/creations/:id/publish  { "publish": true | false }
POST /api/creations/:id/delete
POST /api/creations/:id/like
```

Protected requests require `Authorization: Bearer <Clerk session token>`. Development demo requests may use `x-user-id` when enabled. Media payloads use `imageData` (base64 data URL), optional `fileName`, and `objectName` for object removal.

The preview server proxies `/api` to `http://127.0.0.1:8787`; override with `API_PROXY_ORIGIN`. Set `FRONTEND_PORT` to change the root launcher's frontend port. Deployed builds use same-origin API requests when their configured backend URL is loopback. Configure a public API base or reverse proxy for deployment.

## Production configuration

MongoDB is selected with `MONGODB_URI` and `MONGODB_DATABASE` (default `quickai`). Creation ownership, publication, deletion, and likes use MongoDB operations when configured. Without a URI, local development uses JSON files.

Generation quotas are enforced before provider requests. Free users receive `FREE_MONTHLY_LIMIT` (default 10); verified Clerk user-plan claims matching `CLERK_PRO_PLAN_SLUG` (default `pro`) receive `PRO_MONTHLY_LIMIT` (default 500). All tools share the allowance. Quotas reset on UTC calendar-month boundaries, survive restarts, and are independent of creation deletion. Provider or save failures refund the reserved allowance. MongoDB quota updates are conditional atomic updates across API instances; local JSON quotas support one process.

Run `npm run test:browser` after building for Chrome regression coverage of generation, download, publication, likes, unpublication, deletion, deep links, and missing pages. Install Chrome on the machine running these tests.

Production credentials, database provisioning, Clerk Billing plan configuration, provider account access, deployment, backups, and live integration validation remain environment setup. The code can be reviewed and tested locally without sharing secrets. Automated checks do not certify live services or universal startup completeness.
