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

## Option B: Everything on Cloudflare (backend → Worker + D1/KV)

If you want it 100% on Cloudflare, the backend must be re-implemented as a
**Cloudflare Worker** (a `fetch(request, env)` handler) with storage moved from
`server/data/state.json` to **D1** (SQLite) or **KV**:

1. Create the Worker: `npm create cloudflare@latest orich-api` and add a `wrangler.toml`.
2. Move the route table from `server/index.js` into the Worker's `fetch` handler
   (the request/response shapes stay identical: `POST /api/index/*`, `{code,msg,data}`).
3. Replace `store.js` (fs read/write) with D1 queries or a KV document:
   - D1: `wrangler d1 create orich` then persist each collection in tables.
   - KV: store the whole state blob under one key (simplest port of the current model).
4. Deploy: `wrangler deploy`. Point the Pages apps' `VITE_API_BASE` /
   `VITE_ADMIN_API` at the Worker URL (same-origin via a `/api` route, or a
   separate subdomain).

This is a focused porting task (logic reuses cleanly; only persistence changes).

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
