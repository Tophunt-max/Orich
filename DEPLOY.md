# Deploying ORich (app + admin + backend)

The project has three deployable parts:

| Part | Path | Type | Build output |
|------|------|------|--------------|
| User app | `app/` | Vue 3 SPA (hash routing) | `app/dist` |
| Admin panel | `admin/` | Vue 3 SPA | `admin/dist` |
| Backend API | `server/` | Node.js HTTP server + JSON file persistence | — |

> **Important:** the backend is a plain Node.js server that writes state to
> `server/data/state.json` on disk. It needs a **Node runtime with a persistent
> filesystem** (or a mounted volume). It does **not** run on Cloudflare
> Workers/Pages Functions as-is (those are V8 isolates without `http.createServer`
> or a local filesystem). See the two options below.

---

## Option A (recommended): Frontend on Cloudflare Pages, backend on a Node host

Least effort — nothing in the code needs to change.

### 1. Backend → any Node host (Render / Railway / Fly.io / a VPS / Docker)
A `Dockerfile` and `docker-compose.yml` are included.

```bash
# On the server (Docker):
docker compose up -d        # serves API (and the built app+admin) on :8788
```

Set these environment variables in production:

| Var | Purpose | Example |
|-----|---------|---------|
| `PORT` | listen port | `8788` |
| `ORICH_HIDE_OTP` | hide the demo OTP from the API response | `1` |
| `ADMIN_USER` | admin username | `admin` |
| `ADMIN_PASS` | admin password | `a-strong-secret` |

Persist `server/data` (the compose file already mounts a named volume
`orich-data`). Note the backend's public URL, e.g. `https://api.example.com`.

> On PaaS free tiers that have an ephemeral disk (e.g. Render free), mount a
> persistent disk/volume for `server/data`, otherwise state resets on redeploy.

### 2. User app → Cloudflare Pages
Create a Pages project from this repo:
- **Root directory:** `app`
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Environment variable:** `VITE_API_BASE = https://api.example.com/api`

(The app uses hash routing, so no SPA redirect rules are needed.)

### 3. Admin panel → Cloudflare Pages (second project)
- **Root directory:** `admin`
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Environment variable:** `VITE_ADMIN_API = https://api.example.com/admin/api`

### 4. CORS
The backend already sends `Access-Control-Allow-Origin: *` and allows the
`Content-Type, token, Authorization, lang` headers, so the split origin works.
To lock it down, replace `*` with your Pages domain in `server/index.js`
(`send()` → `Access-Control-Allow-Origin`).

---

## Option B: Everything on Cloudflare (Worker + KV) — READY

This is **already implemented** in [`worker/`](worker/). One Cloudflare Worker serves
the API **and** the static app + admin, with state in a single **KV** document. It
reuses the exact same logic as the Node server (`server/core.js`) — only the store
(fs → KV) and transport (http → `fetch`) differ.

```bash
cd worker
npm install
npx wrangler login
npx wrangler kv namespace create ORICH_KV   # paste the id into wrangler.toml
npm run deploy                              # builds app+admin → ./public, then deploys
```

Result (one origin):
- `/`            → user app
- `/admin`       → admin panel
- `/api/*`       → user API
- `/admin/api/*` → admin API

Hardening: `npx wrangler secret put ORICH_HIDE_OTP` (=`1`), `ADMIN_USER`, `ADMIN_PASS`.

See [`worker/README.md`](worker/README.md) for details and limits (KV write rate,
uploads → R2, or switch the store to a Durable Object / D1 for heavy concurrency).

---

## Local production preview (single origin)

The Node server also serves the built static app and admin, so you can run the
whole thing from one origin locally:

```bash
(cd app && npm run build)
(cd admin && VITE_ADMIN_API=/admin/api npm run build)
node server/index.js
# →  app:   http://localhost:8788/
#    admin: http://localhost:8788/admin/
#    api:   http://localhost:8788/api/...
```
