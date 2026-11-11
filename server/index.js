'use strict';
/**
 * ORich backend — Node.js adapter around the runtime-agnostic core (./core.js).
 * Serves the JSON API plus the built app/admin static files and uploads.
 *   node server/index.js   -> http://localhost:8788
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const store = require('./store');
const seed = require('./db');
const createCore = require('./core');

const core = createCore(store, seed, { hideOtp: process.env.ORICH_HIDE_OTP === '1' });
const PORT = Number(process.env.PORT || 8788);

const APP_DIR = path.join(__dirname, '..', 'app', 'dist');
const ADMIN_DIR = path.join(__dirname, '..', 'admin', 'dist');
const UPLOAD_DIR = path.join(__dirname, 'data', 'uploads');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.ttf': 'font/ttf', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
function serveStatic(res, root, urlPath, spa) {
  let rel = decodeURIComponent(urlPath.split('?')[0]);
  if (rel.endsWith('/')) rel += 'index.html';
  let file = path.join(root, rel);
  if (!file.startsWith(root)) return false;
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    if (!spa) return false;
    const idx = path.join(root, 'index.html');
    if (!fs.existsSync(idx)) return false;
    file = idx;
  }
  const body = fs.readFileSync(file);
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Content-Length': body.length });
  res.end(body);
  return true;
}
function send(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body), 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, token, Authorization, lang', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Cache-Control': 'no-store' });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve) => { let raw = ''; req.on('data', (c) => { raw += c; if (raw.length > 4e6) req.destroy(); }); req.on('end', () => { if (!raw) return resolve({}); try { resolve(JSON.parse(raw)); } catch { resolve(Object.fromEntries(new URLSearchParams(raw))); } }); });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const body = { ...Object.fromEntries(url.searchParams), ...(await readBody(req)) };
  try {
    if (url.pathname.startsWith('/uploads/') && req.method === 'GET') {
      if (serveStatic(res, UPLOAD_DIR, url.pathname.replace('/uploads', '') || '/', false)) return;
      return send(res, 404, { code: 0, msg: 'Not found', data: null });
    }
    if (url.pathname.startsWith('/admin/api/')) {
      const key = req.method + ' /' + url.pathname.replace(/^\/admin\/api\//, '');
      const { status, json } = core.handleAdmin(key, body, req.headers);
      return send(res, status, json);
    }
    if (url.pathname.startsWith('/api/')) {
      const { status, json } = core.handleUser(url.pathname.replace(/^\/api/, ''), body, req.headers);
      return send(res, status, json);
    }
    // static SPA (production / single-origin preview)
    if (req.method === 'GET') {
      if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
        if (fs.existsSync(ADMIN_DIR) && serveStatic(res, ADMIN_DIR, url.pathname.replace(/^\/admin/, '') || '/', true)) return;
      } else if (fs.existsSync(APP_DIR) && serveStatic(res, APP_DIR, url.pathname, true)) return;
    }
    return send(res, 404, { code: 0, msg: 'Not found', data: null });
  } catch (e) {
    return send(res, 200, { code: 0, msg: 'Server error: ' + e.message, data: null });
  }
});

server.listen(PORT, () => {
  console.log(`ORich real API → http://localhost:${PORT}`);
  console.log('  user:  POST /api/index/index');
  console.log('  admin: POST /admin/api/login  (admin / admin123)');
});
