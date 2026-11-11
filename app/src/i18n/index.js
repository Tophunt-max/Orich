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

export default createI18n({
  legacy: false,
  locale: localStorage.getItem('orich_lang') || 'en',
  fallbackLocale: 'en',
  messages: { en, hi },
});
