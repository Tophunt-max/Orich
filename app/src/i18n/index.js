import { createI18n } from 'vue-i18n';

// English + Hindi, like the original ORich app (which shipped en/hi/zh).
const en = {
  app: { name: 'ORich' },
  tab: { home: 'Home', winner: 'Winner', task: 'Tasks', vip: 'VIP', account: 'Account' },
  common: { join: 'Join', recharge: 'Recharge', confirm: 'Confirm', cancel: 'Cancel', back: 'Back', all: 'All', loading: 'Loading…', empty: 'Nothing here yet', balance: 'Balance', submit: 'Submit' },
  home: { notice: 'Notice', hot: 'Hot Picks', groupBuy: '1₹ Group Buy', latestWinners: 'Latest Winners', viewAll: 'View all', joined: 'joined', remaining: 'left' },
  product: { marketValue: 'Market value', perShare: 'Per share', progress: 'Progress', shares: 'Shares', total: 'Total', joinNow: 'Join now', ongoing: 'Ongoing', drawing: 'Drawing', done: 'Completed' },
  login: { title: 'Login', tips: 'Sign in or create your account', phone: 'Phone Number', phonePh: 'Enter phone number', code: 'Verification Code', codePh: 'Enter code', send: 'Send OTP', invite: 'Invite code (optional)', action: 'Login', terms: 'By continuing you agree to the', rules: 'Terms & Privacy Policy' },
  account: { wallet: 'Wallet', withdraw: 'Withdraw', team: 'My Team', funding: 'Fund Records', finance: 'Finance', orders: 'My Orders', help: 'Help & FAQ', settings: 'Settings', about: 'About Us', service: 'Customer Service', invite: 'Invite Friends', notifications: 'Notifications', signOut: 'Sign out', frozen: 'Frozen', waiting: 'Waiting', toconfirm: 'To Confirm', delivery: 'In Delivery', received: 'Received' },
  recharge: { title: 'Recharge', choose: 'Choose amount', custom: 'Custom amount', pay: 'Pay now', success: 'Recharge successful' },
  winner: { title: 'Winners', mine: 'My Wins', code: 'Lucky code', shares: 'shares', congrats: 'Congratulations on winning!', signinMine: 'Please sign in to see your wins' },
  finance: { title: 'Finance', rate: 'Daily rate', days: 'Term', min: 'Min', invest: 'Invest', amount: 'Amount', confirm: 'Confirm investment', sub: 'Grow your balance with daily returns', day: 'day', projected: 'Projected return' },
  invite: { title: 'Invite Friends', yourCode: 'Your invite code', copy: 'Copy', share: 'Share', tip: 'Invite friends and earn commission when they join.', invited: 'Invited', earned: 'Earned' },
  order: { title: 'My Orders', amount: 'Amount', status: 'Status', date: 'Date' },
  task: { title: 'Daily Tasks', claim: 'Claim', claimed: 'Claimed', daily: 'Daily welfare' },
  vip: { title: 'VIP Membership', buy: 'Activate', active: 'You are a {name} VIP', daily: 'Daily bonus ₹{n}', rebate: '{n}% referral rebate', none: 'Not a member yet', choose: 'Choose your plan' },
};

