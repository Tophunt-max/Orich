<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { api } from '../api/client';

const router = useRouter();
const { t, locale } = useI18n();
const data = ref(null);
const loading = ref(true);

function toggleLang() {
  locale.value = locale.value === 'en' ? 'hi' : 'en';
  localStorage.setItem('orich_lang', locale.value);
}
function go(key) {
  const map = { recharge: '/recharge', invite: '/invitation', orders: '/orders', support: '/help', task: '/tasks', vip: '/vip' };
  router.push(map[key] || '/home');
}

onMounted(async () => {
  try { data.value = await api.home(); } finally { loading.value = false; }
});
</script>

<!-- Faithful rebuild of the real pages/home/home (nav-logo, banner, quick-tab, notice, nshop list). -->
<template>
  <div class="home">
    <div class="home-background" :style="{ backgroundImage: `url(${data?.banners?.[0] || '/static/image/home/bg_homepage.png'})` }"></div>

    <div class="nav-logo">
      <span class="logo-badge">O</span><span class="logo-word">ORich</span>
      <span class="home-lang" @click="toggleLang">{{ locale === 'en' ? 'हिं' : 'EN' }}</span>
    </div>

    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>

    <template v-else-if="data">
      <div class="banner"><img :src="data.banners[0]" alt="" /></div>

      <div class="tab">
        <div v-for="e in data.entries" :key="e.key" class="tab-item" @click="go(e.key)">
          <img :src="e.icon" :alt="e.label" />
          <div class="tab-item-text">{{ e.label }}</div>
        </div>
      </div>

      <div class="toast">
        <div class="toast-swiper-item">
          <div class="toast-swiper-item-img"><img :src="data.winners[0]?.avatar" alt="" /></div>
          <div class="toast-swiper-item-main">
            <span class="name">{{ data.winners[0]?.name }}</span> won {{ data.winners[0]?.product }}
          </div>
        </div>
      </div>

      <div class="newbie">
        <div class="newbie-title">
          <span class="newbie-title-text">{{ t('home.groupBuy') }}</span>
          <span class="newbie-title-help" @click="router.push('/winner')">{{ t('home.viewAll') }} ›</span>
        </div>
        <div v-for="p in data.list" :key="p.id" class="nshop" @click="router.push('/goods/' + p.id)">
          <img class="nshop-img" :src="p.cover" :alt="p.title" />
          <div class="nshop-detail">
            <div class="nshop-title">{{ p.title }}</div>
            <div class="nshop-countdown">{{ p.subtitle }}</div>
            <div class="nshop-precent">
              <div class="nshop-progress"><div class="bar"><span :style="{ width: p.percent + '%' }"></span></div></div>
              <div class="nshop-progress-text">{{ p.percent }}%</div>
            </div>
            <div class="nshop-price">
              <span class="np">₹{{ p.price }}<i>/{{ t('product.shares') }}</i></span>
              <span class="nbtn">{{ t('product.joinNow') }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.home { position: relative; min-height: 100vh; padding-bottom: 49px; background-color: #f6f6f6; }
.home-background { height: 165px; width: 100%; position: absolute; top: 0; left: 0; background-size: 100% 100%; background-repeat: no-repeat; }
.nav-logo { position: relative; display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 7px; width: 100%; height: 44px; z-index: 2; }
.logo-badge { width: 26px; height: 26px; border-radius: 7px; background: #ee5016; color: #fff; font-weight: 800; font-size: 17px; display: flex; align-items: center; justify-content: center; }
.logo-word { font-size: 19px; font-weight: 800; color: #fff; letter-spacing: 0.5px; }
.home-lang { position: absolute; right: 15px; background: rgba(255,255,255,0.25); color: #fff; border-radius: 12px; padding: 3px 10px; font-size: 12px; }
.loading { position: relative; z-index: 2; text-align: center; color: #fff; padding: 40px; }

.banner { position: relative; z-index: 2; width: 100%; padding: 4px 12px 0; }
.banner img { width: 100%; height: 139px; object-fit: cover; border-radius: 8px; }

.tab { position: relative; z-index: 2; display: flex; flex-direction: row; align-items: flex-start; padding: 13px 10px; margin: 11px 12px 0; background-color: #fff; border-radius: 8px; }
.tab-item { flex: 1; text-align: center; }
.tab-item img { width: 44px; height: 44px; border-radius: 50%; object-fit: contain; }
.tab-item-text { margin-top: 2px; font-size: 12px; font-family: 'PingFang SC', 'PingFang SC-Bold'; font-weight: 700; color: #4f4f4f; }

.toast { position: relative; z-index: 2; margin: 11px 12px 0; border-radius: 8px; padding: 11px 12px; background-color: #fff; overflow: hidden; }
.toast-swiper-item { display: flex; align-items: center; }
.toast-swiper-item-img { width: 30px; height: 30px; border-radius: 50%; overflow: hidden; }
.toast-swiper-item-img img { width: 100%; height: 100%; object-fit: cover; }
.toast-swiper-item-main { flex: 1; margin-left: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 13px; color: #686868; }
.toast-swiper-item-main .name { color: #ee5016; }

.newbie { position: relative; z-index: 2; margin: 11px 12px 0; padding: 2px 0 12px; background: #fff; box-shadow: 0 4px 14px 0 rgba(0,0,0,.05); border-radius: 8px; overflow: hidden; }
.newbie .nshop + .nshop { margin-top: 16px; padding-top: 16px; border-top: 1px solid #f4f4f4; }
.newbie-title { display: flex; flex-direction: row; align-items: center; margin: 18px 16px 4px; }
.newbie-title-text { font-size: 18px; font-family: Roboto, Roboto-Bold; font-weight: 700; color: #17273a; }
.newbie-title-help { flex: 1; font-size: 14px; font-weight: 400; text-align: right; color: #b9b9b9; }
.nshop { position: relative; display: flex; flex-direction: row; align-items: flex-start; margin-top: 12px; padding: 0 14px; }
.nshop-img { flex-shrink: 0; width: 82px; height: 82px; margin-right: 12px; border-radius: 4px; object-fit: cover; }
.nshop-detail { flex: 1; min-width: 0; }
.nshop-title { font-size: 14px; font-family: 'PingFang SC', 'PingFang SC-Bold'; font-weight: 700; color: #000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nshop-countdown { font-size: 13px; color: #b9b9b9; margin-top: 2px; }
.nshop-precent { display: flex; flex-direction: row; align-items: center; margin-top: 6px; }
.nshop-progress { flex: 1; padding-right: 12px; }
.nshop-progress .bar { height: 8px; border-radius: 6px; background: #f0e3dc; overflow: hidden; }
.nshop-progress .bar span { display: block; height: 100%; background: linear-gradient(115deg, #ffe44b, #fea326); }
.nshop-progress-text { font-size: 14px; font-weight: 700; color: #000; }
.nshop-price { display: flex; align-items: center; justify-content: space-between; margin-top: 6px; }
.nshop-price .np { font-size: 18px; font-weight: 700; color: #ff5c5c; }
.nshop-price .np i { font-size: 12px; font-weight: 400; color: #b9b9b9; font-style: normal; }
.nshop-price .nbtn { padding: 5px 16px; background: linear-gradient(115deg, #ffe44b, #fea326); border-radius: 14px; font-size: 13px; font-weight: 700; color: #ad6701; }
</style>
