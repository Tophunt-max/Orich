'use strict';
/**
 * ORich-clone real backend (dependency-free Node http server) with persistent data.
 *
 * - User API  : POST /api/index/*      — matches the original app's contract
 *               { code, msg, data }, code === 1 = success, bearer "token" header.
 * - Admin API : /admin/api/*           — manage products, winners, finance, tasks,
 *               VIP tiers, lucky draws, users, orders and settings.
 *
 * State is persisted to data/state.json via ./store, so admin edits show in the app.
 *   node server/index.js   -> http://localhost:8788
 */
const http = require('http');
const store = require('./store');
const seed = require('./db');

const PORT = Number(process.env.PORT || 8788);
const sessions = Object.create(null);      // user token -> userId
const adminSessions = Object.create(null);  // admin token -> username
const otps = Object.create(null);           // phone -> code

const ok = (data = {}, msg = 'success') => ({ code: 1, msg, data });
const err = (msg = 'error', code = 0) => ({ code, msg, data: null });
const rupees = (paise) => (paise / 100).toFixed(2);
const token = (p) => p + Math.random().toString(36).slice(2) + Date.now().toString(36);

function productView(p) {
  const percent = Math.min(100, Math.round((p.joined / p.total) * 100));
  return { ...p, remaining: Math.max(0, p.total - p.joined), percent };
}
// Rich detail used by the goods page: participants, prize tiers, winners, reviews.
const DET_NAMES = ['rahul', 'meena', 'arjun', 'sana', 'abdul', 'babu', 'praveen', 'sultan', 'vikram', 'neha', 'rohit', 'priya', 'deepak', 'anjali'];
const DET_AVS = ['networkimg/abdul.png', 'networkimg/babu.png', 'networkimg/behrul-islam.png', 'networkimg/praveen.png', 'networkimg/sultan.png', 'networkimg/user.png'];
const DET_CITIES = ['Delhi', 'Mumbai', 'Pune', 'Jaipur', 'Surat', 'Patna', 'Kochi', 'Indore'];
const DET_REVIEWS = [
  'Genuine product and super fast delivery. Highly recommended!',
  'Won on my 3rd try and received it within a week. Thank you ORich!',
  'Great experience — packaging was neat and factory sealed.',
];
function fmtTime(ms) { return new Date(ms).toISOString().slice(0, 16).replace('T', ' '); }
function productDetailView(p) {
  const base = productView(p);
  const av = (i) => store.img(DET_AVS[((i % DET_AVS.length) + DET_AVS.length) % DET_AVS.length]);
  const now = Date.now();
  const participants = Array.from({ length: 8 }, (_, i) => ({
    name: DET_NAMES[(p.id * 3 + i) % DET_NAMES.length] + '***',
    avatar: av(p.id + i),
    shares: ((p.id * 7 + i * 13) % 50) + 1,
    ip: 'IP ' + DET_CITIES[(p.id + i) % DET_CITIES.length],
    time: fmtTime(now - (i + 1) * 3600 * 1000 * (1 + (i % 4))),
  }));
  const mv = p.marketValue;
  const prizeTiers = [
    { rank: 1, icon: store.img('goods/icon_Firstprize.png'), name: p.title, value: mv },
    { rank: 2, icon: store.img('goods/icon_Secondprize.png'), name: 'Cash prize', value: Math.round(mv * 0.05) },
    { rank: 3, icon: store.img('goods/icon_Thirdprize.png'), name: 'Cash prize', value: Math.round(mv * 0.02) },
  ];
  const reviews = Array.from({ length: 3 }, (_, i) => ({
    name: DET_NAMES[(p.id + i * 5) % DET_NAMES.length] + '***',
    avatar: av(p.id * 2 + i),
    vip: i === 0,
    time: new Date(now - (i + 2) * 86400 * 1000).toISOString().slice(0, 10),
    title: p.title,
    content: DET_REVIEWS[i % DET_REVIEWS.length],
    images: i === 0 ? [store.img('goods/prompt.png'), store.img('goods/prompt-2.png'), store.img('goods/prompt-3.png')] : [],
  }));
  const winners = store.get().winners.slice(0, 3).map((w) => ({ ...w, product: p.title, cover: p.cover }));
  return { ...base, peopleAvatars: participants.slice(0, 5).map((x) => x.avatar), participants, prizeTiers, winners, reviews };
}
function userView(u) {
  return {
    id: u.id, phone: u.phone, nickname: u.nickname || ('ORich' + u.phone.slice(-4)),
    avatar: u.avatar, balance: rupees(u.balance), frozen: rupees(u.frozen),
    inviteCode: u.inviteCode, teamCount: u.teamCount, vip: u.vip || null,
  };
}
function userByToken(req) {
  const t = req.headers['token'] || (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '');
  const id = t && sessions[t];
  const s = store.get();
  const user = id && s.users.find((u) => u.id === id);
  return user ? { token: t, user } : null;
}
function adminByToken(req) {
  const t = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '') || req.headers['token'];
  return t && adminSessions[t] ? { token: t, username: adminSessions[t] } : null;
}

