<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from '../api/client';
import { useAuth } from '../stores/auth';

const { t } = useI18n();
const auth = useAuth();
const tab = ref('all');
const all = ref([]);
const mine = ref([]);

onMounted(async () => {
  all.value = (await api.winners()).list;
  if (auth.isLoggedIn) { try { mine.value = (await api.myWinners()).list; } catch { /* ignore */ } }
});
</script>

<!-- Faithful rebuild of the real pages/winner/winner (real .winner/.main classes + scoped CSS). -->
<template>
  <div class="winner">
    <header class="navbar">{{ t('winner.title') }}</header>
    <div class="tabs">
      <button :class="{ on: tab === 'all' }" @click="tab = 'all'">{{ t('common.all') }}</button>
      <button :class="{ on: tab === 'mine' }" @click="tab = 'mine'">{{ t('winner.mine') }}</button>
    </div>

    <template v-if="(tab === 'all' ? all : mine).length">
      <div v-for="w in (tab === 'all' ? all : mine)" :key="w.id" class="main">
        <div class="header">
          <img :src="w.avatar" alt="" />
          <span class="header-name">{{ w.name }}</span>
          <span class="header-time">{{ w.date }}</span>
        </div>
        <div class="title">🎉 {{ t('winner.congrats') }}</div>
        <div class="content">{{ t('winner.code') }}: {{ w.code }} · {{ w.shares }} {{ t('winner.shares') }}</div>
        <div v-if="w.images && w.images.length" class="imgArr">
          <img v-for="(im, k) in w.images" :key="k" :src="im" alt="" />
        </div>
        <div class="goods">
          <img :src="w.avatar" alt="" />
          <div class="goods-desc">
            <div class="goods-name">{{ w.product }}</div>
            <div class="goods-issue">#{{ w.code }}</div>
          </div>
        </div>
      </div>
    </template>
    <div v-else class="empty">
      <img src="/static/image/nodata.png" alt="" />
      <div>{{ tab === 'mine' && !auth.isLoggedIn ? t('winner.signinMine') : t('common.empty') }}</div>
    </div>
  </div>
</template>

<style scoped>
.winner { background: #f9f9f9; min-height: 100vh; padding-bottom: 49px; }
.tabs { display: flex; background: #fff; border-bottom: 1px solid #f0f0f0; position: sticky; top: 44px; z-index: 10; }
.tabs button { flex: 1; padding: 11px; background: none; font-size: 14px; color: #b9b9b9; font-weight: 600; border-bottom: 2px solid transparent; }
.tabs button.on { color: #ee5016; border-bottom-color: #ee5016; }

.main { position: relative; width: 100%; margin-top: 8px; padding: 15px 13px; background: #fff; }
.main .header { display: flex; flex-direction: row; align-items: center; justify-content: center; }
.main .header img { width: 28px; height: 28px; margin-right: 9px; border-radius: 50%; border: 1px solid #fff; object-fit: cover; }
.main .header .header-name { flex: 1; margin-right: 9px; font-size: 13px; font-family: Roboto, Roboto-Regular; font-weight: 600; color: #17273a; }
.main .header .header-time { font-size: 13px; font-family: Roboto, Roboto-Regular; color: #b9b9b9; }
.main .title { margin-top: 15px; font-size: 16px; font-family: Roboto, Roboto-Medium; font-weight: 700; color: #17273a; }
.main .content { margin-top: 10px; margin-bottom: 10px; font-size: 14px; font-family: Roboto, Roboto-Regular; color: #686868; }
.main .imgArr { display: flex; flex-direction: row; flex-wrap: wrap; align-items: center; justify-content: flex-start; margin: 8px 0; }
.main .imgArr img { width: 44px; height: 44px; margin-top: 5px; border-radius: 4px; margin-right: 8px; object-fit: cover; }
.main .goods { display: flex; flex-direction: row; align-items: center; justify-content: center; }
.main .goods img { width: 58px; height: 58px; margin-right: 7px; border-radius: 8px; object-fit: cover; }
.main .goods .goods-desc { display: flex; flex-direction: column; align-items: flex-start; justify-content: space-between; flex: 1; height: 67px; padding: 12px 16px 13px 16px; background: #f7f8f9; border-radius: 12px; }
.main .goods .goods-desc .goods-name { font-size: 14px; font-family: Roboto, Roboto-Medium; font-weight: 700; color: #17273a; }
.main .goods .goods-desc .goods-issue { font-size: 13px; font-family: Roboto, Roboto-Regular; color: #b9b9b9; }
.empty { text-align: center; color: #b9b9b9; padding: 60px 0; }
.empty img { width: 90px; margin: 0 auto 10px; opacity: 0.8; }
</style>
