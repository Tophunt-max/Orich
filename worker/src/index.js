// Cloudflare Worker adapter for the ORich API — reuses the exact same core
// logic as the Node server (../../server/core.js), with state persisted in a
// single KV document. All mutations during a request are flushed to KV once.
import createCore from '../../server/core.js';
import seed from '../../server/db.js';
import freshState from '../../server/state.js';

const STATE_KEY = 'orich-state';

function makeStore(state) {
  let dirty = false;
  return {
    get: () => state,
    save: () => { dirty = true; },
    nextId: (k) => { state.seq[k] = (state.seq[k] || 0) + 1; return state.seq[k]; },
    img: seed.img,
    // Images are echoed back as data URLs (works directly as <img src>). To persist
    // to object storage instead, bind an R2 bucket and write here, returning its URL.
    saveUpload: () => null,
    _dirty: () => dirty,
  };
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, token, Authorization, lang',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Cache-Control': 'no-store',
};
const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS } });

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    const url = new URL(request.url);
    const isApi = url.pathname.startsWith('/api/');
    const isAdminApi = url.pathname.startsWith('/admin/api/');

    // Non-API paths → static assets (built app at /, admin at /admin).
    if (!isApi && !isAdminApi) {
      if (env.ASSETS) return env.ASSETS.fetch(request);
      return json({ code: 0, msg: 'Not found', data: null }, 404);
    }

    // Load state from KV (single document); seed on first run.
    const raw = await env.ORICH_KV.get(STATE_KEY);
    const state = raw ? JSON.parse(raw) : freshState(seed);
    const store = makeStore(state);
    const core = createCore(store, seed, { hideOtp: env.ORICH_HIDE_OTP === '1' });

    // Merge JSON body + query params.
    let body = {};
    if (request.method === 'POST') { try { body = await request.json(); } catch { body = {}; } }
    for (const [k, v] of url.searchParams) if (body[k] === undefined) body[k] = v;
    const headers = { token: request.headers.get('token') || '', authorization: request.headers.get('authorization') || '', lang: request.headers.get('lang') || '' };

    let out;
    if (isAdminApi) {
      out = core.handleAdmin(request.method + ' /' + url.pathname.replace(/^\/admin\/api\//, ''), body, headers);
    } else {
      out = core.handleUser(url.pathname.replace(/^\/api/, ''), body, headers);
    }

    // Persist all mutations from this request in a single KV write.
    if (store._dirty()) await env.ORICH_KV.put(STATE_KEY, JSON.stringify(state));
    return json(out.json, out.status);
  },
};
