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
const shares = ref(1);
const busy = ref(false);
const cost = computed(() => (item.value ? (shares.value * item.value.price).toFixed(2) : '0'));

onMounted(async () => {
  const data = await api.product(route.params.id);
  item.value = data.item;
  prices.value = data.joinPrices;
});

async function join() {
  if (!auth.isLoggedIn) return router.push({ path: '/login', query: { redirect: route.fullPath } });
  busy.value = true;
  try {
    const data = await api.join(item.value.id, shares.value);
    toast(t('common.join') + ' ✓ · ₹' + data.balance);
    item.value = (await api.product(route.params.id)).item;
    auth.refresh();
  } catch (e) { toast(e.message); }
  finally { busy.value = false; }
}
</script>

<!-- Faithful rebuild of the real pages/goods/goods (banner, intro, people progress, buy bar). -->
<template>
  <div class="goods" v-if="item">
    <div class="backbar" @click="router.back()"><span>‹</span></div>
    <div class="banner">
      <img class="banner-img" :src="item.cover" :alt="item.title" />
      <div class="banner-countdown">⏳ {{ t('product.' + item.status) }}</div>
    </div>

    <div class="card">
      <div class="intro">
        <div class="intro-header">
          <div class="intro-price">
            <div class="intro-price-all">₹{{ item.price }}<span>₹{{ item.marketValue.toLocaleString() }}</span></div>
            <div class="intro-price-refund">{{ t('product.perShare') }}</div>
          </div>
          <div class="intro-title">{{ item.title }}</div>
          <div class="intro-text">{{ item.subtitle }}</div>
        </div>
      </div>

      <div class="people">
        <div class="people-view">
          <div class="people-text">{{ t('product.progress') }}</div>
          <div class="people-need">{{ item.percent }}%</div>
        </div>
        <div class="people-progress"><div class="bar"><span :style="{ width: item.percent + '%' }"></span></div></div>
        <div class="people-number">
          <span>{{ item.joined }} / {{ item.total }} {{ t('product.shares') }}</span>
          <span>{{ item.remaining }} {{ t('home.remaining') }}</span>
        </div>
      </div>
    </div>

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

    <div class="buybar">
      <div class="buybar-total"><span>{{ t('product.total') }}</span><b>₹{{ cost }}</b></div>
      <button class="buybar-btn" :disabled="busy || item.status !== 'ongoing'" @click="join">
        {{ item.status === 'ongoing' ? t('product.joinNow') : t('product.' + item.status) }}
      </button>
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
.intro-header { display: flex; flex-direction: column; align-items: flex-start; }
.intro-price { width: 100%; display: flex; align-items: center; justify-content: space-between; }
.intro-price-all { font-size: 24px; font-family: Roboto, Roboto-Bold; font-weight: 700; color: #ff5c5c; }
.intro-price-all span { margin-left: 11px; font-size: 16px; font-weight: 400; color: #b9b9b9; text-decoration: line-through; }
.intro-price-refund { margin-right: 5px; padding: 0 10px; height: 25px; line-height: 25px; background: linear-gradient(111deg, #ffe44b, #fea326); border-radius: 4px; font-size: 13px; color: #ea6a01; }
.intro-title { font-size: 16px; font-weight: 700; margin-top: 8px; color: #17273a; }
.intro-text { margin-top: 9px; font-size: 14px; color: #b9b9b9; }
.people { width: 100%; margin-top: 12px; }
.people-view { display: flex; align-items: center; justify-content: space-between; }
.people-text { font-size: 14px; color: #b9b9b9; }
.people-need { font-size: 14px; color: #ee5016; font-weight: 600; }
.people-progress { width: 100%; margin: 8px 0; }
.people-progress .bar { height: 10px; border-radius: 22px; background: #f0e3dc; overflow: hidden; }
.people-progress .bar span { display: block; height: 100%; background: linear-gradient(115deg, #ffe44b, #fea326); }
.people-number { width: 100%; padding: 9px 14px; margin-top: 8px; background: #f7f8f9; border-radius: 22px; display: flex; justify-content: space-between; font-size: 13px; color: #686868; }
.shares-card .sh-title { font-size: 15px; font-weight: 700; color: #17273a; margin-bottom: 12px; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { padding: 8px 16px; border-radius: 18px; background: #f2f3f5; color: #17273a; font-weight: 600; }
.chip.on { background: #ee5016; color: #fff; }
.stepper { display: flex; align-items: center; gap: 10px; margin-top: 14px; }
.stepper button { width: 36px; height: 36px; border-radius: 8px; background: #f2f3f5; font-size: 20px; color: #17273a; }
.stepper input { width: 64px; text-align: center; padding: 8px; border: 1px solid #ececec; border-radius: 8px; }
.buybar { position: fixed; left: 50%; transform: translateX(-50%); bottom: 0; width: 100%; max-width: var(--maxw); background: #fff; border-top: 1px solid #f0f0f0; display: flex; align-items: center; gap: 12px; padding: 9px 14px; }
.buybar-total { display: flex; flex-direction: column; }
.buybar-total span { font-size: 12px; color: #b9b9b9; }
.buybar-total b { color: #ff5c5c; font-size: 18px; }
.buybar-btn { flex: 1; height: 46px; border-radius: 23px; background: linear-gradient(115deg, #ffe44b, #fea326); color: #ad6701; font-size: 16px; font-weight: 700; }
.buybar-btn:disabled { opacity: 0.6; }
</style>
