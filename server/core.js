'use strict';
/**
 * Runtime-agnostic ORich API core. No http, no fs — everything goes through the
 * injected `store` ({ get, save, nextId, img, saveUpload }). Used by both the
 * Node server (server/index.js) and the Cloudflare Worker (worker/src/index.js).
 *
 *   const core = createCore(store, seed, { hideOtp });
 *   core.handleUser(path, body, { user, lang })  -> { code, msg, data }
 *   core.handleAdmin(key, body, { admin })       -> { code, msg, data }
 */
module.exports = function createCore(store, seed, opts = {}) {
  const hideOtp = !!opts.hideOtp;
  const ok = (data = {}, msg = 'success') => ({ code: 1, msg, data });
  const err = (msg = 'error', code = 0) => ({ code, msg, data: null });
  const rupees = (paise) => (paise / 100).toFixed(2);
  const token = (p) => p + Math.random().toString(36).slice(2) + Date.now().toString(36);
  const DAY = 864e5;

  function productView(p) {
    const percent = Math.min(100, Math.round((p.joined / p.total) * 100));
    return { ...p, remaining: Math.max(0, p.total - p.joined), percent };
  }
  const DET_NAMES = ['rahul', 'meena', 'arjun', 'sana', 'abdul', 'babu', 'praveen', 'sultan', 'vikram', 'neha', 'rohit', 'priya', 'deepak', 'anjali'];
  const DET_AVS = ['networkimg/abdul.png', 'networkimg/babu.png', 'networkimg/behrul-islam.png', 'networkimg/praveen.png', 'networkimg/sultan.png', 'networkimg/user.png'];
  const DET_CITIES = ['Delhi', 'Mumbai', 'Pune', 'Jaipur', 'Surat', 'Patna', 'Kochi', 'Indore'];
  const DET_REVIEWS = [
    'Genuine product and super fast delivery. Highly recommended!',
    'Won on my 3rd try and received it within a week. Thank you ORich!',
    'Great experience — packaging was neat and factory sealed.',
  ];
  const fmtTime = (ms) => new Date(ms).toISOString().slice(0, 16).replace('T', ' ');
  function productDetailView(p) {
    const base = productView(p);
    const av = (i) => store.img(DET_AVS[((i % DET_AVS.length) + DET_AVS.length) % DET_AVS.length]);
    const now = Date.now();
    const participants = Array.from({ length: 8 }, (_, i) => ({
      name: DET_NAMES[(p.id * 3 + i) % DET_NAMES.length] + '***', avatar: av(p.id + i),
      shares: ((p.id * 7 + i * 13) % 50) + 1, ip: 'IP ' + DET_CITIES[(p.id + i) % DET_CITIES.length],
      time: fmtTime(now - (i + 1) * 3600 * 1000 * (1 + (i % 4))),
    }));
    const mv = p.marketValue;
    const prizeTiers = [
      { rank: 1, icon: store.img('goods/icon_Firstprize.png'), name: p.title, value: mv },
      { rank: 2, icon: store.img('goods/icon_Secondprize.png'), name: 'Cash prize', value: Math.round(mv * 0.05) },
      { rank: 3, icon: store.img('goods/icon_Thirdprize.png'), name: 'Cash prize', value: Math.round(mv * 0.02) },
    ];
    const reviews = Array.from({ length: 3 }, (_, i) => ({
      name: DET_NAMES[(p.id + i * 5) % DET_NAMES.length] + '***', avatar: av(p.id * 2 + i), vip: i === 0,
      time: new Date(now - (i + 2) * 86400 * 1000).toISOString().slice(0, 10), title: p.title,
      content: DET_REVIEWS[i % DET_REVIEWS.length],
      images: i === 0 ? [store.img('goods/prompt.png'), store.img('goods/prompt-2.png'), store.img('goods/prompt-3.png')] : [],
    }));
    const winners = store.get().winners.slice(0, 3).map((w) => ({ ...w, product: p.title, cover: p.cover }));
    return { ...base, peopleAvatars: participants.slice(0, 5).map((x) => x.avatar), participants, prizeTiers, winners, reviews };
  }
  function userView(u) {
    return { id: u.id, phone: u.phone, nickname: u.nickname || ('ORich' + u.phone.slice(-4)), avatar: u.avatar, balance: rupees(u.balance), frozen: rupees(u.frozen), inviteCode: u.inviteCode, teamCount: u.teamCount, vip: u.vip || null };
  }

  function addOrder(userId, type, extra) {
    const s = store.get();
    const order = { id: store.nextId('order'), userId, type, date: new Date().toISOString().slice(0, 10), ...extra };
    s.orders.push(order); store.save();
    return order;
  }
  const ordersOf = (userId, type) => store.get().orders.filter((o) => o.userId === userId && o.type === type);
  function daysBetween(dateStr) { const t = Date.parse(dateStr + 'T00:00:00Z'); return Number.isFinite(t) ? Math.max(0, Math.floor((Date.now() - t) / DAY)) : 0; }

  function localizeNotif(n, lang) { const tr = lang && lang !== 'en' && seed.contentI18n.notifications[n.id] && seed.contentI18n.notifications[n.id][lang]; return tr ? { ...n, ...tr } : n; }
  function localizeHelp(list, lang) { if (!lang || lang === 'en') return list; return list.map((h) => { const tr = seed.contentI18n.help[h.id] && seed.contentI18n.help[h.id][lang]; return tr ? { ...h, ...tr } : h; }); }

  function creditReferral(spender, amountPaise) {
    if (!spender.invitedBy || !amountPaise) return;
    const s = store.get();
    const direct = s.users.find((u) => u.inviteCode === spender.invitedBy);
    if (!direct) return;
    const c1 = Math.round(amountPaise * 0.08); direct.balance += c1;
    addOrder(direct.id, 'rebate', { product: 'Commission (direct)', amount: rupees(c1), status: 'rewarded', level: 'Direct', from: spender.id });
    const indirect = direct.invitedBy && s.users.find((u) => u.inviteCode === direct.invitedBy);
    if (indirect) { const c2 = Math.round(amountPaise * 0.03); indirect.balance += c2; addOrder(indirect.id, 'rebate', { product: 'Commission (indirect)', amount: rupees(c2), status: 'rewarded', level: 'Indirect', from: spender.id }); }
  }
  function drawProduct(p) {
    const s = store.get(); p.status = 'done';
    const parts = s.orders.filter((o) => o.type === 'join' && o.product === p.title && o.status === 'ongoing');
    if (!parts.length) return;
    const pool = []; parts.forEach((o) => { for (let i = 0; i < (o.shares || 1); i++) pool.push(o); });
    const win = pool[Math.floor(Math.random() * pool.length)];
    parts.forEach((o) => { if (o === win) { o.status = 'won'; } else { o.status = 'refunded'; const u = s.users.find((x) => x.id === o.userId); if (u) u.balance += Math.round(Number(o.amount) * 100); } });
    const winner = s.users.find((u) => u.id === win.userId);
    const nick = (winner && winner.nickname) || ('ORich' + String(winner && winner.phone || '').slice(-4));
    s.winners.unshift({ id: store.nextId('winner'), name: nick.slice(0, 4) + '***', product: p.title, avatar: (winner && winner.avatar) || store.img('home/img_Winning.png'), code: 'OR' + Date.now().toString().slice(-8), shares: win.shares || 1, date: new Date().toISOString().slice(0, 10), images: [] });
  }
  function settleUser(u) {
    const s = store.get(); const nowT = Date.now(); let changed = false;
    for (const o of s.orders) {
      if (o.userId !== u.id || o.type !== 'finance' || o.paid) continue;
      const f = s.finances.find((x) => x.name === o.product); if (!f) continue;
      if (daysBetween(o.date) + 1 >= f.days) {
        const amt = Math.round(Number(o.amount) * 100); const earn = Math.round(amt * (f.rate / 100) * f.days);
        u.balance += amt + earn; o.paid = true; o.status = 'completed';
        addOrder(u.id, 'finance_payout', { product: o.product + ' payout', amount: rupees(amt + earn), status: 'success' });
        changed = true;
      }
    }
    if (u.vip && u.vip.until > nowT) {
      const tier = s.vipTiers.find((v) => v.name === u.vip.name);
      const last = u.vip.lastBonus || u.vip.since || nowT;
      const days = Math.floor((nowT - last) / DAY);
      if (tier && days >= 1) { const bonus = days * tier.dailyBonus * 100; u.balance += bonus; u.vip.lastBonus = last + days * DAY; addOrder(u.id, 'vip_bonus', { product: 'VIP daily bonus ×' + days, amount: rupees(bonus), status: 'rewarded' }); changed = true; }
    }
    if (changed) store.save();
  }
  function financeOrderView(o) {
    const f = store.get().finances.find((x) => x.name === o.product);
    const amount = Number(o.amount) || 0;
    if (!f) return { ...o, progress: 0, earned: '0.00', daysLeft: 0, days: 0, rate: 0 };
    const elapsed = Math.min(f.days, daysBetween(o.date) + 1);
    const earned = (amount * (f.rate / 100) * elapsed).toFixed(2);
    return { ...o, progress: Math.round((elapsed / f.days) * 100), earned, daysLeft: Math.max(0, f.days - elapsed), days: f.days, rate: f.rate, matured: elapsed >= f.days };
  }
  function financeSummary(userId) { const orders = ordersOf(userId, 'finance'); let invested = 0, earnings = 0; for (const o of orders) { const v = financeOrderView(o); invested += Number(o.amount) || 0; earnings += Number(v.earned) || 0; } return { invested: invested.toFixed(2), earnings: earnings.toFixed(2), count: orders.length }; }
  function financeArrivals() { const names = ['rahul', 'meena', 'arjun', 'sana', 'abdul', 'babu', 'praveen', 'sultan']; const avs = ['networkimg/abdul.png', 'networkimg/babu.png', 'networkimg/praveen.png', 'networkimg/sultan.png', 'networkimg/user.png']; return names.map((n, i) => ({ name: n + '***', avatar: store.img(avs[i % avs.length]), amount: ((i * 737 + 500) % 9000 + 1000).toString(), payout: (((i * 737 + 500) % 9000 + 1000) * 0.012).toFixed(2) })); }
  function financeParticipants(planId) { const names = ['vikram', 'neha', 'rohit', 'priya', 'deepak', 'anjali']; const avs = ['networkimg/abdul.png', 'networkimg/babu.png', 'networkimg/praveen.png', 'networkimg/sultan.png']; return names.map((n, i) => ({ name: n + '***', avatar: store.img(avs[(planId + i) % avs.length]), amount: (((planId * 13 + i * 29) % 40 + 5) * 1000).toString(), time: new Date(Date.now() - (i + 1) * 5 * 3600e3).toISOString().slice(0, 16).replace('T', ' ') })); }
  function taskProgress(t, user) {
    let done = 0;
    if (user) { const mine = store.get().orders.filter((o) => o.userId === user.id);
      if (t.type === 'join') done = mine.filter((o) => o.type === 'join').length;
      else if (t.type === 'recharge') done = mine.filter((o) => o.type === 'recharge').length;
      else if (t.type === 'invite') done = teamOf(user).direct.length;
      else if (t.type === 'checkin') done = mine.some((o) => o.type === 'task' && o.date === new Date().toISOString().slice(0, 10)) ? 1 : 0; }
    const target = t.target || 1;
    return { ...t, progress: Math.min(target, done), target, done: done >= target };
  }
  function teamOf(user) {
    const s = store.get();
    const direct = s.users.filter((u) => u.invitedBy && u.invitedBy === user.inviteCode);
    const directCodes = new Set(direct.map((u) => u.inviteCode));
    const indirect = s.users.filter((u) => u.invitedBy && directCodes.has(u.invitedBy));
    const view = (u) => ({ id: u.id, name: (u.nickname || ('ORich' + String(u.phone).slice(-4))), avatar: u.avatar, phone: String(u.phone).replace(/(\d{2})\d+(\d{2})/, '$1****$2'), date: new Date(u.createdAt).toISOString().slice(0, 10), vip: !!u.vip });
    return { direct: direct.map(view), indirect: indirect.map(view), directReward: rebateTotal(user.id, 'Direct'), indirectReward: rebateTotal(user.id, 'Indirect') };
  }
  function lotteryRound() { const span = 3 * 60e3; const endAt = Math.ceil(Date.now() / span) * span; const period = '1' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + String(Math.floor(endAt / span) % 1000).padStart(3, '0'); return { period, endAt, serverTime: Date.now() }; }
  function lotteryResults() { const colors = ['green', 'violet', 'red']; const base = Number(new Date().toISOString().slice(0, 10).replace(/-/g, '')); return Array.from({ length: 8 }, (_, i) => ({ period: '1' + base + String(8 - i).padStart(3, '0'), number: (i * 3 + 7) % 10, color: colors[(i * 3 + 7) % 10 === 0 ? 0 : i % 3] })); }
  function financeHistory(id) { const f = store.get().finances.find((x) => x.id === id); if (!f) return []; const n = Math.min(f.days, 7); return Array.from({ length: n }, (_, i) => ({ day: i + 1, date: new Date(Date.now() - i * DAY).toISOString().slice(0, 10), earning: (f.min * (f.rate / 100)).toFixed(2) })); }
  function rebateList(user) { return store.get().orders.filter((o) => o.userId === user.id && o.type === 'rebate').reverse().map((o) => ({ name: 'Referral commission', level: o.level || 'Direct', date: o.date, amount: o.amount })); }
  function rebateTotal(userId, level) { return store.get().orders.filter((o) => o.userId === userId && o.type === 'rebate' && (!level || o.level === level)).reduce((a, o) => a + (Number(o.amount) || 0), 0).toFixed(2); }
  function inviteTop() { const s = store.get(); const counts = {}; s.users.forEach((u) => { if (u.invitedBy) counts[u.invitedBy] = (counts[u.invitedBy] || 0) + 1; }); const real = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([code, n], i) => ({ rank: i + 1, name: code, invites: n, reward: (n * 25).toFixed(2) })); if (real.length) return real; return [['rahul***', 128], ['meena***', 96], ['arjun***', 74], ['sana***', 61], ['abdul***', 53]].map(([name, n], i) => ({ rank: i + 1, name, invites: n, reward: (n * 25).toFixed(2) })); }

  const userRoutes = {
    '/index/getsystem': () => { const s = store.get(); return ok({ name: s.settings.name, logo: '/static/logo.png', service: s.settings.service, notice: s.settings.notice, tabBarColor: s.settings.tabBarColor, tabBarActive: s.settings.tabBarActive }); },
    '/index/gettitle': () => ok({ banners: [store.img('home/bg_homepage.png'), store.img('home/bg_Yellow.png')] }),
    '/index/index': () => { const s = store.get(); return ok({ banners: [store.img('home/bg_homepage.png'), store.img('home/bg_Yellow.png')], notice: s.settings.notice, entries: [{ key: 'recharge', label: 'Recharge', icon: store.img('home/icon_Recharge.png') }, { key: 'invite', label: 'Invite', icon: store.img('home/icon_Invite.png') }, { key: 'task', label: 'Tasks', icon: store.img('home/icon_Promotion.png') }, { key: 'vip', label: 'VIP', icon: store.img('home/icon_Winner.png') }, { key: 'orders', label: 'My Orders', icon: store.img('home/icon_MyOrders.png') }, { key: 'support', label: 'Support', icon: store.img('home/icon_Support.png') }], hot: s.products.filter((p) => p.hot).map(productView), list: s.products.map(productView), highValue: [...s.products].sort((a, b) => b.marketValue - a.marketValue).slice(0, 4).map(productView), categories: seed.categories, finances: s.finances, winners: s.winners.slice(0, 5) }); },
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
    '/index/help': (b, ctx) => ok({ list: localizeHelp(store.get().helpItems || seed.helpItems, ctx && ctx.lang) }),

    '/index/sendverify': (b) => { if (!/^\d{6,15}$/.test(String(b.phone || ''))) return err('Enter a valid phone number'); const code = String(Math.floor(1000 + Math.random() * 8999)); store.get().otps[b.phone] = code; store.save(); return ok({ sent: true, ...(hideOtp ? {} : { demoCode: code }) }, 'Verification code sent'); },
    '/index/login': (b) => { const phone = String(b.phone || ''); const code = String(b.code || ''); if (!phone) return err('Phone is required'); const s = store.get(); if (!s.otps[phone] || s.otps[phone] !== code) return err('Invalid verification code'); delete s.otps[phone]; let user = s.users.find((u) => u.phone === phone); if (!user) { user = seed.freshUser(); user.id = store.nextId('user'); user.phone = phone; if (b.invite) user.invitedBy = String(b.invite); s.users.push(user); } const t = token('tok_'); s.sessions[t] = user.id; store.save(); return ok({ token: t, user: userView(user) }, 'Logged in'); },
    '/index/logout': (b, ctx) => { delete store.get().sessions[ctx.user.token]; store.save(); return ok({}, 'Logged out'); },
    '/index/useraccount': (b, ctx) => { settleUser(ctx.user.user); return ok({ user: userView(ctx.user.user), finance: financeSummary(ctx.user.user.id) }); },
    '/index/userbalance': (b, ctx) => { const st = store.get().settings; return ok({ balance: rupees(ctx.user.user.balance), frozen: rupees(ctx.user.user.frozen), withdraw: { feePercent: st.withdrawFee ?? seed.withdrawConfig.feePercent, min: st.withdrawMin ?? seed.withdrawConfig.min, arrival: st.withdrawArrival ?? seed.withdrawConfig.arrival } }); },

    '/index/addrechargepay2': (b, ctx) => { const amount = Math.round(Number(b.amount) * 100); if (!amount || amount < 100) return err('Minimum recharge is ₹1'); const u = ctx.user.user; u.balance += amount; const order = addOrder(u.id, 'recharge', { amount: rupees(amount), status: 'success', channel: b.channel || 'upi' }); creditReferral(u, amount); return ok({ order, balance: rupees(u.balance) }, 'Recharge successful'); },
    '/index/addorder': (b, ctx) => { const s = store.get(); const p = s.products.find((x) => x.id === Number(b.id)); if (!p) return err('Product not found'); if (p.status !== 'ongoing') return err('This round is closed'); const shares = Math.max(1, Number(b.shares) || 1); const cost = shares * p.price * 100; const u = ctx.user.user; if (u.balance < cost) return err('Insufficient balance, please recharge'); u.balance -= cost; p.joined = Math.min(p.total, p.joined + shares); const order = addOrder(u.id, 'join', { product: p.title, shares, amount: rupees(cost), status: 'ongoing' }); creditReferral(u, cost); if (p.joined >= p.total && p.status === 'ongoing') drawProduct(p); store.save(); return ok({ order, balance: rupees(u.balance) }, 'Joined successfully'); },
    '/index/financeBuy': (b, ctx) => { const f = store.get().finances.find((x) => x.id === Number(b.id)); if (!f) return err('Plan not found'); const amount = Math.round(Number(b.amount) * 100); const u = ctx.user.user; if (amount < f.min * 100) return err('Below minimum investment'); if (u.balance < amount) return err('Insufficient balance'); u.balance -= amount; const order = addOrder(u.id, 'finance', { product: f.name, amount: rupees(amount), status: 'active' }); creditReferral(u, amount); return ok({ order, balance: rupees(u.balance) }, 'Investment confirmed'); },
    '/index/vipBuy': (b, ctx) => { const v = store.get().vipTiers.find((x) => x.id === Number(b.id)); if (!v) return err('Tier not found'); const u = ctx.user.user; const cost = v.price * 100; if (u.balance < cost) return err('Insufficient balance'); u.balance -= cost; u.vip = { name: v.name, until: Date.now() + v.days * DAY, since: Date.now(), lastBonus: Date.now() }; const order = addOrder(u.id, 'vip', { product: v.name + ' VIP', amount: rupees(cost), status: 'active' }); creditReferral(u, cost); return ok({ order, balance: rupees(u.balance), vip: u.vip }, 'VIP activated'); },
    '/index/luckyBuy': (b, ctx) => { const l = store.get().luckyDraws.find((x) => x.id === Number(b.id)); if (!l) return err('Draw not found'); const u = ctx.user.user; const cost = l.ticket * 100; if (u.balance < cost) return err('Insufficient balance'); u.balance -= cost; l.sold = Math.min(l.pool, l.sold + 1); const order = addOrder(u.id, 'lucky', { product: l.title, amount: rupees(cost), status: 'entered' }); store.save(); return ok({ order, balance: rupees(u.balance) }, 'Entry confirmed'); },
    '/index/taskReceive': (b, ctx) => { const t = store.get().tasks.find((x) => x.id === Number(b.id)); if (!t) return err('Task not found'); const u = ctx.user.user; const today = new Date().toISOString().slice(0, 10); if (store.get().orders.some((o) => o.userId === u.id && o.type === 'task' && o.taskId === t.id && o.date === today)) return err('Already claimed today'); if (t.type !== 'checkin' && !taskProgress(t, u).done) return err('Task not completed yet'); u.balance += t.reward * 100; addOrder(u.id, 'task', { product: t.title, amount: rupees(t.reward * 100), status: 'rewarded', taskId: t.id }); return ok({ balance: rupees(u.balance) }, 'Reward +₹' + t.reward); },

    '/index/ordernews': (b, ctx) => ok({ list: ordersOf(ctx.user.user.id, 'join') }),
    '/index/userjoin': (b, ctx) => ok({ list: ordersOf(ctx.user.user.id, 'join') }),
    '/index/myFinanceList': (b, ctx) => { settleUser(ctx.user.user); return ok({ list: ordersOf(ctx.user.user.id, 'finance').map(financeOrderView) }); },
    '/index/luckyOrderList': (b, ctx) => ok({ list: ordersOf(ctx.user.user.id, 'lucky') }),
    '/index/mywinner': (b, ctx) => ok({ list: store.get().winners.slice(0, 2) }),
    '/index/usershare': (b, ctx) => ok({ list: store.get().winners.slice(0, 2) }),
    '/index/myteam': (b, ctx) => { const tm = teamOf(ctx.user.user); return ok({ count: tm.direct.length + tm.indirect.length, inviteCode: ctx.user.user.inviteCode, directCount: tm.direct.length, indirectCount: tm.indirect.length, directReward: tm.directReward, indirectReward: tm.indirectReward, levels: [{ level: 1, members: tm.direct.length, commission: tm.directReward }, { level: 2, members: tm.indirect.length, commission: tm.indirectReward }], list: tm.direct, indirect: tm.indirect }); },
    '/index/userinvitelist': (b, ctx) => { const tm = teamOf(ctx.user.user); return ok({ inviteCode: ctx.user.user.inviteCode, rules: seed.inviteRules, list: tm.direct.concat(tm.indirect) }); },
    '/index/price': () => ok({ list: store.get().prizes }),
    '/index/getactivity': () => ok({ list: store.get().games }),
    '/index/userwithdraw': (b, ctx) => { const amount = Math.round(Number(b.amount) * 100); const u = ctx.user.user; if (!amount || amount < 10000) return err('Minimum withdrawal is ₹100'); if (u.balance < amount) return err('Insufficient balance'); if (!(u.banks || []).length) return err('Add a bank account first'); u.balance -= amount; const order = addOrder(u.id, 'withdraw', { amount: rupees(amount), status: 'pending' }); return ok({ order, balance: rupees(u.balance) }, 'Withdrawal requested'); },
    '/index/cashlist': (b, ctx) => ok({ list: ordersOf(ctx.user.user.id, 'withdraw') }),
    '/index/rechargerecord': (b, ctx) => ok({ list: ordersOf(ctx.user.user.id, 'recharge') }),
    '/index/banklist': (b, ctx) => ok({ list: ctx.user.user.banks || [] }),
    '/index/bankadd': (b, ctx) => { const u = ctx.user.user; u.banks = u.banks || []; const bank = { id: store.nextId('order'), type: b.type || 'Bank', holder: b.holder || '', number: b.number || '' }; u.banks.push(bank); store.save(); return ok({ bank }, 'Bank added'); },
    '/index/bankdel': (b, ctx) => { const u = ctx.user.user; u.banks = (u.banks || []).filter((x) => x.id !== Number(b.id)); store.save(); return ok({}, 'Removed'); },
    '/index/addresslist': (b, ctx) => ok({ list: ctx.user.user.addresses || [] }),
    '/index/addressadd': (b, ctx) => { const u = ctx.user.user; u.addresses = u.addresses || []; const a = { id: store.nextId('order'), name: b.name || '', phone: b.phone || '', line: b.line || '', isDefault: !u.addresses.length }; u.addresses.push(a); store.save(); return ok({ address: a }, 'Address saved'); },
    '/index/addressdel': (b, ctx) => { const u = ctx.user.user; u.addresses = (u.addresses || []).filter((x) => x.id !== Number(b.id)); store.save(); return ok({}, 'Removed'); },
    '/index/accountedit': (b, ctx) => { const u = ctx.user.user; if (b.nickname) u.nickname = String(b.nickname).slice(0, 24); store.save(); return ok({ user: userView(u) }, 'Saved'); },
    '/index/orderdetail': (b, ctx) => { const o = store.get().orders.find((x) => x.id === Number(b.id) && x.userId === ctx.user.user.id); return o ? ok({ order: o }) : err('Order not found'); },

    '/index/duobaoitem': () => ok({ list: store.get().products.map(productView) }),
    '/index/duobaoitem1': () => ok({ list: store.get().products.map(productView) }),
    '/index/kind': () => ok({ list: seed.categories }),
    '/index/duobaoitemjoinlist': (b) => { const p = store.get().products.find((x) => x.id === Number(b.id)); return p ? ok({ list: productDetailView(p).participants }) : err('Product not found'); },
    '/index/duobaoitemhistory': (b) => { const p = store.get().products.find((x) => x.id === Number(b.id)); return ok({ list: store.get().winners.slice(0, 5).map((w) => ({ ...w, product: p ? p.title : w.product })) }); },
    '/index/duobaoitemshare': (b) => ok({ link: 'https://orich.example/goods/' + (b.id || ''), poster: store.img('goods/img_confirm.png'), code: 'OR' + (b.id || '') }),
    '/index/duobaoitemlottery': (b) => { const p = store.get().products.find((x) => x.id === Number(b.id)); return ok({ item: p ? productView(p) : null, winner: store.get().winners[0] || null }); },
    '/index/activitydetail': (b) => { const g = store.get().games.find((x) => x.id === Number(b.id)) || store.get().games[0]; return ok({ item: g, ...lotteryRound() }); },
    '/index/getlotterytime': () => ok(lotteryRound()),
    '/index/getlotteryresult': () => ok({ list: lotteryResults() }),
    '/index/getnumbermax': () => ok({ max: 9, maxBet: 100000 }),
    '/index/financeOrderRecent': () => ok({ list: financeArrivals() }),
    '/index/financeDetailHistory': (b) => ok({ list: financeHistory(Number(b.id)) }),
    '/index/getanswer': (b, ctx) => ok({ list: localizeHelp(store.get().helpItems || seed.helpItems, ctx && ctx.lang) }),
    '/index/runoobdetail': (b, ctx) => { const l = ctx && ctx.lang; const r = (l && seed.contentI18n.rules[l]) || seed.inviteRules; return ok({ title: 'Rules', content: r.join('\n') }); },
    '/index/chlwhatsapp': () => ok({ url: store.get().settings.service }),
    '/index/paystatus': (b) => ok({ orderId: b.id || null, status: 'success', paid: true }),
    '/index/itemshare': (b) => ok({ link: 'https://orich.example/order/' + (b.id || ''), poster: store.img('goods/ing_Successfulpurchase.png') }),
    '/index/userinvitetop': () => ok({ list: inviteTop() }),
    '/index/notifications': (b, ctx) => { const s = store.get(); const u = ctx && ctx.user && ctx.user.user; const read = new Set((u && u.readNotifs) || []); const list = s.notifications.map((n) => ({ ...localizeNotif(n, ctx && ctx.lang), read: read.has(n.id) })); return ok({ list, unread: list.filter((n) => !n.read).length }); },
    '/index/notifyread': (b, ctx) => { const u = ctx.user.user; u.readNotifs = u.readNotifs || []; if (b.id) { if (!u.readNotifs.includes(Number(b.id))) u.readNotifs.push(Number(b.id)); } else { u.readNotifs = store.get().notifications.map((n) => n.id); } store.save(); return ok({}, 'Marked read'); },
    '/index/checkupdate': () => { const u = seed.appUpdate; return ok({ ...u, hasUpdate: u.latest !== u.version }); },
    '/index/upload': (b) => { const data = b.image || b.file || ''; if (!data) return err('No image provided'); const url = store.saveUpload ? store.saveUpload(data) : null; return ok({ url: url || data }, url ? 'Uploaded' : 'ok'); },
    '/index/track': (b, ctx) => { const s = store.get(); s.events = s.events || []; const uid = ctx && ctx.user && ctx.user.user ? ctx.user.user.id : null; s.events.push({ name: String(b.name || 'event'), props: b.props || {}, userId: uid, ts: Date.now() }); if (s.events.length > 2000) s.events = s.events.slice(-2000); store.save(); return ok({ logged: true }); },
    '/index/userrebatelist': (b, ctx) => ok({ list: rebateList(ctx.user.user) }),
    '/index/userconsume': (b, ctx) => ok({ list: store.get().orders.filter((o) => o.userId === ctx.user.user.id && o.type !== 'recharge').reverse() }),
    '/index/useritem': (b, ctx) => ok({ list: ordersOf(ctx.user.user.id, 'join') }),
    '/index/getUserAfs': (b, ctx) => ok({ list: ordersOf(ctx.user.user.id, 'afs') }),
    '/index/editAfStatus': () => ok({}, 'After-sales updated'),
    '/index/itemdetail': (b, ctx) => { const o = store.get().orders.find((x) => x.id === Number(b.id) && x.userId === ctx.user.user.id); return o ? ok({ item: o }) : err('Not found'); },
    '/index/itemedit': (b, ctx) => { const o = store.get().orders.find((x) => x.id === Number(b.id) && x.userId === ctx.user.user.id); if (!o) return err('Not found'); if (b.addressId != null) o.addressId = Number(b.addressId); store.save(); return ok({ item: o }, 'Saved'); },
    '/index/itemdefaultaddr': (b, ctx) => { const list = ctx.user.user.addresses || []; return ok({ address: list.find((a) => a.isDefault) || list[0] || null }); },
    '/index/addorderpay': (b) => { const p = store.get().products.find((x) => x.id === Number(b.id)); if (!p) return err('Product not found'); const shares = Math.max(1, Number(b.shares) || 1); const cost = shares * p.price * 100; return ok({ payUrl: 'https://orich.example/pay?o=' + Date.now() + '&amt=' + rupees(cost), amount: rupees(cost), channel: b.channel || 'upi' }, 'Proceed to payment'); },
    '/index/joinactivity': (b, ctx) => { const u = ctx.user.user; const amount = Math.round(Number(b.amount || b.ticket || 10) * 100); if (!amount || u.balance < amount) return err('Insufficient balance'); u.balance -= amount; const label = 'Lucky Ball' + (b.color ? ' ' + b.color : '') + (b.number != null ? ' #' + b.number : ''); const order = addOrder(u.id, 'lucky', { product: label, amount: rupees(amount), status: 'entered' }); return ok({ order, balance: rupees(u.balance), ...lotteryRound() }, 'Bet placed'); },
    '/index/bankedit': (b, ctx) => { const bk = (ctx.user.user.banks || []).find((x) => x.id === Number(b.id)); if (!bk) return err('Not found'); if (b.type != null) bk.type = b.type; if (b.holder != null) bk.holder = b.holder; if (b.number != null) bk.number = b.number; store.save(); return ok({ bank: bk }, 'Saved'); },
    '/index/addressedit': (b, ctx) => { const a = (ctx.user.user.addresses || []).find((x) => x.id === Number(b.id)); if (!a) return err('Not found'); ['name', 'phone', 'line'].forEach((k) => { if (b[k] != null) a[k] = b[k]; }); store.save(); return ok({ address: a }, 'Saved'); },
    '/index/addresschangedefault': (b, ctx) => { (ctx.user.user.addresses || []).forEach((a) => { a.isDefault = a.id === Number(b.id); }); store.save(); return ok({}, 'Default address set'); },
  };

  const USER_AUTH = new Set(['/index/useraccount', '/index/userbalance', '/index/addrechargepay2', '/index/addorder', '/index/ordernews', '/index/userjoin', '/index/mywinner', '/index/usershare', '/index/logout', '/index/financeBuy', '/index/myFinanceList', '/index/myteam', '/index/userinvitelist', '/index/vipBuy', '/index/luckyBuy', '/index/luckyOrderList', '/index/taskReceive', '/index/userrebatelist', '/index/userconsume', '/index/useritem', '/index/getUserAfs', '/index/editAfStatus', '/index/itemdetail', '/index/itemedit', '/index/itemdefaultaddr', '/index/addorderpay', '/index/joinactivity', '/index/bankedit', '/index/addressedit', '/index/addresschangedefault', '/index/notifyread']);

  const COLLECTIONS = { products: 'product', winners: 'winner', finances: 'finance', tasks: null, vipTiers: 'vip', luckyDraws: 'lucky' };
  const adminRoutes = {
    'POST /login': (b) => { const s = store.get(); const a = s.admins.find((x) => x.username === b.username && x.password === b.password); if (!a) return err('Invalid credentials', 401); const t = token('adm_'); s.adminSessions[t] = a.username; store.save(); return ok({ token: t, name: a.name, username: a.username }, 'Logged in'); },
    'GET /me': (b, ctx) => ok({ username: ctx.admin.username }),
    'POST /logout': (b, ctx) => { delete store.get().adminSessions[ctx.admin.token]; store.save(); return ok({}, 'Logged out'); },
    'GET /stats': () => { const s = store.get(); const sum = (t) => s.orders.filter((o) => o.type === t).reduce((a, o) => a + Number(o.amount), 0); return ok({ users: s.users.length, products: s.products.length, winners: s.winners.length, orders: s.orders.length, recharge: sum('recharge').toFixed(2), joins: sum('join').toFixed(2), finance: sum('finance').toFixed(2), vip: sum('vip').toFixed(2), withdraw: sum('withdraw').toFixed(2), pendingWithdraw: s.orders.filter((o) => o.type === 'withdraw' && o.status === 'pending').length, pendingRecharge: s.orders.filter((o) => o.type === 'recharge' && o.status === 'pending').length, notifications: (s.notifications || []).length, events: (s.events || []).length, settings: s.settings }); },
    'GET /collection': (b) => { const s = store.get(); return s[b.name] ? ok({ list: s[b.name] }) : err('Unknown collection'); },
    'POST /collection/save': (b) => { const s = store.get(); const list = s[b.name]; if (!list) return err('Unknown collection'); const item = b.item || {}; if (item.id) { const row = list.find((x) => x.id === Number(item.id)); if (!row) return err('Not found'); Object.assign(row, item, { id: row.id }); } else { const seqKey = COLLECTIONS[b.name]; item.id = seqKey ? store.nextId(seqKey) : (list.reduce((m, x) => Math.max(m, x.id || 0), 0) + 1); list.push(item); } store.save(); return ok({ item }, 'Saved'); },
    'POST /collection/delete': (b) => { const s = store.get(); const list = s[b.name]; if (!list) return err('Unknown collection'); s[b.name] = list.filter((x) => x.id !== Number(b.id)); store.save(); return ok({}, 'Deleted'); },
    'GET /users': () => ok({ list: store.get().users.map(userView) }),
    'POST /users/adjust': (b) => { const u = store.get().users.find((x) => x.id === Number(b.id)); if (!u) return err('User not found'); u.balance = Math.max(0, u.balance + Math.round(Number(b.delta) * 100)); store.save(); return ok({ user: userView(u) }, 'Balance updated'); },
    'POST /users/save': (b) => { const u = store.get().users.find((x) => x.id === Number(b.id)); if (!u) return err('User not found'); if (b.nickname != null) u.nickname = String(b.nickname).slice(0, 24); if (b.balance != null) u.balance = Math.max(0, Math.round(Number(b.balance) * 100)); if (b.frozen != null) u.frozen = Math.max(0, Math.round(Number(b.frozen) * 100)); if (b.vip !== undefined) u.vip = b.vip ? { name: b.vip, until: Date.now() + 30 * DAY } : null; store.save(); return ok({ user: userView(u) }, 'User saved'); },
    'POST /users/delete': (b) => { const s = store.get(); s.users = s.users.filter((x) => x.id !== Number(b.id)); store.save(); return ok({}, 'User deleted'); },
    'GET /user': (b) => { const s = store.get(); const u = s.users.find((x) => x.id === Number(b.id)); if (!u) return err('User not found'); return ok({ user: userView(u), orders: s.orders.filter((o) => o.userId === u.id).reverse(), banks: u.banks || [], addresses: u.addresses || [], team: teamOf(u) }); },
    'POST /orders/status': (b) => { const s = store.get(); const o = s.orders.find((x) => x.id === Number(b.id)); if (!o) return err('Order not found'); const prev = o.status; const next = b.status || o.status; if (o.type === 'withdraw' && next === 'rejected' && prev !== 'rejected') { const u = s.users.find((x) => x.id === o.userId); if (u) u.balance += Math.round(Number(o.amount) * 100); } o.status = next; store.save(); return ok({ order: o }, 'Order updated'); },
    'POST /orders/delete': (b) => { const s = store.get(); s.orders = s.orders.filter((x) => x.id !== Number(b.id)); store.save(); return ok({}, 'Order deleted'); },
    'POST /notify/send': (b) => { const s = store.get(); const n = { id: store.nextId('notification'), type: b.type || 'system', title: b.title || 'Notice', body: b.body || '', date: new Date().toISOString().slice(0, 16).replace('T', ' ') }; s.notifications.unshift(n); store.save(); return ok({ notification: n }, 'Notification sent'); },
    'GET /events': () => { const s = store.get(); const ev = s.events || []; const counts = {}; ev.forEach((e) => { counts[e.name] = (counts[e.name] || 0) + 1; }); return ok({ total: ev.length, counts, recent: ev.slice(-30).reverse() }); },
    'GET /orders': (b) => { let list = store.get().orders; if (b.type) list = list.filter((o) => o.type === b.type); return ok({ list: [...list].reverse() }); },
    'POST /settings': (b) => { const s = store.get(); Object.assign(s.settings, b.settings || {}); store.save(); return ok({ settings: s.settings }, 'Settings saved'); },
    'POST /drawWinner': (b) => { const s = store.get(); const p = s.products.find((x) => x.id === Number(b.productId)); if (!p) return err('Product not found'); p.status = 'done'; const w = { id: store.nextId('winner'), name: (b.name || 'user') + '***', product: p.title, avatar: store.img('home/img_Winning.png'), code: 'OR' + Date.now().toString().slice(-8), shares: b.shares || 1, date: new Date().toISOString().slice(0, 10) }; s.winners.unshift(w); store.save(); return ok({ winner: w }, 'Winner drawn'); },
  };
  const ADMIN_PUBLIC = new Set(['POST /login']);

  function resolveUser(headers) {
    const t = headers.token || (headers.authorization || '').replace(/^Bearer\s+/i, '');
    const id = t && store.get().sessions[t];
    const user = id && store.get().users.find((u) => u.id === id);
    return user ? { token: t, user } : null;
  }
  function resolveAdmin(headers) {
    const t = (headers.authorization || '').replace(/^Bearer\s+/i, '') || headers.token;
    return t && store.get().adminSessions[t] ? { token: t, username: store.get().adminSessions[t] } : null;
  }

  // High-level dispatchers used by both adapters.
  function handleUser(path, body, headers) {
    const handler = userRoutes[path];
    if (!handler) return { status: 404, json: err('Not found') };
    const user = resolveUser(headers);
    if (USER_AUTH.has(path) && !user) return { status: 200, json: err('Please sign in', 401) };
    const lang = String(headers.lang || body.lang || 'en').toLowerCase();
    return { status: 200, json: handler(body, { user, lang }) };
  }
  function handleAdmin(key, body, headers) {
    const sp = key.indexOf(' ');
    const method = key.slice(0, sp); const p = key.slice(sp + 1);           // e.g. "POST", "/collection/save"
    const handler = adminRoutes[key] || adminRoutes[method + ' /' + p.split('/')[1]];
    if (!handler) return { status: 404, json: err('Not found') };
    const admin = resolveAdmin(headers);
    if (!ADMIN_PUBLIC.has(key) && !admin) return { status: 200, json: err('Admin sign-in required', 401) };
    return { status: 200, json: handler(body, { admin }) };
  }

  return { ok, err, userRoutes, adminRoutes, USER_AUTH, COLLECTIONS, ADMIN_PUBLIC, resolveUser, resolveAdmin, handleUser, handleAdmin };
};
