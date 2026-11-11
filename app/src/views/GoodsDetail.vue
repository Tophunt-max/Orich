<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { api } from '../api/client';
import { useAuth } from '../stores/auth';
import { useToast } from '../components/useToast';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const auth = useAuth();
const { toast } = useToast();

const item = ref(null);
const prices = ref([]);
const participants = ref([]);
const prizeTiers = ref([]);
const winners = ref([]);
const reviews = ref([]);
const history = ref([]);
const peopleAvatars = ref([]);
const shares = ref(1);
const busy = ref(false);
const tab = ref('participation'); // participation | winner | reviews
const cost = computed(() => (item.value ? (shares.value * item.value.price).toFixed(2) : '0'));

function load(data) {
  item.value = data.item;
  prices.value = data.joinPrices;
  participants.value = data.item.participants || [];
  prizeTiers.value = data.item.prizeTiers || [];
  winners.value = data.item.winners || [];
  reviews.value = data.item.reviews || [];
  peopleAvatars.value = data.item.peopleAvatars || [];
}

onMounted(async () => {
  load(await api.product(route.params.id));
  // Prefer the live participation list; fall back to the embedded one when empty.
  try {
    const jl = await api.joinList(route.params.id);
    if (jl?.list?.length) participants.value = jl.list;
  } catch { /* keep embedded fallback */ }
  // Past rounds / winners for this product (duobaoitemhistory).
  try {
    const h = await api.itemHistory(route.params.id);
    history.value = h?.list || [];
  } catch { /* leave empty */ }
});

// Mask a winner's display name, e.g. "Rahul" -> "R***l".
function maskName(name) {
  const s = String(name || '').trim();
  if (!s) return 'Anonymous';
  if (s.length <= 2) return s[0] + '*';
  return s[0] + '***' + s[s.length - 1];
}

async function join() {
  if (!auth.isLoggedIn) return router.push({ path: '/login', query: { redirect: route.fullPath } });
  busy.value = true;
  try {
    const data = await api.join(item.value.id, shares.value);
    api.track('join_group_buy', { id: item.value.id, shares: shares.value });
    toast(t('common.join') + ' ✓ · ₹' + data.balance);
    load(await api.product(route.params.id));
    auth.refresh();
  } catch (e) { toast(e.message); }
  finally { busy.value = false; }
}
const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');
</script>

<!-- Faithful rebuild of the real pages/goods/goods: banner, intro, refund bar, people + avatars,
     prize tiers, shares, Participation / Winner / Reviews tabs, buy bar. -->