// ----------------------------- user API -----------------------------
const userRoutes = {
  '/index/getsystem': () => { const s = store.get(); return ok({ name: s.settings.name, logo: '/static/logo.png', service: s.settings.service, notice: s.settings.notice, tabBarColor: s.settings.tabBarColor, tabBarActive: s.settings.tabBarActive }); },
  '/index/gettitle': () => ok({ banners: [store.img('home/bg_homepage.png'), store.img('home/bg_Yellow.png')] }),
  '/index/index': () => {
    const s = store.get();
    return ok({
      banners: [store.img('home/bg_homepage.png'), store.img('home/bg_Yellow.png')],
      notice: s.settings.notice,
      entries: [
        { key: 'recharge', label: 'Recharge', icon: store.img('home/icon_Recharge.png') },
        { key: 'invite', label: 'Invite', icon: store.img('home/icon_Invite.png') },
        { key: 'task', label: 'Tasks', icon: store.img('home/icon_Promotion.png') },
        { key: 'vip', label: 'VIP', icon: store.img('home/icon_Winner.png') },
        { key: 'orders', label: 'My Orders', icon: store.img('home/icon_MyOrders.png') },
        { key: 'support', label: 'Support', icon: store.img('home/icon_Support.png') },
      ],
      hot: s.products.filter((p) => p.hot).map(productView),
      list: s.products.map(productView),
      highValue: [...s.products].sort((a, b) => b.marketValue - a.marketValue).slice(0, 4).map(productView),
      categories: seed.categories,
      finances: s.finances,
      winners: s.winners.slice(0, 5),
    });
  },
  '/index/duobaoitemlist': () => ok({ list: store.get().products.map(productView) }),
  '/index/duobaoitemlistnew': () => ok({ list: store.get().products.map(productView) }),
  '/index/duobaoitemdetail': (b) => { const p = store.get().products.find((x) => x.id === Number(b.id)); return p ? ok({ item: productDetailView(p), joinPrices: [1, 5, 10, 20, 50, 100] }) : err('Product not found'); },
  '/index/winnerlist': () => ok({ list: store.get().winners }),
  '/index/taskList': (b, ctx) => ok({ list: store.get().tasks.map((t) => taskProgress(t, ctx && ctx.user && ctx.user.user)) }),
  '/index/vip': () => ok({ list: store.get().vipTiers, benefits: seed.vipConfig.benefits, privileges: seed.vipConfig.privileges }),
  '/index/luckyList': () => ok({ list: store.get().luckyDraws }),
  '/index/luckyNow': () => ok({ list: store.get().luckyDraws }),
  '/index/financeList': () => ok({ list: store.get().finances, arrivals: financeArrivals() }),
  '/index/financeDetail': (b) => { const f = store.get().finances.find((x) => x.id === Number(b.id)); return f ? ok({ item: f, participants: financeParticipants(f.id), rules: seed.inviteRules }) : err('Plan not found'); },
  '/index/rechargelist': () => ok({ options: store.get().rechargeOptions, channels: seed.payChannels }),
  '/index/systemservice': () => ok({ whatsapp: store.get().settings.service, email: 'support@orich.example' }),
  '/index/help': () => ok({ list: store.get().helpItems || seed.helpItems }),

  '/index/sendverify': (b) => {
    if (!/^\d{6,15}$/.test(String(b.phone || ''))) return err('Enter a valid phone number');
    const code = String(Math.floor(1000 + Math.random() * 8999));
    otps[b.phone] = code;
    return ok({ sent: true, demoCode: code }, 'Verification code sent');
  },
  '/index/login': (b) => {
    const phone = String(b.phone || ''); const code = String(b.code || '');
    if (!phone) return err('Phone is required');
    if (!otps[phone] || otps[phone] !== code) return err('Invalid verification code');
    delete otps[phone];
    const s = store.get();
    let user = s.users.find((u) => u.phone === phone);
    if (!user) {
      user = seed.freshUser(); user.id = store.nextId('user'); user.phone = phone;
      if (b.invite) user.invitedBy = String(b.invite);
      s.users.push(user); store.save();
    }
    const t = token('tok_'); sessions[t] = user.id;
    return ok({ token: t, user: userView(user) }, 'Logged in');
  },

  '/index/logout': (b, ctx) => { delete sessions[ctx.user.token]; return ok({}, 'Logged out'); },
  '/index/useraccount': (b, ctx) => ok({ user: userView(ctx.user.user), finance: financeSummary(ctx.user.user.id) }),
  '/index/userbalance': (b, ctx) => { const st = store.get().settings; return ok({ balance: rupees(ctx.user.user.balance), frozen: rupees(ctx.user.user.frozen), withdraw: { feePercent: st.withdrawFee ?? seed.withdrawConfig.feePercent, min: st.withdrawMin ?? seed.withdrawConfig.min, arrival: st.withdrawArrival ?? seed.withdrawConfig.arrival } }); },

  '/index/addrechargepay2': (b, ctx) => {
    const amount = Math.round(Number(b.amount) * 100);
    if (!amount || amount < 100) return err('Minimum recharge is ₹1');
    const u = ctx.user.user; u.balance += amount;
    const order = addOrder(u.id, 'recharge', { amount: rupees(amount), status: 'success' });
    return ok({ order, balance: rupees(u.balance) }, 'Recharge successful');
  },
  '/index/addorder': (b, ctx) => {
    const s = store.get(); const p = s.products.find((x) => x.id === Number(b.id));
    if (!p) return err('Product not found');
    if (p.status !== 'ongoing') return err('This round is closed');
    const shares = Math.max(1, Number(b.shares) || 1);
    const cost = shares * p.price * 100; const u = ctx.user.user;
    if (u.balance < cost) return err('Insufficient balance, please recharge');
    u.balance -= cost; p.joined = Math.min(p.total, p.joined + shares);
    const order = addOrder(u.id, 'join', { product: p.title, shares, amount: rupees(cost), status: 'ongoing' });
    return ok({ order, balance: rupees(u.balance) }, 'Joined successfully');
  },
  '/index/financeBuy': (b, ctx) => {
    const f = store.get().finances.find((x) => x.id === Number(b.id));
    if (!f) return err('Plan not found');
    const amount = Math.round(Number(b.amount) * 100); const u = ctx.user.user;
    if (amount < f.min * 100) return err('Below minimum investment');
    if (u.balance < amount) return err('Insufficient balance');
    u.balance -= amount;
    const order = addOrder(u.id, 'finance', { product: f.name, amount: rupees(amount), status: 'active' });
    return ok({ order, balance: rupees(u.balance) }, 'Investment confirmed');
  },
  '/index/vipBuy': (b, ctx) => {
    const v = store.get().vipTiers.find((x) => x.id === Number(b.id));
    if (!v) return err('Tier not found');
    const u = ctx.user.user; const cost = v.price * 100;
    if (u.balance < cost) return err('Insufficient balance');
    u.balance -= cost; u.vip = { name: v.name, until: Date.now() + v.days * 864e5 };
    const order = addOrder(u.id, 'vip', { product: v.name + ' VIP', amount: rupees(cost), status: 'active' });
    return ok({ order, balance: rupees(u.balance), vip: u.vip }, 'VIP activated');
  },
  '/index/luckyBuy': (b, ctx) => {
    const l = store.get().luckyDraws.find((x) => x.id === Number(b.id));
    if (!l) return err('Draw not found');
    const u = ctx.user.user; const cost = l.ticket * 100;
    if (u.balance < cost) return err('Insufficient balance');
    u.balance -= cost; l.sold = Math.min(l.pool, l.sold + 1);
    const order = addOrder(u.id, 'lucky', { product: l.title, amount: rupees(cost), status: 'entered' });
    return ok({ order, balance: rupees(u.balance) }, 'Entry confirmed');
  },
  '/index/taskReceive': (b, ctx) => {
    const t = store.get().tasks.find((x) => x.id === Number(b.id));
    if (!t) return err('Task not found');
    const u = ctx.user.user; u.balance += t.reward * 100;
    addOrder(u.id, 'task', { product: t.title, amount: rupees(t.reward * 100), status: 'rewarded' });
    return ok({ balance: rupees(u.balance) }, 'Reward +₹' + t.reward);
  },

  '/index/ordernews': (b, ctx) => ok({ list: ordersOf(ctx.user.user.id, 'join') }),
  '/index/userjoin': (b, ctx) => ok({ list: ordersOf(ctx.user.user.id, 'join') }),
  '/index/myFinanceList': (b, ctx) => ok({ list: ordersOf(ctx.user.user.id, 'finance').map(financeOrderView) }),
  '/index/luckyOrderList': (b, ctx) => ok({ list: ordersOf(ctx.user.user.id, 'lucky') }),
  '/index/mywinner': (b, ctx) => ok({ list: store.get().winners.slice(0, 2) }),
  '/index/usershare': (b, ctx) => ok({ list: store.get().winners.slice(0, 2) }),
  '/index/myteam': (b, ctx) => { const tm = teamOf(ctx.user.user); return ok({ count: tm.direct.length + tm.indirect.length, inviteCode: ctx.user.user.inviteCode, directCount: tm.direct.length, indirectCount: tm.indirect.length, directReward: tm.directReward, indirectReward: tm.indirectReward, levels: [{ level: 1, members: tm.direct.length, commission: tm.directReward }, { level: 2, members: tm.indirect.length, commission: tm.indirectReward }], list: tm.direct, indirect: tm.indirect }); },
  '/index/userinvitelist': (b, ctx) => { const tm = teamOf(ctx.user.user); return ok({ inviteCode: ctx.user.user.inviteCode, rules: seed.inviteRules, list: tm.direct.concat(tm.indirect) }); },

  // Prizes & games (public lists)
  '/index/price': () => ok({ list: store.get().prizes }),
  '/index/getactivity': () => ok({ list: store.get().games }),

  // Withdraw / cash-out
  '/index/userwithdraw': (b, ctx) => {
    const amount = Math.round(Number(b.amount) * 100); const u = ctx.user.user;
    if (!amount || amount < 10000) return err('Minimum withdrawal is ₹100');
    if (u.balance < amount) return err('Insufficient balance');
    if (!(u.banks || []).length) return err('Add a bank account first');
    u.balance -= amount;
    const order = addOrder(u.id, 'withdraw', { amount: rupees(amount), status: 'pending' });
    return ok({ order, balance: rupees(u.balance) }, 'Withdrawal requested');
  },
  '/index/cashlist': (b, ctx) => ok({ list: ordersOf(ctx.user.user.id, 'withdraw') }),
  '/index/rechargerecord': (b, ctx) => ok({ list: ordersOf(ctx.user.user.id, 'recharge') }),

  // Bank accounts
  '/index/banklist': (b, ctx) => ok({ list: ctx.user.user.banks || [] }),
  '/index/bankadd': (b, ctx) => {
    const u = ctx.user.user; u.banks = u.banks || [];
    const bank = { id: store.nextId('order'), type: b.type || 'Bank', holder: b.holder || '', number: b.number || '' };
    u.banks.push(bank); store.save();
    return ok({ bank }, 'Bank added');
  },
  '/index/bankdel': (b, ctx) => {
    const u = ctx.user.user; u.banks = (u.banks || []).filter((x) => x.id !== Number(b.id)); store.save();
    return ok({}, 'Removed');
  },

  // Addresses
  '/index/addresslist': (b, ctx) => ok({ list: ctx.user.user.addresses || [] }),
  '/index/addressadd': (b, ctx) => {
    const u = ctx.user.user; u.addresses = u.addresses || [];
    const a = { id: store.nextId('order'), name: b.name || '', phone: b.phone || '', line: b.line || '', isDefault: !u.addresses.length };
    u.addresses.push(a); store.save();
    return ok({ address: a }, 'Address saved');
  },
  '/index/addressdel': (b, ctx) => {
    const u = ctx.user.user; u.addresses = (u.addresses || []).filter((x) => x.id !== Number(b.id)); store.save();
    return ok({}, 'Removed');
  },

  // Account profile edit
  '/index/accountedit': (b, ctx) => {
    const u = ctx.user.user; if (b.nickname) u.nickname = String(b.nickname).slice(0, 24); store.save();
    return ok({ user: userView(u) }, 'Saved');
  },
  '/index/orderdetail': (b, ctx) => {
    const o = store.get().orders.find((x) => x.id === Number(b.id) && x.userId === ctx.user.user.id);
    return o ? ok({ order: o }) : err('Order not found');
  },

  // ---------- APK parity: group-buy item extras ----------
  '/index/duobaoitem': () => ok({ list: store.get().products.map(productView) }),
  '/index/duobaoitem1': () => ok({ list: store.get().products.map(productView) }),
  '/index/kind': () => ok({ list: seed.categories }),
  '/index/duobaoitemjoinlist': (b) => { const p = store.get().products.find((x) => x.id === Number(b.id)); return p ? ok({ list: productDetailView(p).participants }) : err('Product not found'); },
  '/index/duobaoitemhistory': (b) => { const p = store.get().products.find((x) => x.id === Number(b.id)); return ok({ list: store.get().winners.slice(0, 5).map((w) => ({ ...w, product: p ? p.title : w.product })) }); },
  '/index/duobaoitemshare': (b) => ok({ link: 'https://orich.example/goods/' + (b.id || ''), poster: store.img('goods/img_confirm.png'), code: 'OR' + (b.id || '') }),
  '/index/duobaoitemlottery': (b) => { const p = store.get().products.find((x) => x.id === Number(b.id)); return ok({ item: p ? productView(p) : null, winner: store.get().winners[0] || null }); },
  '/index/activitydetail': (b) => { const g = store.get().games.find((x) => x.id === Number(b.id)) || store.get().games[0]; return ok({ item: g, ...lotteryRound() }); },

  // ---------- APK parity: lottery / game ----------
  '/index/getlotterytime': () => ok(lotteryRound()),
  '/index/getlotteryresult': () => ok({ list: lotteryResults() }),
  '/index/getnumbermax': () => ok({ max: 9, maxBet: 100000 }),

  // ---------- APK parity: finance extras ----------
  '/index/financeOrderRecent': () => ok({ list: financeArrivals() }),
  '/index/financeDetailHistory': (b) => ok({ list: financeHistory(Number(b.id)) }),

  // ---------- APK parity: answers / after-sales / misc ----------
  '/index/getanswer': () => ok({ list: store.get().helpItems || seed.helpItems }),
  '/index/runoobdetail': () => ok({ title: 'Rules', content: seed.inviteRules.join('\n') }),
  '/index/chlwhatsapp': () => ok({ url: store.get().settings.service }),
  '/index/paystatus': (b) => ok({ orderId: b.id || null, status: 'success', paid: true }),
  '/index/itemshare': (b) => ok({ link: 'https://orich.example/order/' + (b.id || ''), poster: store.img('goods/ing_Successfulpurchase.png') }),
  '/index/userinvitetop': () => ok({ list: inviteTop() }),

  // ---------- APK parity: push notifications / OTA update / analytics ----------
  '/index/notifications': (b, ctx) => {
    const s = store.get(); const u = ctx && ctx.user && ctx.user.user;
    const read = new Set((u && u.readNotifs) || []);
    const list = s.notifications.map((n) => ({ ...n, read: read.has(n.id) }));
    return ok({ list, unread: list.filter((n) => !n.read).length });
  },
  '/index/notifyread': (b, ctx) => {
    const u = ctx.user.user; u.readNotifs = u.readNotifs || [];
    if (b.id) { if (!u.readNotifs.includes(Number(b.id))) u.readNotifs.push(Number(b.id)); }
    else { u.readNotifs = store.get().notifications.map((n) => n.id); }
    store.save(); return ok({}, 'Marked read');
  },
  '/index/checkupdate': () => { const u = seed.appUpdate; return ok({ ...u, hasUpdate: u.latest !== u.version }); },
  '/index/track': (b, ctx) => {
    const s = store.get(); s.events = s.events || [];
    const uid = ctx && ctx.user && ctx.user.user ? ctx.user.user.id : null;
    s.events.push({ name: String(b.name || 'event'), props: b.props || {}, userId: uid, ts: Date.now() });
    if (s.events.length > 2000) s.events = s.events.slice(-2000);
    store.save(); return ok({ logged: true });
  },

  // ---------- APK parity: authed records / edits / actions ----------
  '/index/userrebatelist': (b, ctx) => ok({ list: rebateList(ctx.user.user) }),
  '/index/userconsume': (b, ctx) => ok({ list: store.get().orders.filter((o) => o.userId === ctx.user.user.id && o.type !== 'recharge').reverse() }),
  '/index/useritem': (b, ctx) => ok({ list: ordersOf(ctx.user.user.id, 'join') }),
  '/index/getUserAfs': (b, ctx) => ok({ list: ordersOf(ctx.user.user.id, 'afs') }),
  '/index/editAfStatus': (b, ctx) => ok({}, 'After-sales updated'),
  '/index/itemdetail': (b, ctx) => { const o = store.get().orders.find((x) => x.id === Number(b.id) && x.userId === ctx.user.user.id); return o ? ok({ item: o }) : err('Not found'); },
  '/index/itemedit': (b, ctx) => { const o = store.get().orders.find((x) => x.id === Number(b.id) && x.userId === ctx.user.user.id); if (!o) return err('Not found'); if (b.addressId != null) o.addressId = Number(b.addressId); store.save(); return ok({ item: o }, 'Saved'); },
  '/index/itemdefaultaddr': (b, ctx) => { const list = ctx.user.user.addresses || []; return ok({ address: list.find((a) => a.isDefault) || list[0] || null }); },
  '/index/addorderpay': (b, ctx) => { const p = store.get().products.find((x) => x.id === Number(b.id)); if (!p) return err('Product not found'); const shares = Math.max(1, Number(b.shares) || 1); const cost = shares * p.price * 100; return ok({ payUrl: 'https://orich.example/pay?o=' + Date.now() + '&amt=' + rupees(cost), amount: rupees(cost), channel: b.channel || 'upi' }, 'Proceed to payment'); },
  '/index/joinactivity': (b, ctx) => { const u = ctx.user.user; const amount = Math.round(Number(b.amount || b.ticket || 10) * 100); if (!amount || u.balance < amount) return err('Insufficient balance'); u.balance -= amount; const label = 'Lucky Ball' + (b.color ? ' ' + b.color : '') + (b.number != null ? ' #' + b.number : ''); const order = addOrder(u.id, 'lucky', { product: label, amount: rupees(amount), status: 'entered' }); return ok({ order, balance: rupees(u.balance), ...lotteryRound() }, 'Bet placed'); },
  '/index/bankedit': (b, ctx) => { const bk = (ctx.user.user.banks || []).find((x) => x.id === Number(b.id)); if (!bk) return err('Not found'); if (b.type != null) bk.type = b.type; if (b.holder != null) bk.holder = b.holder; if (b.number != null) bk.number = b.number; store.save(); return ok({ bank: bk }, 'Saved'); },
  '/index/addressedit': (b, ctx) => { const a = (ctx.user.user.addresses || []).find((x) => x.id === Number(b.id)); if (!a) return err('Not found'); ['name', 'phone', 'line'].forEach((k) => { if (b[k] != null) a[k] = b[k]; }); store.save(); return ok({ address: a }, 'Saved'); },
  '/index/addresschangedefault': (b, ctx) => { (ctx.user.user.addresses || []).forEach((a) => { a.isDefault = a.id === Number(b.id); }); store.save(); return ok({}, 'Default address set'); },
};

