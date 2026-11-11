'use strict';
// In-memory demo data for the ORich-style group-buy / wallet / finance app.
// Money is stored in integer paise (1 rupee = 100) and formatted at the edges.

function img(p) {
  return '/static/image/' + p;
}

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
  },
];

const winners = [
  { id: 101, name: 'rahul***', product: 'iPhone 14 128GB', avatar: '/static/products/avatar.svg', code: 'OR20260108', shares: 36, date: '2026-11-08' },
  { id: 102, name: 'meena***', product: 'Gold Coin 2g', avatar: '/static/products/avatar.svg', code: 'OR20260107', shares: 12, date: '2026-11-07' },
  { id: 103, name: 'arjun***', product: 'OnePlus 12R', avatar: '/static/products/avatar.svg', code: 'OR20260106', shares: 58, date: '2026-11-06' },
  { id: 104, name: 'sana***', product: 'Smart Watch', avatar: '/static/products/avatar.svg', code: 'OR20260105', shares: 9, date: '2026-11-05' },
];

const finances = [
  { id: 1, name: 'ORich Daily 7', rate: 0.8, days: 7, min: 500, max: 50000, desc: 'Fixed daily return, principal returned on maturity.' },
  { id: 2, name: 'ORich Flex 30', rate: 1.2, days: 30, min: 1000, max: 200000, desc: 'Higher daily return over a 30-day lock-in.' },
  { id: 3, name: 'ORich Prime 90', rate: 1.6, days: 90, min: 5000, max: 500000, desc: 'Our best rate for a 90-day commitment.' },
];

const rechargeOptions = [100, 300, 500, 1000, 2000, 5000];

// Daily tasks (2.1.4 task/taskList + taskReceive).
const tasks = [
  { id: 1, title: 'Daily check-in', reward: 5, type: 'checkin', icon: img('home/icon_Promotion.png') },
  { id: 2, title: 'Join any group-buy', reward: 10, type: 'join', icon: img('home/icon_1GroupBuy.png') },
  { id: 3, title: 'Invite a friend', reward: 50, type: 'invite', icon: img('home/icon_Invite.png') },
  { id: 4, title: 'Recharge ₹500+', reward: 20, type: 'recharge', icon: img('home/icon_Recharge.png') },
];

// VIP membership tiers (2.1.4 vip / vipBuy).
const vipTiers = [
  { id: 1, name: 'Silver', price: 299, days: 30, dailyBonus: 5, rebate: 2, color: '#9aa7b5' },
  { id: 2, name: 'Gold', price: 799, days: 30, dailyBonus: 18, rebate: 4, color: '#e0a73a' },
  { id: 3, name: 'Platinum', price: 1999, days: 30, dailyBonus: 55, rebate: 7, color: '#6c5ce7' },
];

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

module.exports = { products, winners, finances, rechargeOptions, tasks, vipTiers, luckyDraws, prizes, games, freshUser, img };