const hi = {
  app: { name: 'ORich' },
  tab: { home: 'होम', winner: 'विजेता', task: 'टास्क', vip: 'VIP', account: 'खाता' },
  common: { join: 'शामिल हों', recharge: 'रिचार्ज', confirm: 'पुष्टि करें', cancel: 'रद्द करें', back: 'वापस', all: 'सभी', loading: 'लोड हो रहा है…', empty: 'अभी यहाँ कुछ नहीं है', balance: 'बैलेंस', submit: 'सबमिट' },
  home: { notice: 'सूचना', hot: 'हॉट पिक्स', groupBuy: '₹1 ग्रुप बाय', latestWinners: 'नए विजेता', viewAll: 'सभी देखें', joined: 'शामिल', remaining: 'बाकी' },
  product: { marketValue: 'बाज़ार मूल्य', perShare: 'प्रति शेयर', progress: 'प्रगति', shares: 'शेयर', total: 'कुल', joinNow: 'अभी शामिल हों', ongoing: 'जारी', drawing: 'ड्रॉ', done: 'पूर्ण' },
  login: { title: 'लॉगिन', tips: 'साइन इन करें या खाता बनाएँ', phone: 'फ़ोन नंबर', phonePh: 'फ़ोन नंबर डालें', code: 'सत्यापन कोड', codePh: 'कोड डालें', send: 'OTP भेजें', invite: 'इनवाइट कोड (वैकल्पिक)', action: 'लॉगिन', terms: 'जारी रखने पर आप सहमत हैं', rules: 'नियम व गोपनीयता नीति' },
  account: { wallet: 'वॉलेट', withdraw: 'निकासी', team: 'मेरी टीम', funding: 'फंड रिकॉर्ड', finance: 'फाइनेंस', orders: 'मेरे ऑर्डर', help: 'मदद व सवाल', settings: 'सेटिंग्स', about: 'हमारे बारे में', service: 'कस्टमर सेवा', invite: 'दोस्तों को बुलाएँ', notifications: 'सूचनाएँ', signOut: 'साइन आउट', frozen: 'फ्रोज़न', waiting: 'प्रतीक्षा', toconfirm: 'पुष्टि', delivery: 'डिलीवरी', received: 'प्राप्त' },
  recharge: { title: 'रिचार्ज', choose: 'राशि चुनें', custom: 'कस्टम राशि', pay: 'अभी भुगतान करें', success: 'रिचार्ज सफल' },
  winner: { title: 'विजेता', mine: 'मेरी जीत', code: 'लकी कोड', shares: 'शेयर', congrats: 'जीतने की बधाई!', signinMine: 'अपनी जीत देखने के लिए साइन इन करें' },
  finance: { title: 'फाइनेंस', rate: 'दैनिक दर', days: 'अवधि', min: 'न्यूनतम', invest: 'निवेश', amount: 'राशि', confirm: 'निवेश की पुष्टि करें', sub: 'रोज़ के रिटर्न से बैलेंस बढ़ाएँ', day: 'दिन', projected: 'अनुमानित रिटर्न' },
  invite: { title: 'दोस्तों को बुलाएँ', yourCode: 'आपका इनवाइट कोड', copy: 'कॉपी', share: 'शेयर', tip: 'दोस्तों को बुलाएँ और उनके शामिल होने पर कमीशन कमाएँ।', invited: 'आमंत्रित', earned: 'कमाया' },
  order: { title: 'मेरे ऑर्डर', amount: 'राशि', status: 'स्थिति', date: 'तारीख' },
  task: { title: 'रोज़ के टास्क', claim: 'क्लेम', claimed: 'क्लेम किया', daily: 'डेली वेलफेयर' },
  vip: { title: 'VIP मेंबरशिप', buy: 'एक्टिवेट करें', active: 'आप {name} VIP हैं', daily: 'रोज़ का बोनस ₹{n}', rebate: '{n}% रेफरल रिबेट', none: 'अभी मेंबर नहीं', choose: 'अपना प्लान चुनें' },
};

const zh = {
  app: { name: 'ORich' },
  tab: { home: '首页', winner: '中奖', task: '任务', vip: 'VIP', account: '我的' },
  common: { join: '参与', recharge: '充值', confirm: '确认', cancel: '取消', back: '返回', all: '全部', loading: '加载中…', empty: '暂无内容', balance: '余额', submit: '提交' },
  home: { notice: '公告', hot: '热门精选', groupBuy: '1₹ 拼团', latestWinners: '最新中奖', viewAll: '查看全部', joined: '已参与', remaining: '剩余' },
  product: { marketValue: '市场价', perShare: '每份', progress: '进度', shares: '份额', total: '合计', joinNow: '立即参与', ongoing: '进行中', drawing: '开奖中', done: '已完成' },
  login: { title: '登录', tips: '登录或创建账户', phone: '手机号', phonePh: '请输入手机号', code: '验证码', codePh: '请输入验证码', send: '发送验证码', invite: '邀请码（可选）', action: '登录', terms: '继续即表示您同意', rules: '条款与隐私政策' },
  account: { wallet: '钱包', withdraw: '提现', team: '我的团队', funding: '资金记录', finance: '理财', orders: '我的订单', help: '帮助与常见问题', settings: '设置', about: '关于我们', service: '客服', invite: '邀请好友', notifications: '通知', signOut: '退出登录', frozen: '冻结', waiting: '待处理', toconfirm: '待确认', delivery: '配送中', received: '已收货' },
  recharge: { title: '充值', choose: '选择金额', custom: '自定义金额', pay: '立即支付', success: '充值成功' },
  winner: { title: '中奖者', mine: '我的中奖', code: '幸运码', shares: '份', congrats: '恭喜中奖！', signinMine: '请登录查看您的中奖' },
  finance: { title: '理财', rate: '日收益率', days: '期限', min: '最低', invest: '投资', amount: '金额', confirm: '确认投资', sub: '通过每日收益增长余额', day: '天', projected: '预计收益' },
  invite: { title: '邀请好友', yourCode: '您的邀请码', copy: '复制', share: '分享', tip: '邀请好友，好友参与即可赚取佣金。', invited: '已邀请', earned: '已赚取' },
  order: { title: '我的订单', amount: '金额', status: '状态', date: '日期' },
  task: { title: '每日任务', claim: '领取', claimed: '已领取', daily: '每日福利' },
  vip: { title: 'VIP 会员', buy: '开通', active: '您是 {name} VIP', daily: '每日奖金 ₹{n}', rebate: '{n}% 推荐返利', none: '尚未开通', choose: '选择套餐' },
};

export default createI18n({
  legacy: false,
  locale: localStorage.getItem('orich_lang') || 'en',
  fallbackLocale: 'en',
  messages: { en, hi, zh },
});