function addOrder(userId, type, extra) {
  const s = store.get();
  const order = { id: store.nextId('order'), userId, type, date: new Date().toISOString().slice(0, 10), ...extra };
  s.orders.push(order); store.save();
  return order;
}
function ordersOf(userId, type) {
  return store.get().orders.filter((o) => o.userId === userId && o.type === type);
}

// --- data-wiring helpers (real values for the UI sections) ---
const DAY = 864e5;
function daysBetween(dateStr) {
  const t = Date.parse(dateStr + 'T00:00:00Z');
  return Number.isFinite(t) ? Math.max(0, Math.floor((Date.now() - t) / DAY)) : 0;
}
// Enrich a finance order with live progress / earnings based on its plan.
function financeOrderView(o) {
  const f = store.get().finances.find((x) => x.name === o.product);
  const amount = Number(o.amount) || 0;
  if (!f) return { ...o, progress: 0, earned: '0.00', daysLeft: 0, days: 0, rate: 0 };
  const elapsed = Math.min(f.days, daysBetween(o.date) + 1);
  const earned = (amount * (f.rate / 100) * elapsed).toFixed(2);
  const progress = Math.round((elapsed / f.days) * 100);
  return { ...o, progress, earned, daysLeft: Math.max(0, f.days - elapsed), days: f.days, rate: f.rate, matured: elapsed >= f.days };
}
function financeSummary(userId) {
  const orders = ordersOf(userId, 'finance');
  let invested = 0, earnings = 0;
  for (const o of orders) { const v = financeOrderView(o); invested += Number(o.amount) || 0; earnings += Number(v.earned) || 0; }
  return { invested: invested.toFixed(2), earnings: earnings.toFixed(2), count: orders.length };
}
// Recent "arrivals" ticker for the finance list (derived from seeded names, stable per day).
function financeArrivals() {
  const names = ['rahul', 'meena', 'arjun', 'sana', 'abdul', 'babu', 'praveen', 'sultan'];
  const avs = ['networkimg/abdul.png', 'networkimg/babu.png', 'networkimg/praveen.png', 'networkimg/sultan.png', 'networkimg/user.png'];
  return names.map((n, i) => ({ name: n + '***', avatar: store.img(avs[i % avs.length]), amount: ((i * 737 + 500) % 9000 + 1000).toString(), payout: (((i * 737 + 500) % 9000 + 1000) * 0.012).toFixed(2) }));
}
function financeParticipants(planId) {
  const names = ['vikram', 'neha', 'rohit', 'priya', 'deepak', 'anjali'];
  const avs = ['networkimg/abdul.png', 'networkimg/babu.png', 'networkimg/praveen.png', 'networkimg/sultan.png'];
  return names.map((n, i) => ({ name: n + '***', avatar: store.img(avs[(planId + i) % avs.length]), amount: (((planId * 13 + i * 29) % 40 + 5) * 1000).toString(), time: new Date(Date.now() - (i + 1) * 5 * 3600e3).toISOString().slice(0, 16).replace('T', ' ') }));
}
// Per-task progress for the Tasks page (uses the user's real orders when signed in).
function taskProgress(t, user) {
  let done = 0;
  if (user) {
    const mine = store.get().orders.filter((o) => o.userId === user.id);
    if (t.type === 'join') done = mine.filter((o) => o.type === 'join').length;
    else if (t.type === 'recharge') done = mine.filter((o) => o.type === 'recharge').length;
    else if (t.type === 'invite') done = teamOf(user).direct.length;
    else if (t.type === 'checkin') done = mine.some((o) => o.type === 'task' && o.date === new Date().toISOString().slice(0, 10)) ? 1 : 0;
  }
  const target = t.target || 1;
  return { ...t, progress: Math.min(target, done), target, done: done >= target };
}
// Direct + indirect referrals of a user (by invite code chain).
function teamOf(user) {
  const s = store.get();
  const direct = s.users.filter((u) => u.invitedBy && u.invitedBy === user.inviteCode);
  const directCodes = new Set(direct.map((u) => u.inviteCode));
  const indirect = s.users.filter((u) => u.invitedBy && directCodes.has(u.invitedBy));
  const reward = (arr, rate) => arr.reduce((a, u) => a + (s.orders.filter((o) => o.userId === u.id && (o.type === 'join' || o.type === 'recharge')).reduce((x, o) => x + Number(o.amount) || 0, 0)) * rate, 0);
  const view = (u) => ({ id: u.id, name: (u.nickname || ('ORich' + String(u.phone).slice(-4))), avatar: u.avatar, phone: String(u.phone).replace(/(\d{2})\d+(\d{2})/, '$1****$2'), date: new Date(u.createdAt).toISOString().slice(0, 10), vip: !!u.vip });
  return {
    direct: direct.map(view), indirect: indirect.map(view),
    directReward: reward(direct, 0.08).toFixed(2), indirectReward: reward(indirect, 0.03).toFixed(2),
  };
}
// Lucky-ball game round: 3-minute cadence, next boundary = round close.
function lotteryRound() {
  const span = 3 * 60e3;
  const endAt = Math.ceil(Date.now() / span) * span;
  const period = '1' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + String(Math.floor(endAt / span) % 1000).padStart(3, '0');
  return { period, endAt, serverTime: Date.now() };
}
function lotteryResults() {
  const colors = ['green', 'violet', 'red'];
  const base = Number(new Date().toISOString().slice(0, 10).replace(/-/g, ''));
  return Array.from({ length: 8 }, (_, i) => ({ period: '1' + (base) + String(8 - i).padStart(3, '0'), number: (i * 3 + 7) % 10, color: colors[(i * 3 + 7) % 10 === 0 ? 0 : i % 3] }));
}
function financeHistory(id) {
  const f = store.get().finances.find((x) => x.id === id);
  if (!f) return [];
  const n = Math.min(f.days, 7);
  return Array.from({ length: n }, (_, i) => ({ day: i + 1, date: new Date(Date.now() - i * 864e5).toISOString().slice(0, 10), earning: (f.min * (f.rate / 100)).toFixed(2) }));
}
// Referral commission records for the user (from invitees' real spend).
function rebateList(user) {
  const s = store.get();
  const rows = [];
  const direct = s.users.filter((u) => u.invitedBy === user.inviteCode);
  const directCodes = new Set(direct.map((u) => u.inviteCode));
  const indirect = s.users.filter((u) => directCodes.has(u.invitedBy));
  const add = (arr, level, rate) => arr.forEach((u) => {
    const spend = s.orders.filter((o) => o.userId === u.id && (o.type === 'join' || o.type === 'recharge')).reduce((a, o) => a + (Number(o.amount) || 0), 0);
    if (spend > 0) rows.push({ name: u.nickname || ('ORich' + String(u.phone).slice(-4)), level, date: new Date(u.createdAt).toISOString().slice(0, 10), amount: (spend * rate).toFixed(2) });
  });
  add(direct, 'Direct', 0.08); add(indirect, 'Indirect', 0.03);
  return rows;
}
// Invite leaderboard (server-side aggregate; demo values when no real data).
function inviteTop() {
  const s = store.get();
  const counts = {};
  s.users.forEach((u) => { if (u.invitedBy) counts[u.invitedBy] = (counts[u.invitedBy] || 0) + 1; });
  const real = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([code, n], i) => ({ rank: i + 1, name: code, invites: n, reward: (n * 25).toFixed(2) }));
  if (real.length) return real;
  return [['rahul***', 128], ['meena***', 96], ['arjun***', 74], ['sana***', 61], ['abdul***', 53]]
    .map(([name, n], i) => ({ rank: i + 1, name, invites: n, reward: (n * 25).toFixed(2) }));
}

