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

<template>
  <div class="page">
    <header class="hero">
      <span class="logo">O</span>
      <span class="brand">{{ t('app.name') }}</span>
      <button class="lang" @click="toggleLang">{{ locale === 'en' ? 'हिं' : 'EN' }}</button>
    </header>

    <div v-if="loading" class="empty">{{ t('common.loading') }}</div>

    <template v-else-if="data">
      <div class="banner card">
        <img :src="data.banners[0]" alt="banner" />
      </div>

      <div class="notice card">
        <img src="/static/image/home/icon_Tips.png" class="tip" alt="" />
        <span>{{ data.notice }}</span>
      </div>

      <div class="entries card">
        <button v-for="e in data.entries" :key="e.key" class="entry" @click="go(e.key)">
          <img :src="e.icon" :alt="e.label" />
          <span>{{ e.label }}</span>
        </button>
      </div>

      <div class="section-title">
        <span>🔥 {{ t('home.hot') }}</span>
      </div>
      <div class="hot-scroll">
        <div v-for="p in data.hot" :key="p.id" class="hot-card card" @click="router.push('/goods/' + p.id)">
          <img :src="p.cover" :alt="p.title" />
          <div class="hot-title">{{ p.title }}</div>
          <div class="price">₹{{ p.price }} / {{ t('product.shares') }}</div>
        </div>
      </div>

      <div class="section-title">
        <span>{{ t('home.groupBuy') }}</span>
      </div>
      <div class="list">
        <div v-for="p in data.list" :key="p.id" class="prod card" @click="router.push('/goods/' + p.id)">
          <img class="cover" :src="p.cover" :alt="p.title" />
          <div class="info">
            <div class="ptitle">{{ p.title }}</div>
            <div class="muted sub">{{ p.subtitle }}</div>
            <div class="progress"><span :style="{ width: p.percent + '%' }"></span></div>
            <div class="row">
              <span class="muted">{{ p.joined }} {{ t('home.joined') }} · {{ p.remaining }} {{ t('home.remaining') }}</span>
              <span class="badge">{{ t('product.' + p.status) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section-title">
        <span>{{ t('home.latestWinners') }}</span>
        <span class="muted" style="font-size:13px" @click="router.push('/winner')">{{ t('home.viewAll') }} ›</span>
      </div>
      <div class="winners card">
        <div v-for="w in data.winners" :key="w.id" class="wrow">
          <img :src="w.avatar" alt="" />
          <div>
            <div>{{ w.name }}</div>
            <div class="muted" style="font-size:12px">{{ w.product }}</div>
          </div>
          <span class="muted" style="font-size:12px;margin-left:auto">{{ w.date }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.hero { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: var(--brand); color: #fff; }
.hero .logo { width: 30px; height: 30px; border-radius: 8px; background: #fff; color: var(--brand); font-weight: 800; font-size: 20px; display: flex; align-items: center; justify-content: center; }
.hero .brand { font-size: 18px; font-weight: 700; letter-spacing: 0.5px; }
.hero .lang { margin-left: auto; background: rgba(255,255,255,0.2); color: #fff; border-radius: 14px; padding: 4px 12px; font-size: 13px; }
.banner { margin: 12px; overflow: hidden; }
.banner img { width: 100%; height: 150px; object-fit: cover; }
.notice { margin: 0 12px; padding: 10px 12px; display: flex; align-items: center; gap: 8px; font-size: 13px; }
.notice .tip { width: 18px; height: 18px; }
.entries { margin: 12px; padding: 14px 6px; display: flex; }
.entry { flex: 1; background: none; display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 12px; color: var(--ink); }
.entry img { width: 34px; height: 34px; object-fit: contain; }
.hot-scroll { display: flex; gap: 10px; overflow-x: auto; padding: 0 12px 4px; }
.hot-card { flex: 0 0 132px; padding: 8px; }
.hot-card img { width: 100%; height: 100px; object-fit: cover; border-radius: 8px; }
.hot-title { font-size: 13px; margin: 6px 0 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.list { padding: 0 12px; display: flex; flex-direction: column; gap: 10px; }
.prod { display: flex; padding: 10px; gap: 10px; }
.prod .cover { width: 96px; height: 96px; border-radius: 8px; object-fit: cover; flex: 0 0 auto; }
.info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.ptitle { font-weight: 600; font-size: 14px; }
.sub { font-size: 12px; }
.row { display: flex; align-items: center; justify-content: space-between; font-size: 12px; }
.winners { margin: 0 12px; padding: 4px 12px; }
.wrow { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--line); }
.wrow:last-child { border-bottom: none; }
.wrow img { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
</style>
