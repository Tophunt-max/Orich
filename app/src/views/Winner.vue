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
  if (auth.isLoggedIn) {
    try { mine.value = (await api.myWinners()).list; } catch { /* ignore */ }
  }
});
</script>

<template>
  <div class="page">
    <header class="navbar">{{ t('winner.title') }}</header>
    <div class="tabs">
      <button :class="{ on: tab === 'all' }" @click="tab = 'all'">{{ t('common.all') }}</button>
      <button :class="{ on: tab === 'mine' }" @click="tab = 'mine'">{{ t('winner.mine') }}</button>
    </div>

    <div class="list">
      <template v-if="tab === 'all'">
        <div v-for="w in all" :key="w.id" class="wcard card">
          <img :src="w.avatar" alt="" />
          <div class="wbody">
            <div class="wtop"><b>{{ w.name }}</b><span class="muted">{{ w.date }}</span></div>
            <div>{{ w.product }}</div>
            <div class="muted small">{{ t('winner.code') }}: {{ w.code }} · {{ w.shares }} {{ t('winner.shares') }}</div>
          </div>
        </div>
      </template>
      <template v-else>
        <div v-if="!auth.isLoggedIn" class="empty">Please sign in to see your wins.</div>
        <div v-else-if="!mine.length" class="empty">
          <img src="/static/image/nodata.png" alt="" />
          <div>{{ t('common.empty') }}</div>
        </div>
        <div v-for="w in mine" :key="w.id" class="wcard card">
          <img :src="w.avatar" alt="" />
          <div class="wbody">
            <div class="wtop"><b>{{ w.name }}</b><span class="muted">{{ w.date }}</span></div>
            <div>{{ w.product }}</div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.tabs { display: flex; background: #fff; border-bottom: 1px solid var(--line); position: sticky; top: 48px; z-index: 10; }
.tabs button { flex: 1; padding: 12px; background: none; font-size: 15px; color: var(--muted); font-weight: 600; border-bottom: 2px solid transparent; }
.tabs button.on { color: var(--brand); border-bottom-color: var(--brand); }
.list { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.wcard { display: flex; gap: 12px; padding: 12px; align-items: center; }
.wcard img { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
.wbody { flex: 1; display: flex; flex-direction: column; gap: 3px; font-size: 14px; }
.wtop { display: flex; justify-content: space-between; font-size: 13px; }
.small { font-size: 12px; }
</style>
