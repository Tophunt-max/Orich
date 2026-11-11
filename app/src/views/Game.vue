<script setup>
import { onMounted, onBeforeUnmount, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api/client';
import { useAuth } from '../stores/auth';
import { useToast } from '../components/useToast';

const router = useRouter();
const auth = useAuth();
const { toast } = useToast();

const games = ref([]);
const draws = ref([]);
const showRule = ref(false);
const tab = ref(0);
const busy = ref(false);

// Active lucky round (first available), used for period / ticket / buy id.
const round = computed(() => draws.value[0] || null);

// Balance as rupees from the signed-in user, if any.
const balance = computed(() => {
  const b = auth.user?.balance;
  if (b == null) return '0.00';
  return typeof b === 'number' ? b.toFixed(2) : String(b);
});

// Notice ticker lines built from recent winners-ish data (games list) with a safe fallback.
const notice = computed(() => {
  const g = games.value[0];
  return g ? g.name + ' pays out big every round' : 'Pick a colour and win instantly';
});

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

// Simple countdown timer (mm:ss) that loops; purely cosmetic.
const secs = ref(179);
let timer = null;
const countdown = computed(() => {
  const m = String(Math.floor(secs.value / 60)).padStart(2, '0');
  const s = String(secs.value % 60).padStart(2, '0');
  return m + ':' + s;
});
const period = computed(() => {
  const d = new Date();
  return (round.value?.id ?? 1) + '' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
});

onMounted(async () => {
  try { games.value = (await api.games()).list || []; } catch { /* ignore */ }
  try { draws.value = (await api.luckyList()).list || []; } catch { /* ignore */ }
  if (auth.isLoggedIn) await auth.refresh();
  timer = setInterval(() => { secs.value = secs.value > 0 ? secs.value - 1 : 179; }, 1000);
});
onBeforeUnmount(() => clearInterval(timer));

async function bet(color) {
  if (busy.value) return;
  const id = round.value?.id;
  if (!auth.isLoggedIn || id == null) {
    toast('Bet placed on ' + color + ' (demo)');
    return;
  }
  busy.value = true;
  try {
    const data = await api.luckyBuy(id);
    auth.user = { ...auth.user, balance: data.balance };
    toast('Entry confirmed on ' + color);
  } catch (e) {
    toast(e.message || 'Could not place bet');
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
      <span class="gnav_title">Lucky Ball</span>
      <div class="nav_help" @click="showRule = true">
        <img src="/static/image/icon_questionmark_blue.png" alt="" />
        <span class="nav_help_rule">Rules</span>
      </div>
    </header>

    <div class="game_lucky">
      <div class="game_lucky_info">
        <div class="game_lucky_info_balance">
          <div class="title">Balance</div>
          <div class="price"><span class="font32">₹</span><span class="font64">{{ balance }}</span></div>
        </div>
        <div class="game_lucky_info_recharge" @click="router.push('/recharge')">
          <span class="title">Recharge</span>
          <div class="icon"><img src="/static/image/home/icon_RightArrow.png" alt="" /></div>
        </div>
      </div>

      <div class="game_lucky_swiper">
        <div class="swiper">
          <div class="swiper-item">
            <div class="icon"><img src="/static/image/game/icon_notice.png" alt="" /></div>
            <div class="content">
              <span class="content_text">{{ notice }}</span>
              <span class="content_price">₹{{ round?.ticket ?? 1 }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="game_lucky_join">
        <div class="game_lucky_join_period">
          <div class="game_lucky_join_period_issue title">Period #{{ period }}</div>
          <div class="title">Countdown
            <div class="tdown">{{ countdown }}</div>
          </div>
        </div>

        <div class="game_lucky_tips">Choose a colour, then a number to join the round</div>

        <div class="game_lucky_join_select">
          <div class="game_lucky_join_select_button cgreen" :class="{ unable: busy }" @click="bet('Green')">Green</div>
          <div class="game_lucky_join_select_button cviolet" :class="{ unable: busy }" @click="bet('Violet')">Violet</div>
          <div class="game_lucky_join_select_button cred" :class="{ unable: busy }" @click="bet('Red')">Red</div>
        </div>

        <div class="game_lucky_join_nums">
          <div v-for="item in numbers" :key="item.n" class="number" @click="bet('Number ' + item.n)">
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
        <div class="game_tab_item_title" :class="{ tabselect: tab === 0 }">My Orders</div>
        <div v-if="tab === 0" class="game_tab_item_select"></div>
      </div>
      <div class="game_tab_item" @click="tab = 1">
        <div class="game_tab_item_title" :class="{ tabselect: tab === 1 }">Records</div>
        <div v-if="tab === 1" class="game_tab_item_select"></div>
      </div>
    </div>

    <div v-if="showRule" class="mask" @click.self="showRule = false">
      <div class="game_rule_wrap">
        <div class="game_rule">
          <div class="game_rule_content">
            <p>Welcome to Lucky Ball.</p>
            <p>1. Each round lasts a few minutes. Choose a colour (Green, Violet or Red) or a specific number.</p>
            <p>2. When the countdown ends, a winning number is drawn.</p>
            <p>3. Green and Red numbers pay 2x; Violet numbers pay more. Matching the exact number pays the most.</p>
            <p>4. Entries cost ₹{{ round?.ticket ?? 1 }} and are settled to your balance automatically.</p>
            <p>Play responsibly. Bet only what you can afford.</p>
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

.mask { position: fixed; left: 0; top: 0; z-index: 99999; display: flex; align-items: center; justify-content: center; width: 100vw; height: 100vh; background: rgba(0,0,0,.6); }
.game_rule_wrap { display: flex; flex-direction: column; align-items: center; }
.game .game_rule { width: 344px; height: 488px; background: url('/static/image/game/bg_rules.png') no-repeat; background-size: 100% 100%; padding: 50px 15px 20px 20px; }
.game .game_rule .game_rule_content { height: 100%; width: 100%; overflow: hidden; overflow-y: scroll; font-size: 13px; line-height: 20px; color: #8f5601; }
.game .game_close { margin-top: 8px; text-align: center; }
.game .game_close img { width: 29px; height: 29px; margin: 0 auto; }
</style>
