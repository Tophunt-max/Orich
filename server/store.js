'use strict';
// Node (filesystem) store. Seeded once from state.js, persisted to data/state.json.
const fs = require('fs');
const path = require('path');
const seed = require('./db');
const freshState = require('./state');

const DATA_DIR = path.join(__dirname, 'data');
const FILE = path.join(DATA_DIR, 'state.json');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');

let state;
function load() {
  try { state = JSON.parse(fs.readFileSync(FILE, 'utf8')); }
  catch { state = freshState(seed); save(); }
  return state;
}
function save() {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(state, null, 2)); }
  catch (e) { console.error('state save failed:', e.message); }
}
function nextId(kind) { state.seq[kind] = (state.seq[kind] || 0) + 1; return state.seq[kind]; }

// Persist an uploaded image (data URL) to disk, return its served path.
function saveUpload(dataUrl) {
  const m = /^data:(image\/[\w+]+);base64,(.+)$/.exec(dataUrl || '');
  if (!m) return null;
  const ext = (m[1].split('/')[1] || 'png').replace('+xml', '');
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const name = 'up_' + Date.now() + Math.random().toString(36).slice(2, 7) + '.' + ext;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), Buffer.from(m[2], 'base64'));
  return '/uploads/' + name;
}

load();

module.exports = { get: () => state, save, nextId, reset: () => { state = freshState(seed); save(); }, img: seed.img, saveUpload };