const USER_AUTH = new Set(['/index/useraccount', '/index/userbalance', '/index/addrechargepay2', '/index/addorder',
  '/index/ordernews', '/index/userjoin', '/index/mywinner', '/index/usershare', '/index/logout', '/index/financeBuy',
  '/index/myFinanceList', '/index/myteam', '/index/userinvitelist', '/index/vipBuy', '/index/luckyBuy',
  '/index/luckyOrderList', '/index/taskReceive',
  // APK-parity authed endpoints
  '/index/userrebatelist', '/index/userconsume', '/index/useritem', '/index/getUserAfs', '/index/editAfStatus',
  '/index/itemdetail', '/index/itemedit', '/index/itemdefaultaddr', '/index/addorderpay', '/index/joinactivity',
  '/index/bankedit', '/index/addressedit', '/index/addresschangedefault', '/index/notifyread']);

// ----------------------------- admin API -----------------------------
const COLLECTIONS = { products: 'product', winners: 'winner', finances: 'finance', tasks: null, vipTiers: 'vip', luckyDraws: 'lucky' };

const adminRoutes = {
  'POST /login': (b) => {
    const s = store.get();
    const a = s.admins.find((x) => x.username === b.username && x.password === b.password);
    if (!a) return err('Invalid credentials', 401);
    const t = token('adm_'); adminSessions[t] = a.username;
    return ok({ token: t, name: a.name, username: a.username }, 'Logged in');
  },
  'GET /me': (b, ctx) => ok({ username: ctx.admin.username }),
  'POST /logout': (b, ctx) => { delete adminSessions[ctx.admin.token]; return ok({}, 'Logged out'); },

  'GET /stats': () => {
    const s = store.get();
    const sum = (t) => s.orders.filter((o) => o.type === t).reduce((a, o) => a + Number(o.amount), 0);
    return ok({
      users: s.users.length, products: s.products.length, winners: s.winners.length,
      orders: s.orders.length,
      recharge: sum('recharge').toFixed(2), joins: sum('join').toFixed(2),
      finance: sum('finance').toFixed(2), vip: sum('vip').toFixed(2),
      withdraw: sum('withdraw').toFixed(2),
      pendingWithdraw: s.orders.filter((o) => o.type === 'withdraw' && o.status === 'pending').length,
      pendingRecharge: s.orders.filter((o) => o.type === 'recharge' && o.status === 'pending').length,
      notifications: (s.notifications || []).length,
      events: (s.events || []).length,
      settings: s.settings,
    });
  },

  // Generic collection CRUD: /collection/:name  (products|winners|finances|tasks|vipTiers|luckyDraws)
  'GET /collection': (b) => { const s = store.get(); return s[b.name] ? ok({ list: s[b.name] }) : err('Unknown collection'); },
  'POST /collection/save': (b) => {
    const s = store.get(); const list = s[b.name];
    if (!list) return err('Unknown collection');
    const item = b.item || {};
    if (item.id) {
      const row = list.find((x) => x.id === Number(item.id));
      if (!row) return err('Not found');
      Object.assign(row, item, { id: row.id });
    } else {
      const seqKey = COLLECTIONS[b.name];
      item.id = seqKey ? store.nextId(seqKey) : (list.reduce((m, x) => Math.max(m, x.id || 0), 0) + 1);
      list.push(item);
    }
    store.save();
    return ok({ item }, 'Saved');
  },
  'POST /collection/delete': (b) => {
    const s = store.get(); const list = s[b.name];
    if (!list) return err('Unknown collection');
    s[b.name] = list.filter((x) => x.id !== Number(b.id)); store.save();
    return ok({}, 'Deleted');
  },

  'GET /users': () => ok({ list: store.get().users.map(userView) }),
  'POST /users/adjust': (b) => {
    const u = store.get().users.find((x) => x.id === Number(b.id));
    if (!u) return err('User not found');
    u.balance = Math.max(0, u.balance + Math.round(Number(b.delta) * 100)); store.save();
    return ok({ user: userView(u) }, 'Balance updated');
  },
  'POST /users/save': (b) => {
    const u = store.get().users.find((x) => x.id === Number(b.id));
    if (!u) return err('User not found');
    if (b.nickname != null) u.nickname = String(b.nickname).slice(0, 24);
    if (b.balance != null) u.balance = Math.max(0, Math.round(Number(b.balance) * 100));
    if (b.frozen != null) u.frozen = Math.max(0, Math.round(Number(b.frozen) * 100));
    if (b.vip !== undefined) u.vip = b.vip ? { name: b.vip, until: Date.now() + 30 * 864e5 } : null;
    store.save();
    return ok({ user: userView(u) }, 'User saved');
  },
  'POST /users/delete': (b) => { const s = store.get(); s.users = s.users.filter((x) => x.id !== Number(b.id)); store.save(); return ok({}, 'User deleted'); },
  'GET /user': (b) => {
    const s = store.get(); const u = s.users.find((x) => x.id === Number(b.id));
    if (!u) return err('User not found');
    return ok({ user: userView(u), orders: s.orders.filter((o) => o.userId === u.id).reverse(), banks: u.banks || [], addresses: u.addresses || [], team: teamOf(u) });
  },
  'POST /orders/status': (b) => {
    const s = store.get(); const o = s.orders.find((x) => x.id === Number(b.id));
    if (!o) return err('Order not found');
    const prev = o.status; const next = b.status || o.status;
    // Rejecting a pending withdrawal refunds the amount to the user's wallet.
    if (o.type === 'withdraw' && next === 'rejected' && prev !== 'rejected') {
      const u = s.users.find((x) => x.id === o.userId);
      if (u) u.balance += Math.round(Number(o.amount) * 100);
    }
    o.status = next; store.save();
    return ok({ order: o }, 'Order updated');
  },
  'POST /orders/delete': (b) => { const s = store.get(); s.orders = s.orders.filter((x) => x.id !== Number(b.id)); store.save(); return ok({}, 'Order deleted'); },
  'POST /notify/send': (b) => {
    const s = store.get();
    const n = { id: store.nextId('notification'), type: b.type || 'system', title: b.title || 'Notice', body: b.body || '', date: new Date().toISOString().slice(0, 16).replace('T', ' ') };
    s.notifications.unshift(n); store.save();
    return ok({ notification: n }, 'Notification sent');
  },
  'GET /events': () => {
    const s = store.get(); const ev = s.events || [];
    const counts = {}; ev.forEach((e) => { counts[e.name] = (counts[e.name] || 0) + 1; });
    return ok({ total: ev.length, counts, recent: ev.slice(-30).reverse() });
  },
  'GET /orders': (b) => {
    let list = store.get().orders;
    if (b.type) list = list.filter((o) => o.type === b.type);
    return ok({ list: [...list].reverse() });
  },
  'POST /settings': (b) => {
    const s = store.get(); Object.assign(s.settings, b.settings || {}); store.save();
    return ok({ settings: s.settings }, 'Settings saved');
  },
  'POST /drawWinner': (b) => {
    const s = store.get(); const p = s.products.find((x) => x.id === Number(b.productId));
    if (!p) return err('Product not found');
    p.status = 'done';
    const w = { id: store.nextId('winner'), name: (b.name || 'user') + '***', product: p.title, avatar: store.img('home/img_Winning.png'), code: 'OR' + Date.now().toString().slice(-8), shares: b.shares || 1, date: new Date().toISOString().slice(0, 10) };
    s.winners.unshift(w); store.save();
    return ok({ winner: w }, 'Winner drawn');
  },
};
const ADMIN_PUBLIC = new Set(['POST /login']);

