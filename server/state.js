'use strict';
// Runtime-agnostic fresh state shape, shared by the Node (fs) store and the
// Cloudflare Worker (KV) store. Sessions/OTPs live in state so login survives
// in KV across Worker isolates.
module.exports = function freshState(seed) {
  return {
    products: seed.products.map((p) => ({ ...p })),
    winners: seed.winners.map((w) => ({ ...w })),
    finances: seed.finances.map((f) => ({ ...f })),
    tasks: seed.tasks.map((t) => ({ ...t })),
    vipTiers: seed.vipTiers.map((v) => ({ ...v })),
    luckyDraws: seed.luckyDraws.map((l) => ({ ...l })),
    prizes: seed.prizes.map((p) => ({ ...p })),
    games: seed.games.map((g) => ({ ...g })),
    helpItems: seed.helpItems.map((h) => ({ ...h })),
    notifications: seed.notifications.map((n) => ({ ...n })),
    events: [],
    rechargeOptions: [...seed.rechargeOptions],
    settings: {
      name: 'ORich',
      notice: 'Lucky draw for iPhone 15 Pro Max closes soon — join now!',
      service: 'https://wa.me/910000000000',
      tabBarColor: '#17273a',
      tabBarActive: '#de6436',
      withdrawFee: seed.withdrawConfig.feePercent,
      withdrawMin: seed.withdrawConfig.min,
      withdrawArrival: seed.withdrawConfig.arrival,
    },
    users: [],
    orders: [],
    admins: [{ username: (typeof process !== 'undefined' && process.env && process.env.ADMIN_USER) || 'admin', password: (typeof process !== 'undefined' && process.env && process.env.ADMIN_PASS) || 'admin123', name: 'Administrator' }],
    sessions: {},        // user token -> userId
    adminSessions: {},   // admin token -> username
    otps: {},            // phone -> code
    seq: { user: 0, order: 0, product: seed.products.length, winner: 200, finance: seed.finances.length, vip: seed.vipTiers.length, lucky: seed.luckyDraws.length, notification: seed.notifications.length },
  };
};
