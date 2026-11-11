# ORich on Cloudflare (all-in-one Worker)

This Worker runs the **whole app on Cloudflare**: the JSON API (reusing the exact
same logic as `server/core.js`), plus the built user app (`/`) and admin (`/admin`)
as static assets — with state persisted in a single **KV** document.

```
worker/
  src/index.js     # fetch handler → core.handleUser / core.handleAdmin, KV persistence
  wrangler.toml    # assets + KV bindings
  build.mjs        # builds app + admin into ./public
```

## One-time setup

```bash
cd worker
npm install
npx wrangler login

# Create the KV namespace and copy the printed id into wrangler.toml (ORICH_KV id)
npx wrangler kv namespace create ORICH_KV
```

Edit `wrangler.toml` → set `kv_namespaces.id` to the id you just got.

## Build + deploy

```bash
npm run deploy      # builds app+admin into ./public, then `wrangler deploy`
```

That's it — one Worker serves:
- `https://orich.<you>.workers.dev/`        → user app
- `https://orich.<you>.workers.dev/admin`   → admin panel
- `https://orich.<you>.workers.dev/api/*`   → user API
- `https://orich.<you>.workers.dev/admin/api/*` → admin API

Same-origin, so the app's default `VITE_API_BASE=/api` and admin's
`VITE_ADMIN_API=/admin/api` just work (the build sets them).

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
