'use strict';
// Mutable, disk-persisted app state. Seeded once from db.js, then edited at runtime
// by both the user API (joins, recharges) and the admin API (CRUD). Saved to
// data/state.json so admin changes survive restarts and show up in the user app.
const fs = require('fs');
const path = require('path');
const seed = require('./db');

const DATA_DIR = path.join(__dirname, 'data');
const FILE = path.join(DATA_DIR, 'state.json');

function freshState() {
  return {
    products: seed.products.map((p) => ({ ...p })),
    winners: seed.winners.map((w) => ({ ...w })),
    finances: seed.finances.map((f) => ({ ...f })),
    tasks: seed.tasks.map((t) => ({ ...t })),
    vipTiers: seed.vipTiers.map((v) => ({ ...v })),
    luckyDraws: seed.luckyDraws.map((l) => ({ ...l })),
    prizes: seed.prizes.map((p) => ({ ...p })),
    games: seed.games.map((g) => ({ ...g })),
    rechargeOptions: [...seed.rechargeOptions],
    settings: {
      name: 'ORich',
      notice: 'Lucky draw for iPhone 15 Pro Max closes soon — join now!',
      service: 'https://wa.me/910000000000',
      tabBarColor: '#17273a',
      tabBarActive: '#de6436',
    },
    users: [],   // { id, phone, nickname, avatar, balance, frozen, inviteCode, teamCount, invitedBy, createdAt }
    orders: [],  // { id, userId, type, product, shares, amount, status, date }
    admins: [{ username: 'admin', password: 'admin123', name: 'Administrator' }],
    seq: { user: 0, order: 0, product: seed.products.length, winner: 200, finance: seed.finances.length, vip: seed.vipTiers.length, lucky: seed.luckyDraws.length },
  };
}

let state;
function load() {
  try {
    state = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    state = freshState();
    save();
  }
  return state;
}

function save() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.error('state save failed:', e.message);
  }
}

function nextId(kind) {
  state.seq[kind] = (state.seq[kind] || 0) + 1;
  return state.seq[kind];
}

load();

module.exports = { get: () => state, save, nextId, reset: () => { state = freshState(); save(); }, img: seed.img };
