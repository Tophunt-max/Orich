'use strict';
// In-memory demo data for the ORich-style group-buy / wallet / finance app.
// Money is stored in integer paise (1 rupee = 100) and formatted at the edges.

function img(p) {
  return '/static/image/' + p;
}

const HOUR = 3600e3;
const now = Date.now();
// Home category tabs (home ltab).
const categories = ['All', 'Electronics', 'Vehicle', 'Gold', 'Home'];

const products = [
  {
    id: 1,
    title: 'iPhone 15 Pro Max 256GB',
    subtitle: 'Natural Titanium',
    cover: '/static/products/p1.svg',
    price: 10,            // join price per share, in rupees
    marketValue: 159900,  // rupees
    total: 16000,         // shares needed
    joined: 12840,
    status: 'ongoing',    // ongoing | drawing | done
    hot: true,
    category: 'Electronics',
    endAt: now + 6 * HOUR + 42 * 60e3, // lucky-draw close time (ms)
  },
  {
    id: 2,
    title: 'Royal Enfield Classic 350',
    subtitle: 'Halcyon Green',
    cover: '/static/products/p2.svg',
    price: 20,
    marketValue: 193000,
    total: 9650,
    joined: 9650,
    status: 'drawing',
    hot: true,
    category: 'Vehicle',
    endAt: now - 2 * HOUR,
  },
  {
    id: 3,
    title: '1 Gram Gold Coin (24K)',
    subtitle: 'Certified 999.9',
    cover: '/static/products/p3.svg',
    price: 5,
    marketValue: 7400,
    total: 1480,
    joined: 430,
    status: 'ongoing',
    hot: false,
    category: 'Gold',
    endAt: now + 26 * HOUR,
  },
  {
    id: 4,
    title: 'Samsung 55" 4K Smart TV',
    subtitle: 'Crystal UHD',
    cover: '/static/products/p4.svg',
    price: 10,
    marketValue: 54990,
    total: 5500,
    joined: 2210,
    status: 'ongoing',
    hot: true,
    category: 'Home',
    endAt: now + 3 * HOUR,
  },
];

const winners = [
  { id: 101, name: 'rahul***', product: 'iPhone 14 128GB', avatar: img('networkimg/abdul.png'), code: 'OR20260108', shares: 36, date: '2026-11-08', images: [img('goods/prompt.png'), img('goods/prompt-2.png')] },
  { id: 102, name: 'meena***', product: 'Gold Coin 2g', avatar: img('networkimg/babu.png'), code: 'OR20260107', shares: 12, date: '2026-11-07', images: [img('goods/prompt-3.png')] },
  { id: 103, name: 'arjun***', product: 'OnePlus 12R', avatar: img('networkimg/praveen.png'), code: 'OR20260106', shares: 58, date: '2026-11-06', images: [] },
  { id: 104, name: 'sana***', product: 'Smart Watch', avatar: img('networkimg/sultan.png'), code: 'OR20260105', shares: 9, date: '2026-11-05', images: [] },
];

const finances = [
  { id: 1, name: 'ORich Daily 7', rate: 0.8, days: 7, min: 500, max: 50000, desc: 'Fixed daily return, principal returned on maturity.' },
  { id: 2, name: 'ORich Flex 30', rate: 1.2, days: 30, min: 1000, max: 200000, desc: 'Higher daily return over a 30-day lock-in.' },
  { id: 3, name: 'ORich Prime 90', rate: 1.6, days: 90, min: 5000, max: 500000, desc: 'Our best rate for a 90-day commitment.' },
];

const rechargeOptions = [100, 300, 500, 1000, 2000, 5000];

// Daily tasks (2.1.4 task/taskList + taskReceive). `target` drives the progress ring.
const tasks = [
  { id: 1, title: 'Daily check-in', reward: 5, type: 'checkin', target: 1, group: 'daily', icon: img('home/icon_Promotion.png') },
  { id: 2, title: 'Join any group-buy', reward: 10, type: 'join', target: 1, group: 'mission', icon: img('home/icon_1GroupBuy.png') },
  { id: 3, title: 'Invite a friend', reward: 50, type: 'invite', target: 3, group: 'mission', icon: img('home/icon_Invite.png') },
  { id: 4, title: 'Recharge ₹500+', reward: 20, type: 'recharge', target: 1, group: 'mission', icon: img('home/icon_Recharge.png') },
];