<template>
  <div class="goods" v-if="item">
    <div class="backbar" @click="router.back()"><span>‹</span></div>

    <!-- banner -->
    <div class="banner">
      <img class="banner-img" :src="item.cover" :alt="item.title" />
      <div class="banner-countdown">⏳ {{ t('product.' + item.status) }}</div>
    </div>

    <!-- intro -->
    <div class="card">
      <div class="intro">
        <div class="intro-header">
          <div class="intro-price">
            <div class="intro-price-all">₹{{ item.price }}<span>₹{{ item.marketValue.toLocaleString('en-IN') }}</span></div>
            <div class="intro-price-refund">{{ t('product.perShare') }}</div>
          </div>
          <div class="intro-title">{{ item.title }}</div>
          <div class="intro-text">{{ item.subtitle }}</div>
        </div>
      </div>
    </div>

    <!-- refund / loser bar -->
    <div class="loser">
      <div class="loser-text">Not won? You get a full refund of <span>₹{{ cost }}</span></div>
      <div class="loser-help">?</div>
    </div>

    <!-- people progress + participant avatars -->
    <div class="card">
      <div class="people">
        <div class="people-view">
          <div class="people-text">{{ t('product.progress') }}</div>
          <div class="people-avatar">
            <img v-for="(a, i) in peopleAvatars" :key="i" :src="a" alt="" />
          </div>
        </div>
        <div class="people-progress"><div class="bar"><span :style="{ width: item.percent + '%' }"></span></div></div>
        <div class="people-need">
          <span>{{ item.joined.toLocaleString('en-IN') }} / {{ item.total.toLocaleString('en-IN') }} {{ t('product.shares') }}</span>
          <span>{{ item.percent }}%</span>
        </div>
        <div class="people-number">
          <div class="people-title">
            <span>{{ item.remaining.toLocaleString('en-IN') }}</span>&nbsp;{{ t('home.remaining') }}
            <span class="people-all" @click="tab = 'participation'">All ›</span>
          </div>
        </div>
      </div>
    </div>

    <!-- prize tiers -->
    <div class="prize" v-if="prizeTiers.length">
      <div class="prize-title">
        <div><span class="prize-icon"></span><span class="prize-name">Prize</span></div>
        <span class="rule-color" @click="router.push('/rule')">Rules ›</span>
      </div>
      <div class="rank">
        <div v-for="p in prizeTiers" :key="p.rank" class="prize-rank">
          <div class="prize-rank-box">
            <img class="rank-icon" :src="p.icon" alt="" />
            <div class="rank-name">{{ p.name }}</div>
          </div>
          <div class="rank-price"><div class="rank-price-left">{{ inr(p.value) }}</div></div>
        </div>
      </div>
    </div>

    <!-- shares selector -->
    <div class="card shares-card">
      <div class="sh-title">{{ t('product.shares') }}</div>
      <div class="chips">
        <button v-for="n in prices" :key="n" class="chip" :class="{ on: shares === n }" @click="shares = n">{{ n }}</button>
      </div>
      <div class="stepper">
        <button @click="shares = Math.max(1, shares - 1)">−</button>
        <input v-model.number="shares" type="number" min="1" />
        <button @click="shares++">+</button>
      </div>
    </div>

    <!-- Participation / Winner / Reviews tabs -->
    <div class="main">
      <div class="ltab">
        <div class="ltab-item" :class="{ 'ltab-item-active': tab === 'participation' }" @click="tab = 'participation'">
          <div class="ltab-item-text">Participation</div><i></i>
        </div>
        <div class="ltab-item" :class="{ 'ltab-item-active': tab === 'winner' }" @click="tab = 'winner'">
          <div class="ltab-item-text">Winner</div><i></i>
        </div>
        <div class="ltab-item" :class="{ 'ltab-item-active': tab === 'reviews' }" @click="tab = 'reviews'">
          <div class="ltab-item-text">Reviews</div><i></i>
        </div>
      </div>

      <!-- participation list -->
      <div v-if="tab === 'participation'" class="participation">
        <div v-for="(u, i) in participants" :key="i" class="item">
          <div v-if="i < participants.length - 1" class="op"></div>
          <img class="avatar" :src="u.avatar" alt="" />
          <div class="detail">
            <div class="header">
              <div class="header-top">
                <div class="header-name">{{ u.name }}</div>
                <div class="header-time">{{ u.time }}</div>
              </div>
              <div class="header-bottom">Joined with {{ u.shares }} share(s)</div>
            </div>
            <div class="ip">{{ u.ip }}</div>
          </div>
        </div>
        <div v-if="!participants.length" class="empty">No participants yet</div>
      </div>

      <!-- winner list -->
      <div v-else-if="tab === 'winner'" class="winner">
        <div v-for="(w, i) in winners" :key="i" class="item">
          <img class="img" :src="w.cover" alt="" />
          <div class="detail">
            <div class="detail-userinfo">
              <div class="headimg"><img :src="w.avatar || '/static/image/networkimg/user.png'" alt="" /></div>
              <div class="name">{{ w.name }}</div>
            </div>
            <div class="title">{{ w.product }}</div>
            <div class="text">Lucky code: {{ w.code || '#OR' + (1000 + i) }} · {{ w.date }}</div>
          </div>
        </div>
        <div v-if="!winners.length" class="empty">No winners yet</div>

        <!-- past rounds (duobaoitemhistory) -->
        <div class="history">
          <div class="history-head">Past rounds</div>
          <div v-for="(h, i) in history" :key="i" class="hist-item">
            <img class="hist-avatar" :src="h.avatar || '/static/image/networkimg/user.png'" alt="" />
            <div class="hist-detail">
              <div class="hist-top">
                <div class="hist-name">{{ maskName(h.name) }}</div>
                <div class="hist-date">{{ h.date }}</div>
              </div>
              <div class="hist-product">{{ h.product }}</div>
              <div class="hist-meta">
                <span v-if="h.code">Code {{ h.code }}</span>
                <span v-if="h.shares != null">{{ h.shares }} share(s)</span>
              </div>
            </div>
          </div>
          <div v-if="!history.length" class="empty">No past rounds yet</div>
        </div>
      </div>

      <!-- reviews list -->
      <div v-else class="reviews">
        <div v-for="(r, i) in reviews" :key="i" class="item">
          <div class="header">
            <img class="avatar" :src="r.avatar" alt="" />
            <div class="name">{{ r.name }}</div>
            <div v-if="r.vip" class="vipimg">VIP</div>
            <div class="time">{{ r.time }}</div>
          </div>
          <div class="main-review">
            <div class="title">{{ r.title }}</div>
            <div class="content">{{ r.content }}</div>
            <div v-if="r.images && r.images.length" class="imgArr">
              <img v-for="(im, k) in r.images" :key="k" :src="im" alt="" />
            </div>
          </div>
        </div>
        <div v-if="!reviews.length" class="empty">No reviews yet</div>
      </div>
    </div>

    <!-- buy bar -->
    <div class="btn">
      <div class="btn-buy">
        <div class="btn-price">
          <div class="btn-price-new">₹{{ cost }}</div>
          <div class="btn-price-old">₹{{ item.marketValue.toLocaleString('en-IN') }}</div>
        </div>
        <button class="btn-btn" :disabled="busy || item.status !== 'ongoing'" @click="join">
          {{ item.status === 'ongoing' ? t('product.joinNow') : t('product.' + item.status) }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.goods { min-height: 100vh; background: #f9f9f9; padding-bottom: 66px; }
.backbar { position: absolute; top: 0; left: 0; height: 44px; display: flex; align-items: center; padding: 0 12px; z-index: 5; }
.backbar span { font-size: 30px; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,.4); }
.banner { position: relative; }
.banner-img { width: 100%; height: 280px; object-fit: cover; }
.banner-countdown { position: absolute; bottom: 9px; left: 5px; padding: 6px 16px; background: linear-gradient(256deg, #ee5016, rgba(238,80,22,.5)); border-radius: 100px 100px 100px 0; font-size: 15px; color: #fff; }
.card { padding: 15px; margin-bottom: 8px; background: #fff; }

/* intro */
.intro-header { display: flex; flex-direction: column; align-items: flex-start; }
.intro-price { width: 100%; display: flex; align-items: center; justify-content: space-between; }
.intro-price-all { font-size: 24px; font-family: Roboto, Roboto-Bold; font-weight: 700; color: #ff5c5c; }
.intro-price-all span { margin-left: 11px; font-size: 16px; font-weight: 400; color: #b9b9b9; text-decoration: line-through; }
.intro-price-refund { margin-right: 5px; padding: 0 10px; height: 25px; line-height: 25px; background: linear-gradient(111deg, #ffe44b, #fea326); border-radius: 4px; font-size: 13px; color: #ea6a01; }
.intro-title { font-size: 16px; font-weight: 700; margin-top: 8px; color: #17273a; }
.intro-text { margin-top: 9px; font-size: 14px; color: #b9b9b9; }

/* refund bar */
.loser { width: 100%; height: 40px; background: #fdedd6; margin-top: -8px; margin-bottom: 8px; padding: 0 18px 0 13px; display: flex; align-items: center; justify-content: space-between; }
.loser-text { font-size: 13px; font-family: Roboto, Roboto-Regular; color: #ad6701; }
.loser-text span { color: #ff5c5c; margin-left: 3px; font-weight: 700; }
.loser-help { flex-shrink: 0; width: 16px; height: 16px; line-height: 16px; text-align: center; border-radius: 50%; background: #ad6701; color: #fdedd6; font-size: 11px; }

/* people */
.people { width: 100%; }
.people-text { font-size: 14px; color: #b9b9b9; }
.people-view { display: flex; align-items: center; justify-content: space-between; }
.people-avatar { display: flex; flex-direction: row; align-items: center; }
.people-avatar img { width: 22px; height: 22px; border-radius: 50%; border: 1px solid #fff; margin-left: -7px; object-fit: cover; }
.people-progress { width: 100%; margin: 8px 0; }
.people-progress .bar { height: 10px; border-radius: 22px; background: #f0e3dc; overflow: hidden; }
.people-progress .bar span { display: block; height: 100%; background: linear-gradient(115deg, #ffe44b, #fea326); }
.people-need { display: flex; align-items: center; justify-content: space-between; font-size: 14px; color: #ee5016; }
.people-number { width: 100%; padding: 9px 14px; margin-top: 12px; background: #f7f8f9; border-radius: 22px; }
.people-title { display: flex; align-items: center; justify-content: center; font-size: 14px; color: #17273a; }
.people-title span { color: #ee5016; font-weight: 700; }
.people-title .people-all { margin-left: 18px; font-size: 13px; color: #58a5ff; }

/* prize tiers */
.prize { margin-bottom: 8px; padding: 14px 15px 18px 15px; background: #fff; }
.prize-title { margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between; }
.prize-title > div { display: flex; align-items: center; }
.prize-icon { display: inline-block; width: 5px; height: 10px; background: #ee5016; margin-right: 8px; }
.prize-name { font-size: 16px; font-weight: 500; color: #17273a; }
.rule-color { color: #58a5ff; font-size: 14px; }
.rank { max-height: 164px; overflow-y: auto; }
.prize-rank { padding: 12px 0 0 0; display: flex; align-items: center; justify-content: space-between; }
.prize-rank-box { display: flex; align-items: center; }
.rank-icon { width: 15px; height: 20px; object-fit: contain; }
.rank-name { margin-left: 12px; font-size: 14px; font-weight: 500; color: #17273a; }
.rank-price { font-size: 16px; font-family: Roboto, Roboto-Bold; font-weight: 700; color: #ff5c5c; }

/* shares */
.shares-card .sh-title { font-size: 15px; font-weight: 700; color: #17273a; margin-bottom: 12px; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { padding: 8px 16px; border-radius: 18px; background: #f2f3f5; color: #17273a; font-weight: 600; }
.chip.on { background: #ee5016; color: #fff; }
.stepper { display: flex; align-items: center; gap: 10px; margin-top: 14px; }
.stepper button { width: 36px; height: 36px; border-radius: 8px; background: #f2f3f5; font-size: 20px; color: #17273a; }
.stepper input { width: 64px; text-align: center; padding: 8px; border: 1px solid #ececec; border-radius: 8px; }

/* tabs */
.main { width: 100%; margin-bottom: 10px; background: #fff; }
.ltab { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 14px 25px 10px 25px; border-bottom: 4px solid #f9f9f9; }
.ltab-item { display: flex; flex-direction: column; align-items: center; cursor: pointer; }
.ltab-item-text { font-size: 14px; font-weight: 700; color: #b9b9b9; margin-bottom: 3px; }
.ltab-item i { width: 17px; height: 3px; border-radius: 2px; background: transparent; }
.ltab-item-active .ltab-item-text { font-size: 16px; color: #17273a; }
.ltab-item-active i { background: #ee5016; }
.empty { text-align: center; color: #b9b9b9; font-size: 13px; padding: 24px 0; }

/* participation */
.participation { width: 100%; padding: 0 15px 0 28px; }
.participation .item { position: relative; display: flex; align-items: flex-start; width: 100%; padding: 17px 0 20px 0; }
.participation .item .op { position: absolute; top: 60px; left: -4px; width: 1px; height: 37px; opacity: .3; border-left: 1px dashed #b9b9b9; }
.participation .item .avatar { width: 48px; height: 48px; margin-right: 16px; border-radius: 50%; border: 1px solid #fff; object-fit: cover; }
.participation .item .detail { flex: 1; }
.participation .item .header { display: flex; flex-direction: column; justify-content: space-between; min-height: 48px; padding: 4px 0 2px 0; }
.participation .item .header-top { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.participation .item .header-name { max-width: 120px; font-size: 14px; font-weight: 700; color: #17273a; }
.participation .item .header-time { font-size: 12px; color: #b9b9b9; }
.participation .item .header-bottom { margin-top: 4px; font-size: 14px; color: #b9b9b9; }
.participation .item .ip { margin-top: 4px; font-size: 14px; color: #b9b9b9; }

/* winner */
.winner { width: 100%; padding: 12px 14px 12px 21px; }
.winner .item { display: flex; align-items: center; width: 100%; padding: 9px 0; }
.winner .item:not(:last-child) { border-bottom: .5px solid #ececec; }
.winner .item .img { width: 92px; height: 92px; border-radius: 4px; margin-right: 13px; object-fit: cover; }
.winner .item .detail { flex: 1; }
.winner .item .detail-userinfo { display: flex; align-items: center; }
.winner .item .detail-userinfo .headimg { width: 28px; height: 28px; border-radius: 50%; overflow: hidden; margin-right: 5px; }
.winner .item .detail-userinfo .headimg img { width: 100%; height: 100%; object-fit: cover; }
.winner .item .detail .name { font-size: 14px; }
.winner .item .detail .title { margin: 7px 0; font-size: 14px; font-weight: 700; color: #000; }
.winner .item .detail .text { font-size: 13px; color: #b9b9b9; }

/* past rounds */
.history { margin-top: 10px; border-top: 4px solid #f9f9f9; padding-top: 10px; }
.history .history-head { font-size: 14px; font-weight: 700; color: #17273a; margin-bottom: 4px; }
.history .hist-item { display: flex; align-items: flex-start; padding: 10px 0; }
.history .hist-item:not(:last-child) { border-bottom: .5px solid #ececec; }
.history .hist-avatar { width: 36px; height: 36px; border-radius: 50%; margin-right: 12px; object-fit: cover; border: 1px solid #fff; }
.history .hist-detail { flex: 1; }
.history .hist-top { display: flex; align-items: center; justify-content: space-between; }
.history .hist-name { font-size: 14px; font-weight: 700; color: #17273a; }
.history .hist-date { font-size: 12px; color: #b9b9b9; }
.history .hist-product { margin-top: 3px; font-size: 13px; color: #17273a; }
.history .hist-meta { margin-top: 3px; font-size: 12px; color: #b9b9b9; display: flex; gap: 12px; }

/* reviews */
.reviews { width: 100%; padding: 0 12px; }
.reviews .item { width: 100%; padding: 17px 0 14px 0; }
.reviews .item:not(:last-child) { border-bottom: .5px solid #ececec; }
.reviews .item .header { display: flex; align-items: center; }
.reviews .item .header .avatar { width: 28px; height: 28px; margin-right: 9px; border-radius: 50%; border: 1px solid #fff; object-fit: cover; }
.reviews .item .header .name { margin-right: 8px; font-size: 13px; color: #17273a; max-width: 120px; }
.reviews .item .header .vipimg { margin-right: 8px; padding: 2px 8px; border-radius: 4px; background: linear-gradient(111deg, #ffe44b, #fea326); color: #9c4d08; font-size: 11px; font-weight: 700; }
.reviews .item .header .time { flex: 1; text-align: right; font-size: 12px; color: #b9b9b9; }
.reviews .item .main-review { width: 100%; margin-top: 12px; padding: 13px 15px; background: #f7f8f9; border-radius: 18px; }
.reviews .item .main-review .title { font-size: 14px; color: #17273a; }
.reviews .item .main-review .content { margin-top: 6px; font-size: 14px; color: #b9b9b9; }
.reviews .item .main-review .imgArr { display: flex; align-items: center; flex-wrap: wrap; }
.reviews .item .main-review .imgArr img { width: 44px; height: 44px; border-radius: 4px; margin-top: 10px; margin-right: 8px; object-fit: cover; }

/* buy bar */
.btn { position: fixed; left: 50%; transform: translateX(-50%); bottom: 0; width: 100%; max-width: var(--maxw); height: 56px; background: #fff; box-shadow: 0 -2px 12px rgba(0,0,0,.08); display: flex; align-items: center; z-index: 99; }
.btn-buy { display: flex; align-items: center; width: 100%; height: 100%; margin: 0 15px; }
.btn-price { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.btn-price-new { font-size: 16px; font-weight: 700; color: #ee5016; }
.btn-price-old { font-size: 13px; color: #b9b9b9; text-decoration: line-through; }
.btn-btn { width: 160px; height: 42px; border-radius: 21px; background: linear-gradient(115deg, #ffe44b, #fea326); color: #ad6701; font-size: 16px; font-weight: 700; }
.btn-btn:disabled { opacity: .6; }
</style>
