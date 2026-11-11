# ORich API on Cloudflare (Worker + KV)

This Worker runs the ORich **JSON API** on Cloudflare (reusing the exact same logic
as `server/core.js`), with state persisted in a single **KV** document. By default
it is **API-only** — the user app and admin are deployed separately to **Cloudflare
Pages** (see `../DEPLOY.md`). It can optionally also serve the app + admin itself.

```
worker/
  src/index.js     # fetch handler → core.handleUser / core.handleAdmin, KV persistence
  wrangler.toml    # KV binding (+ optional static-assets binding)
  build.mjs        # (all-in-one only) builds app + admin into ./public
```

## Deploy (API-only — pairs with Pages front-ends)

```bash
cd worker
npm install
npx wrangler login
npx wrangler kv namespace create ORICH_KV   # paste the id into wrangler.toml
npm run deploy                              # just `wrangler deploy`
```

Gives e.g. `https://orich.<you>.workers.dev` serving:
- `/api/*`        → user API
- `/admin/api/*`  → admin API

Point the Pages builds at it: `VITE_API_BASE=https://orich.<you>.workers.dev/api`
and `VITE_ADMIN_API=https://orich.<you>.workers.dev/admin/api`. CORS is already open.

Harden: `npx wrangler secret put ORICH_HIDE_OTP` (=`1`), `ADMIN_USER`, `ADMIN_PASS`.

## Optional: one Worker serves everything (no Pages, one origin)

Uncomment the `[assets]` block in `wrangler.toml`, then:
```bash
npm run deploy:allinone     # builds app+admin into ./public, then deploys
```
Now `/` → app, `/admin` → admin, `/api/*` + `/admin/api/*` → API (same-origin, no CORS).

## Production hardening
```bash
npx wrangler secret put ORICH_HIDE_OTP      # value: 1  (hide demo OTP)
npx wrangler secret put ADMIN_USER
npx wrangler secret put ADMIN_PASS
```

## Notes / limits
- **State** is one KV document (`orich-state`); every request loads it and writes
  back once if anything changed. KV is eventually-consistent with ~1 write/sec per
  key — fine for a demo/low traffic. For heavy concurrency use a **Durable Object**
  or **D1** instead (same `core.js` logic, swap the store).
- **Uploads** are echoed back as data URLs (work as `<img src>`). To store real
  files, bind an **R2** bucket and return its URL from the store's `saveUpload`.
- No Node-only APIs are used by the core, so this runs on the standard Workers
  runtime (`nodejs_compat` is enabled only as a safety net).