// VIP membership tiers (2.1.4 vip / vipBuy).
const vipTiers = [
  { id: 1, name: 'Silver', price: 299, days: 30, dailyBonus: 5, rebate: 2, color: '#9aa7b5' },
  { id: 2, name: 'Gold', price: 799, days: 30, dailyBonus: 18, rebate: 4, color: '#e0a73a' },
  { id: 3, name: 'Platinum', price: 1999, days: 30, dailyBonus: 55, rebate: 7, color: '#6c5ce7' },
];
// VIP benefits grid + privilege list shown on pages/task/member.
const vipConfig = {
  benefits: [
    { icon: img('member/icon_redenvelope.png'), label: 'Daily bonus' },
    { icon: img('member/icon_Cash.png'), label: 'Higher rebate' },
    { icon: img('member/icon_goldcoins.png'), label: 'Bonus coins' },
    { icon: img('member/icon_Withdrawal.png'), label: 'Fast withdraw' },
    { icon: img('member/icon_winning.png'), label: 'Extra draws' },
    { icon: img('member/icon_benefits.png'), label: 'VIP support' },
  ],
  privileges: [
    'Earn a fixed bonus credited to your wallet every day.',
    'Higher referral rebate on every invited friend who joins.',
    'Priority customer support and faster withdrawals.',
    'Exclusive VIP-only lucky draws and promotions.',
  ],
};
// FAQ / help (pages/help/help) with category + icon.
const helpItems = [
  { id: 1, category: 'Group buy', q: 'How does a group-buy work?', a: 'Buy one or more shares of a product. When all shares sell, a winner is drawn and receives the product. Everyone who did not win gets a full refund.', icon: img('home/icon_1GroupBuy.png') },
  { id: 2, category: 'Wallet', q: 'How do I recharge?', a: 'Open Account → Wallet → Recharge, pick an amount and a payment channel, then complete the payment.', icon: img('home/icon_Recharge.png') },
  { id: 3, category: 'VIP', q: 'What is VIP membership?', a: 'A paid membership that pays a daily bonus and a higher referral rebate, plus faster withdrawals and exclusive draws.', icon: img('home/icon_Winner.png') },
  { id: 4, category: 'Invite', q: 'How do referrals pay out?', a: 'Share your invite code. You earn commission whenever an invited friend joins a group-buy or recharges.', icon: img('home/icon_Invite.png') },
  { id: 5, category: 'Withdraw', q: 'How long do withdrawals take?', a: 'Withdrawals are processed to your bank account within 1 working day (T+1) after approval.', icon: img('home/icon_Support.png') },
];
// Invitation rules text (pages/invitation/invitation).
const inviteRules = [
  'Share your unique invite link or code with friends.',
  'Your friend registers using your code and becomes your direct referral.',
  'You earn a commission every time they join a group-buy or recharge.',
  'Friends invited by your referrals become indirect referrals and also earn you a bonus.',
];
// Recharge channels + withdraw config (payment pages).
const payChannels = [
  { key: 'upi', name: 'UPI', icon: img('pay/paytm.png') },
  { key: 'xpay', name: 'XPay', icon: img('pay/xpay.png') },
];
const withdrawConfig = { feePercent: 2, min: 100, arrival: 'T+1 working day' };

// Lucky instant-draw rounds (2.1.4 luckyList / luckyNow / luckyBuy).
const luckyDraws = [
  { id: 1, title: 'Lucky ₹1 Gold Draw', ticket: 1, pool: 500, sold: 318, prize: '1g Gold Coin', cover: '/static/products/lucky.svg' },
  { id: 2, title: 'Lucky ₹5 Cash Blast', ticket: 5, pool: 200, sold: 96, prize: '₹1,000 Cash', cover: '/static/products/cash.svg' },
];

// Prizes / prize pool (pages/prize/prize).
const prizes = [
  { id: 1, name: '₹100 Cashback', cost: 500, cover: img('home/icon_Recharge.png') },
  { id: 2, name: 'Free Lucky Ticket', cost: 200, cover: '/static/products/lucky.svg' },
  { id: 3, name: 'VIP Silver 7 days', cost: 1500, cover: '/static/products/cash.svg' },
];

// Mini games (pages/game/game).
const games = [
  { id: 1, name: 'Spin & Win', cover: '/static/products/lucky.svg', ticket: 10 },
  { id: 2, name: 'Lucky Dice', cover: '/static/products/cash.svg', ticket: 5 },
];

// Push-style in-app notifications (GeTui/message parity). `read` is tracked per-user.
const notifications = [
  { id: 1, type: 'winner', title: 'Lucky draw result', body: 'rahul*** just won an iPhone 14 128GB. The next draw closes soon — join now!', date: '2026-11-10 20:14' },
  { id: 2, type: 'promo', title: 'VIP Gold -20% today', body: 'Activate Gold VIP today and get 20% off plus a higher daily bonus.', date: '2026-11-10 09:00' },
  { id: 3, type: 'order', title: 'Order update', body: 'Your group-buy entry is confirmed. We will notify you when the draw happens.', date: '2026-11-09 18:30' },
  { id: 4, type: 'system', title: 'Welcome to ORich', body: 'Recharge your wallet, join 1₹ group-buys and win big. Invite friends to earn commission.', date: '2026-11-08 12:00' },
];
// App version / OTA update info (DCloud OTA parity).
const appUpdate = { version: '2.1.4', latest: '2.1.4', url: 'https://orich.in/', notes: 'Bug fixes and performance improvements.' };

// A single demo account keyed by token.
function freshUser() {
  return {
    phone: '',
    nickname: '',
    avatar: img('home/icon_multiuser.png'),
    balance: 125000,     // paise -> 1250.00
    frozen: 0,
    inviteCode: 'ORICH' + Math.floor(1000 + Math.random() * 8999),
    teamCount: 0,
    banks: [],
    addresses: [],
    createdAt: Date.now(),
  };
}

module.exports = { products, winners, finances, rechargeOptions, tasks, vipTiers, vipConfig, luckyDraws, prizes, games, categories, helpItems, inviteRules, payChannels, withdrawConfig, notifications, appUpdate, freshUser, img };
