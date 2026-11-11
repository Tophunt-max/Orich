// Thin request helper matching the original app's contract:
// POST /api/index/<name>, body JSON, response { code, msg, data }, code === 1 = success.
// The auth token is sent in a "token" header, like the original.

// Same-origin '/api' in dev (Vite proxy) and production; override with VITE_API_BASE.
const BASE = import.meta.env.VITE_API_BASE || '/api';

export async function call(endpoint, body = {}) {
  const token = localStorage.getItem('orich_token') || '';
  const lang = localStorage.getItem('orich_lang') || 'en';
  const res = await fetch(BASE + endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      lang,
      ...(token ? { token } : {}),
    },
    body: JSON.stringify(body),
  });
  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error('Bad server response');
  }
  if (json.code !== 1) {
    const e = new Error(json.msg || 'Request failed');
    e.code = json.code;
    throw e;
  }
  return json.data;
}

export const api = {
  system: () => call('/index/getsystem'),
  home: () => call('/index/index'),
  productList: () => call('/index/duobaoitemlist'),
  product: (id) => call('/index/duobaoitemdetail', { id }),
  join: (id, shares) => call('/index/addorder', { id, shares }),
  winners: () => call('/index/winnerlist'),
  myWinners: () => call('/index/mywinner'),
  sendVerify: (phone) => call('/index/sendverify', { phone }),
  login: (phone, code, invite) => call('/index/login', { phone, code, invite }),
  logout: () => call('/index/logout'),
  account: () => call('/index/useraccount'),
  balance: () => call('/index/userbalance'),
  rechargeOptions: () => call('/index/rechargelist'),
  recharge: (amount, channel) => call('/index/addrechargepay2', { amount, channel }),
  orders: () => call('/index/ordernews'),
  financeList: () => call('/index/financeList'),
  finance: (id) => call('/index/financeDetail', { id }),
  financeBuy: (id, amount) => call('/index/financeBuy', { id, amount }),
  myFinance: () => call('/index/myFinanceList'),
  team: () => call('/index/myteam'),
  invite: () => call('/index/userinvitelist'),
  help: () => call('/index/help'),
  tasks: () => call('/index/taskList'),
  taskReceive: (id) => call('/index/taskReceive', { id }),
  vipTiers: () => call('/index/vip'),
  vipBuy: (id) => call('/index/vipBuy', { id }),
  luckyList: () => call('/index/luckyList'),
  luckyBuy: (id) => call('/index/luckyBuy', { id }),
  // withdraw / records / banks / addresses / prizes / games / profile
  withdraw: (amount) => call('/index/userwithdraw', { amount }),
  cashList: () => call('/index/cashlist'),
  rechargeRecord: () => call('/index/rechargerecord'),
  bankList: () => call('/index/banklist'),
  bankAdd: (bank) => call('/index/bankadd', bank),
  bankDel: (id) => call('/index/bankdel', { id }),
  addressList: () => call('/index/addresslist'),
  addressAdd: (a) => call('/index/addressadd', a),
  addressDel: (id) => call('/index/addressdel', { id }),
  prizes: () => call('/index/price'),
  games: () => call('/index/getactivity'),
  accountEdit: (nickname) => call('/index/accountedit', { nickname }),
  orderDetail: (id) => call('/index/orderdetail', { id }),

  // ---- APK-parity endpoints ----
  kinds: () => call('/index/kind'),
  joinList: (id) => call('/index/duobaoitemjoinlist', { id }),
  itemHistory: (id) => call('/index/duobaoitemhistory', { id }),
  itemShareLink: (id) => call('/index/duobaoitemshare', { id }),
  itemLottery: (id) => call('/index/duobaoitemlottery', { id }),
  activityDetail: (id) => call('/index/activitydetail', { id }),
  lotteryTime: () => call('/index/getlotterytime'),
  lotteryResult: () => call('/index/getlotteryresult'),
  numberMax: () => call('/index/getnumbermax'),
  joinActivity: (payload) => call('/index/joinactivity', payload),
  financeRecent: () => call('/index/financeOrderRecent'),
  financeHistory: (id) => call('/index/financeDetailHistory', { id }),
  answers: () => call('/index/getanswer'),
  ruleText: () => call('/index/runoobdetail'),
  whatsappChannel: () => call('/index/chlwhatsapp'),
  payStatus: (id) => call('/index/paystatus', { id }),
  orderShare: (id) => call('/index/itemshare', { id }),
  inviteTop: () => call('/index/userinvitetop'),
  rebateList: () => call('/index/userrebatelist'),
  consumeList: () => call('/index/userconsume'),
  myItems: () => call('/index/useritem'),
  afsList: () => call('/index/getUserAfs'),
  afsEdit: (id, status) => call('/index/editAfStatus', { id, status }),
  itemDetail: (id) => call('/index/itemdetail', { id }),
  itemEdit: (payload) => call('/index/itemedit', payload),
  itemDefaultAddr: () => call('/index/itemdefaultaddr'),
  orderPay: (payload) => call('/index/addorderpay', payload),
  bankEdit: (payload) => call('/index/bankedit', payload),
  addressEdit: (payload) => call('/index/addressedit', payload),
  addressSetDefault: (id) => call('/index/addresschangedefault', { id }),
  // notifications / OTA / analytics
  notifications: () => call('/index/notifications'),
  notifyRead: (id) => call('/index/notifyread', id ? { id } : {}),
  checkUpdate: () => call('/index/checkupdate'),
  upload: (image) => call('/index/upload', { image }),
  track: (name, props) => call('/index/track', { name, props }).catch(() => {}),
};
