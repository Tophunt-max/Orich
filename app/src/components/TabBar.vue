<script setup>
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

// Real ORich 2.1.4 bottom bar: 5 tabs (Home, Winner, Task, VIP, Account).
const tabs = [
  { path: '/home', key: 'home', nor: '/static/image/tab/icon_home_Nav_nor.png', sel: '/static/image/tab/icon_home_Nav_sel.png' },
  { path: '/winner', key: 'winner', nor: '/static/image/tab/icon_Winner_Nav_nor.png', sel: '/static/image/tab/icon_Winner_Nav_sel.png' },
  { path: '/tasks', key: 'task', nor: '/static/image/tab/icon_task_nor.png', sel: '/static/image/tab/icon_task_sel.png' },
  { path: '/vip', key: 'vip', nor: '/static/image/tab/icon_vip_Nav_nor.png', sel: '/static/image/tab/icon_vip_Nav_sel.png' },
  { path: '/account', key: 'account', nor: '/static/image/tab/icon_Account_Nav_nor.png', sel: '/static/image/tab/icon_Account_Nav_sel.png' },
];
</script>

<template>
  <nav class="tabbar">
    <button v-for="tb in tabs" :key="tb.path" class="tab" :class="{ active: route.path === tb.path }" @click="router.replace(tb.path)">
      <img :src="route.path === tb.path ? tb.sel : tb.nor" :alt="t('tab.' + tb.key)" />
      <span>{{ t('tab.' + tb.key) }}</span>
    </button>
  </nav>
</template>

<style scoped>
.tabbar {
  position: fixed; left: 50%; transform: translateX(-50%); bottom: 0; z-index: 30;
  width: 100%; max-width: var(--maxw); height: 56px;
  display: flex; background: #fff; border-top: 1px solid var(--line);
}
.tab { flex: 1; background: none; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; color: var(--ink); font-size: 11px; }
.tab img { width: 22px; height: 22px; object-fit: contain; }
.tab.active { color: var(--brand); font-weight: 600; }
</style>
