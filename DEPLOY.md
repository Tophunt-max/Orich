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

## Option B: Everything on Cloudflare — READY

Three Cloudflare pieces, all included and configured:

| Piece | Cloudflare product | Config |
|-------|--------------------|--------|
| User app | **Pages** | `app/wrangler.toml` |
| Admin panel | **Pages** | `admin/wrangler.toml` |
| API (+ KV state) | **Worker** | `worker/wrangler.toml` |

The Worker reuses the exact same logic as the Node server (`server/core.js`) — only
the store (fs → KV) and transport (http → `fetch`) differ.

### 1. Deploy the API Worker
```bash
cd worker
npm install
npx wrangler login
npx wrangler kv namespace create ORICH_KV   # paste the id into worker/wrangler.toml
npm run deploy                              # API-only deploy
```
Note the URL, e.g. `https://orich.<you>.workers.dev`. Harden:
```bash
npx wrangler secret put ORICH_HIDE_OTP   # value: 1
npx wrangler secret put ADMIN_USER
npx wrangler secret put ADMIN_PASS
```

### 2. Deploy the user app to Pages
```bash
cd app
VITE_API_BASE=https://orich.<you>.workers.dev/api npm run build
npx wrangler pages deploy dist            # project: orich-app
```
(Or connect the repo in the Pages dashboard: root dir `app`, build `npm run build`,
output `dist`, env var `VITE_API_BASE=https://orich.<you>.workers.dev/api`.)

### 3. Deploy the admin to Pages
```bash
cd admin
VITE_ADMIN_API=https://orich.<you>.workers.dev/admin/api npm run build
npx wrangler pages deploy dist            # project: orich-admin
```
(Dashboard: root dir `admin`, build `npm run build`, output `dist`,
env var `VITE_ADMIN_API=https://orich.<you>.workers.dev/admin/api`.)

### CORS
The Worker already sends `Access-Control-Allow-Origin: *` and allows the
`Content-Type, token, Authorization, lang` headers, so the Pages front-ends call the
Worker cross-origin without extra setup. To lock it down, replace `*` in
`server/core.js`-based responses… (the Worker sets CORS in `worker/src/index.js` →
`CORS` object) with your Pages domains.

### Prefer a single Worker instead of Pages?
The Worker can also serve the app + admin itself (one origin, no CORS): populate its
assets and enable the binding — see [`worker/README.md`](worker/README.md)
(`npm run deploy:allinone`, and uncomment `[assets]` in `worker/wrangler.toml`).

**Limits:** KV is eventually-consistent with ~1 write/sec per key — fine for a
demo/low traffic. For heavy concurrency switch the store to a **Durable Object** or
**D1** (same `core.js`). Uploads are echoed as data URLs; bind **R2** for real files.

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
