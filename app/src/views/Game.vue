<script setup>
import { onMounted, onBeforeUnmount, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { api } from '../api/client';
import { useAuth } from '../stores/auth';
import { useToast } from '../components/useToast';

const router = useRouter();
const auth = useAuth();
const { toast } = useToast();
const { t } = useI18n({
  useScope: 'local',
  messages: {
    en: {
      luckyBall: 'Lucky Ball',
      rules: 'Rules',
      balance: 'Balance',
      recharge: 'Recharge',
      notice: 'Pick a colour and win instantly',
      period: 'Period',
      countdown: 'Countdown',
      tips: 'Choose a colour, then a number to join the round',
      green: 'Green',
      violet: 'Violet',
      red: 'Red',
      myOrders: 'My Orders',
      records: 'Records',
      noOrders: 'No orders yet',
      noRecords: 'No records yet',
      entryConfirmed: 'Entry confirmed on',
      couldNotBet: 'Could not place bet',
      ruleWelcome: 'Welcome to Lucky Ball.',
      rule1: '1. Each round lasts a few minutes. Choose a colour (Green, Violet or Red) or a specific number.',
      rule2: '2. When the countdown ends, a winning number is drawn.',
      rule3: '3. Green and Red numbers pay 2x; Violet numbers pay more. Matching the exact number pays the most.',
      rule4: '4. Entries cost ₹{amount} and are settled to your balance automatically.',
      ruleResponsible: 'Play responsibly. Bet only what you can afford.',
    },
    hi: {
      luckyBall: 'लकी बॉल',
      rules: 'नियम',
      balance: 'बैलेंस',
      recharge: 'रिचार्ज',
      notice: 'एक रंग चुनें और तुरंत जीतें',
      period: 'अवधि',
      countdown: 'उलटी गिनती',
      tips: 'राउंड में शामिल होने के लिए एक रंग चुनें, फिर एक नंबर',
      green: 'हरा',
      violet: 'बैंगनी',
      red: 'लाल',
      myOrders: 'मेरे ऑर्डर',
      records: 'रिकॉर्ड',
      noOrders: 'अभी कोई ऑर्डर नहीं',
      noRecords: 'अभी कोई रिकॉर्ड नहीं',
      entryConfirmed: 'एंट्री पुष्टि हुई',
      couldNotBet: 'दांव नहीं लगाया जा सका',
      ruleWelcome: 'लकी बॉल में आपका स्वागत है।',
      rule1: '1. प्रत्येक राउंड कुछ मिनट तक चलता है। एक रंग (हरा, बैंगनी या लाल) या कोई विशिष्ट नंबर चुनें।',
      rule2: '2. उलटी गिनती समाप्त होने पर, एक विजेता नंबर निकाला जाता है।',
      rule3: '3. हरे और लाल नंबर 2 गुना देते हैं; बैंगनी नंबर अधिक देते हैं। सटीक नंबर मिलाने पर सबसे अधिक मिलता है।',
      rule4: '4. प्रत्येक एंट्री की लागत ₹{amount} है और यह स्वतः आपके बैलेंस में सेटल हो जाती है।',
      ruleResponsible: 'जिम्मेदारी से खेलें। केवल उतना ही दांव लगाएं जितना आप वहन कर सकें।',
    },
  },
});

const showRule = ref(false);
const tab = ref(0);
const busy = ref(false);

// Real Lucky-ball round state (from api.lotteryTime).
const period = ref('');
const endAt = ref(0);
const remaining = ref(0);
let timer = null;

// Past draw results (from api.lotteryResult).
const results = ref([]);

// Fixed bet unit for an entry.
const amount = ref(1);

// Balance as rupees from the signed-in user, if any.
const balance = computed(() => {
  const b = auth.user?.balance;
  if (b == null) return '0.00';
  return typeof b === 'number' ? b.toFixed(2) : String(b);
});

const notice = computed(() => t('notice'));

// Number grid 0-9, each tagged with a colour group shown as a small circle.
const numbers = [
  { n: 0, colors: ['cviolet', 'cred'] },
  { n: 1, colors: ['cgreen'] },
  { n: 2, colors: ['cred'] },
  { n: 3, colors: ['cgreen'] },
  { n: 4, colors: ['cred'] },
  { n: 5, colors: ['cviolet', 'cgreen'] },
  { n: 6, colors: ['cred'] },
  { n: 7, colors: ['cgreen'] },
  { n: 8, colors: ['cred'] },
  { n: 9, colors: ['cgreen'] },
];

const countdown = computed(() => {
  const total = Math.max(0, remaining.value);
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return m + ':' + s;
});

// Map a grid colour class ("cgreen") to the API colour ("green").
function apiColor(c) {
  return String(c || '').replace(/^c/, '');
}

async function loadTime() {
  try {
    const data = await api.lotteryTime();
    period.value = data?.period ?? '';
    endAt.value = Number(data?.endAt) || 0;
    const server = Number(data?.serverTime) || Date.now();
    remaining.value = Math.max(0, Math.round((endAt.value - server) / 1000));
  } catch { /* leave previous values */ }
}

async function loadResults() {
  try {
    const data = await api.lotteryResult();
    results.value = data?.list || [];
  } catch { results.value = []; }
}

onMounted(async () => {
  await Promise.all([loadTime(), loadResults()]);
  if (auth.isLoggedIn) await auth.refresh();
  timer = setInterval(() => {
    if (remaining.value > 0) {
      remaining.value -= 1;
    } else {
      // Round closed: pull the next round and refresh results.
      loadTime();
      loadResults();
    }
  }, 1000);
});
onBeforeUnmount(() => clearInterval(timer));

async function place({ color, number = null }) {
  if (busy.value) return;
  if (!auth.isLoggedIn) {
    router.push('/login');
    return;
  }
  busy.value = true;
  try {
    const data = await api.joinActivity({ color, number, amount: amount.value });
    await auth.refresh();
    if (data?.period) period.value = data.period;
    if (data?.endAt) {
      endAt.value = Number(data.endAt) || endAt.value;
    }
    const where = number == null ? color : color + ' ' + number;
    const bal = data?.balance != null ? ' · ₹' + data.balance : '';
    toast(t('entryConfirmed') + ' ' + where + bal);
  } catch (e) {
    toast(e.message || t('couldNotBet'));
  } finally {
    busy.value = false;
  }
}
</script>

<!-- Faithful rebuild of the real pages/game/game "Lucky Ball" layout + scoped CSS. -->
<template>
  <div class="game">
    <header class="gnav">
      <span class="back" @click="router.back()">‹</span>
      <span class="gnav_title">{{ t('luckyBall') }}</span>
      <div class="nav_help" @click="showRule = true">
        <img src="/static/image/icon_questionmark_blue.png" alt="" />
        <span class="nav_help_rule">{{ t('rules') }}</span>
      </div>
    </header>

    <div class="game_lucky">
      <div class="game_lucky_info">
        <div class="game_lucky_info_balance">
          <div class="title">{{ t('balance') }}</div>
          <div class="price"><span class="font32">₹</span><span class="font64">{{ balance }}</span></div>
        </div>
        <div class="game_lucky_info_recharge" @click="router.push('/recharge')">
          <span class="title">{{ t('recharge') }}</span>
          <div class="icon"><img src="/static/image/home/icon_RightArrow.png" alt="" /></div>
        </div>
      </div>

      <div class="game_lucky_swiper">
        <div class="swiper">
          <div class="swiper-item">
            <div class="icon"><img src="/static/image/game/icon_notice.png" alt="" /></div>
            <div class="content">
              <span class="content_text">{{ notice }}</span>
              <span class="content_price">₹{{ amount }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="game_lucky_join">
        <div class="game_lucky_join_period">
          <div class="game_lucky_join_period_issue title">{{ t('period') }} #{{ period || '—' }}</div>
          <div class="title">{{ t('countdown') }}
            <div class="tdown">{{ countdown }}</div>
          </div>
        </div>

        <div class="game_lucky_tips">{{ t('tips') }}</div>

        <div class="game_lucky_join_select">
          <div class="game_lucky_join_select_button cgreen" :class="{ unable: busy }" @click="place({ color: 'green' })">{{ t('green') }}</div>
          <div class="game_lucky_join_select_button cviolet" :class="{ unable: busy }" @click="place({ color: 'violet' })">{{ t('violet') }}</div>
          <div class="game_lucky_join_select_button cred" :class="{ unable: busy }" @click="place({ color: 'red' })">{{ t('red') }}</div>
        </div>

        <div class="game_lucky_join_nums">
          <div v-for="item in numbers" :key="item.n" class="number" @click="place({ color: apiColor(item.colors[0]), number: item.n })">
            {{ item.n }}
            <div class="number_icon">
              <span v-for="(c, i) in item.colors" :key="i" class="cicle" :class="c"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="game_tab">
      <div class="game_tab_item" @click="tab = 0">
        <div class="game_tab_item_title" :class="{ tabselect: tab === 0 }">{{ t('myOrders') }}</div>
        <div v-if="tab === 0" class="game_tab_item_select"></div>
      </div>
      <div class="game_tab_item" @click="tab = 1">
        <div class="game_tab_item_title" :class="{ tabselect: tab === 1 }">{{ t('records') }}</div>
        <div v-if="tab === 1" class="game_tab_item_select"></div>
      </div>
    </div>

    <!-- My Orders tab: local/empty for now -->
    <div v-if="tab === 0" class="game_list">
      <div class="game_list_empty">{{ t('noOrders') }}</div>
    </div>

    <!-- Records tab: past draw results from the backend -->
    <div v-else class="game_list">
      <div v-for="(r, i) in results" :key="i" class="game_record">
        <span class="game_record_period">#{{ r.period }}</span>
        <span class="game_record_number">{{ r.number }}</span>
        <span class="game_record_dot" :class="'c' + r.color"></span>
      </div>
      <div v-if="!results.length" class="game_list_empty">{{ t('noRecords') }}</div>
    </div>

    <div v-if="showRule" class="mask" @click.self="showRule = false">
      <div class="game_rule_wrap">
        <div class="game_rule">
          <div class="game_rule_content">
            <p>{{ t('ruleWelcome') }}</p>
            <p>{{ t('rule1') }}</p>
            <p>{{ t('rule2') }}</p>
            <p>{{ t('rule3') }}</p>
            <p>{{ t('rule4', { amount }) }}</p>
            <p>{{ t('ruleResponsible') }}</p>
          </div>
        </div>
        <div class="game_close" @click="showRule = false">
          <img src="/static/image/game/icon_delete.png" alt="" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game { width: 100%; min-height: 100vh; background: #f9f9f9; padding-bottom: 80px; }

.gnav { position: relative; height: 44px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; color: #17273a; }
.gnav .back { position: absolute; left: 12px; font-size: 22px; line-height: 1; }

.game .nav_help { position: absolute; right: 13px; display: flex; align-items: center; }
.game .nav_help img { width: 14px; height: 14px; }
.game .nav_help .nav_help_rule { margin-left: 3px; font-size: 14px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #17273a; }

.game .cgreen { background: #55e273; }
.game .cviolet { background: #ff62ff; }
.game .cred { background: #ff4343; }
.game .unable { background: #b9b9b9 !important; box-shadow: none !important; }

.game .game_lucky { margin-top: 17px; height: 459px; background: url('/static/image/game/bg_game.png') no-repeat; background-size: 100% 100%; }
.game .game_lucky .game_lucky_info { margin: 0 12px; display: flex; align-items: center; justify-content: space-between; height: 80px; padding: 16px 18px 0 21px; }
.game .game_lucky .game_lucky_info .game_lucky_info_balance .title { font-size: 16px; font-family: Roboto, Roboto-Medium; font-weight: 500; color: #ec991f; }
.game .game_lucky .game_lucky_info .game_lucky_info_balance .price { margin-top: 7px; font-family: Roboto, Roboto-Medium; font-weight: 500; color: #ff5c5c; letter-spacing: 0px; max-width: 180px; }
.game .game_lucky .game_lucky_info .game_lucky_info_balance .price .font32 { font-size: 16px; }
.game .game_lucky .game_lucky_info .game_lucky_info_balance .price .font64 { margin-left: 3px; font-size: 32px; }
.game .game_lucky .game_lucky_info .game_lucky_info_recharge { width: 83px; height: 27px; line-height: 27px; background: #fa5b21; border-radius: 99.50px; box-shadow: 0px -1px 2px 0px #fe8e66 inset; display: flex; align-items: flex-start; justify-content: center; }
.game .game_lucky .game_lucky_info .game_lucky_info_recharge .title { color: #fff; font-size: 13px; font-family: Roboto, Roboto-Regular; font-weight: 400; }
.game .game_lucky .game_lucky_info .game_lucky_info_recharge .icon { margin-left: 4px; width: 6px; height: 10px; }
.game .game_lucky .game_lucky_info .game_lucky_info_recharge .icon img { width: 100%; height: 100%; }
.game .game_lucky .game_lucky_swiper { height: 20px; }
.game .game_lucky .game_lucky_swiper .swiper { height: 20px; }
.game .game_lucky .game_lucky_swiper .swiper .swiper-item { display: flex; align-items: center; justify-content: center; }
.game .game_lucky .game_lucky_swiper .swiper .swiper-item .icon { width: 16px; height: 16px; }
.game .game_lucky .game_lucky_swiper .swiper .swiper-item .icon img { width: 100%; height: 100%; }
.game .game_lucky .game_lucky_swiper .swiper .swiper-item .content { margin-left: 5px; font-size: 13px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #8f5601; }
.game .game_lucky .game_lucky_swiper .swiper .swiper-item .content .content_text { margin: 0 3px; }
.game .game_lucky .game_lucky_swiper .swiper .swiper-item .content .content_price { color: #ff5c5c; }
.game .game_lucky .game_lucky_join { margin-top: 20px; padding: 29px 29px 0 34px; }
.game .game_lucky .game_lucky_join .game_lucky_join_period { display: flex; align-items: flex-start; justify-content: space-between; height: 44px; }
.game .game_lucky .game_lucky_join .game_lucky_join_period .game_lucky_join_period_issue { font-family: Roboto, Roboto-Medium; font-weight: 500; }
.game .game_lucky .game_lucky_join .game_lucky_join_period .title { font-size: 14px; color: #fcedcf; }
.game .game_lucky .game_lucky_join .game_lucky_join_period .title img { margin-left: 5px; width: 12px; height: 12px; }
.game .game_lucky .game_lucky_join .game_lucky_join_period .tdown { max-width: 200px; font-size: 22px; color: #fff; text-shadow: 0px 1px 1px 0px #f28f00; }
.game .game_lucky .game_lucky_join .game_lucky_tips { margin-top: 42px; font-size: 13px; font-family: Roboto, Roboto-Medium; font-weight: 500; text-align: center; color: #b05500; }
.game .game_lucky .game_lucky_join .game_lucky_join_select { margin-top: 18px; display: flex; align-items: center; justify-content: space-around; }
.game .game_lucky .game_lucky_join .game_lucky_join_select .game_lucky_join_select_button { width: 94.50px; height: 38px; line-height: 38px; text-align: center; border-radius: 2px; color: #fff; font-size: 16px; font-family: Roboto, Roboto-Medium; font-weight: 500; }
.game .game_lucky .game_lucky_join .game_lucky_join_select .game_lucky_join_select_button:nth-child(1) { background: #55e273; box-shadow: 0px 3px 3px 0px rgba(252,153,11,.6), 0px -4px 7px 0px #4beb6e inset; }
.game .game_lucky .game_lucky_join .game_lucky_join_select .game_lucky_join_select_button:nth-child(2) { background: #ff62ff; box-shadow: 0px 3px 3px 0px #ff9803; }
.game .game_lucky .game_lucky_join .game_lucky_join_select .game_lucky_join_select_button:nth-child(3) { background: #ff4343; box-shadow: 0px 3px 3px 0px rgba(252,153,11,.8); }
.game .game_lucky .game_lucky_join .game_lucky_join_nums { display: flex; align-items: center; justify-content: space-around; flex-wrap: wrap; }
.game .game_lucky .game_lucky_join .game_lucky_join_nums .number { margin-top: 11px; width: 54px; height: 31px; line-height: 31px; text-align: center; background: #3a89ff; border-radius: 2px; font-size: 16px; font-family: Roboto, Roboto-Medium; font-weight: 500; color: #fff; position: relative; }
.game .game_lucky .game_lucky_join .game_lucky_join_nums .number .number_icon { line-height: normal; display: flex; align-items: flex-end; justify-content: flex-end; position: absolute; bottom: 2px; right: 2px; }
.game .game_lucky .game_lucky_join .game_lucky_join_nums .number .number_icon .cicle { margin-left: 1px; width: 7px; height: 7px; border-radius: 50%; }
.game .game_tab { background-color: #fff; width: 100%; margin-top: 13px; padding: 18px 0; display: flex; align-items: center; justify-content: center; }
.game .game_tab .game_tab_item { display: flex; align-items: center; justify-content: center; flex-direction: column; }
.game .game_tab .game_tab_item:nth-child(1) { margin-right: 55px; }
.game .game_tab .game_tab_item .game_tab_item_title { font-size: 14px; font-family: Roboto, Roboto-Medium; font-weight: 500; color: #b9b9b9; letter-spacing: 0px; }
.game .game_tab .game_tab_item .game_tab_item_select { width: 14px; height: 6px; margin-top: 4px; background: #17273a; border-radius: 3px; }
.game .game_tab .game_tab_item .tabselect { font-size: 16px; font-weight: 500; color: #17273a; }

/* Records / My Orders list */
.game .game_list { background: #fff; min-height: 80px; }
.game .game_list_empty { text-align: center; color: #b9b9b9; font-size: 13px; padding: 24px 0; }
.game .game_record { display: flex; align-items: center; padding: 12px 20px; border-bottom: .5px solid #ececec; font-size: 14px; }
.game .game_record .game_record_period { color: #17273a; }
.game .game_record .game_record_number { margin-left: auto; margin-right: 12px; font-weight: 700; color: #17273a; }
.game .game_record .game_record_dot { width: 14px; height: 14px; border-radius: 50%; }

/* Center the rule modal within the 375 frame (not the full viewport). */
.mask { position: fixed; left: 50%; top: 0; transform: translateX(-50%); z-index: 99999; display: flex; align-items: center; justify-content: center; width: 100%; max-width: var(--maxw); height: 100vh; background: rgba(0,0,0,.6); }
.game_rule_wrap { display: flex; flex-direction: column; align-items: center; }
.game .game_rule { width: 344px; height: 488px; background: url('/static/image/game/bg_rules.png') no-repeat; background-size: 100% 100%; padding: 50px 15px 20px 20px; }
.game .game_rule .game_rule_content { height: 100%; width: 100%; overflow: hidden; overflow-y: scroll; font-size: 13px; line-height: 20px; color: #8f5601; }
.game .game_close { margin-top: 8px; text-align: center; }
.game .game_close img { width: 29px; height: 29px; margin: 0 auto; }
</style>