// ----------------------------- plumbing -----------------------------
function send(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, token, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Cache-Control': 'no-store',
  });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => { raw += c; if (raw.length > 2e6) req.destroy(); });
    req.on('end', () => { if (!raw) return resolve({}); try { resolve(JSON.parse(raw)); } catch { resolve(Object.fromEntries(new URLSearchParams(raw))); } });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const body = { ...Object.fromEntries(url.searchParams), ...(await readBody(req)) };

  try {
    if (url.pathname.startsWith('/admin/api/')) {
      const key = req.method + ' /' + url.pathname.replace(/^\/admin\/api\//, '');
      // match /collection/save etc. and /collection?name=
      const handler = adminRoutes[key] || adminRoutes[req.method + ' /' + url.pathname.replace(/^\/admin\/api\//, '').split('/')[0]];
      if (!handler) return send(res, 404, err('Not found'));
      const admin = adminByToken(req);
      if (!ADMIN_PUBLIC.has(key) && !admin) return send(res, 200, err('Admin sign-in required', 401));
      return send(res, 200, handler(body, { admin }));
    }

    const path = url.pathname.replace(/^\/api/, '');
    const handler = userRoutes[path];
    if (!handler) return send(res, 404, err('Not found'));
    const user = userByToken(req);
    if (USER_AUTH.has(path) && !user) return send(res, 200, err('Please sign in', 401));
    return send(res, 200, handler(body, { user }));
  } catch (e) {
    return send(res, 200, err('Server error: ' + e.message));
  }
});

server.listen(PORT, () => {
  console.log(`ORich real API → http://localhost:${PORT}`);
  console.log(`  user:  POST /api/index/index`);
  console.log(`  admin: POST /admin/api/login  (admin / admin123)`);
});
