<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useAuth } from '../stores/auth';
import { useToast } from '../components/useToast';

const auth = useAuth();
const { toast } = useToast();
const { t } = useI18n({
  useScope: 'local',
  messages: {
    en: {
      navTitle: 'Notifications',
      readAll: 'Read all',
      pleaseSignIn: 'Please sign in',
      allMarkedRead: 'All marked read',
      empty: 'No notifications',
    },
    hi: {
      navTitle: 'सूचनाएं',
      readAll: 'सभी पढ़ें',
      pleaseSignIn: 'कृपया साइन इन करें',
      allMarkedRead: 'सभी पढ़ा हुआ चिह्नित',
      empty: 'कोई सूचना नहीं',
    },
  },
});
const list = ref([]);
const unread = ref(0);

const ICON = {
  winner: '/static/image/home/icon_Winner.png',
  promo: '/static/image/home/icon_Promotion.png',
  order: '/static/image/home/icon_MyOrders.png',
  system: '/static/image/home/icon_Support.png',
};

async function load() {
  const d = await api.notifications();
  list.value = d.list || [];
  unread.value = d.unread || 0;
}
onMounted(load);

async function open(n) {
  if (!n.read && auth.isLoggedIn) {
    try { await api.notifyRead(n.id); n.read = true; unread.value = Math.max(0, unread.value - 1); } catch { /* ignore */ }
  }
}
async function readAll() {
  if (!auth.isLoggedIn) return toast(t('pleaseSignIn'));
  try { await api.notifyRead(); await load(); toast(t('allMarkedRead')); } catch (e) { toast(e.message); }
}
</script>

<template>
  <div class="notis">
    <NavBar :title="t('navTitle')" :right="unread ? t('readAll') : ''" @right="readAll" />
    <div class="list">
      <div v-for="n in list" :key="n.id" class="item" :class="{ unread: !n.read }" @click="open(n)">
        <div class="ic"><img :src="ICON[n.type] || ICON.system" alt="" /><i v-if="!n.read" class="dot"></i></div>
        <div class="body">
          <div class="top"><span class="title">{{ n.title }}</span><span class="date">{{ n.date }}</span></div>
          <div class="text">{{ n.body }}</div>
        </div>
      </div>
      <div v-if="!list.length" class="empty"><img src="/static/image/nodata.png" alt="" /><p>{{ t('empty') }}</p></div>
    </div>
  </div>
</template>

<style scoped>
.notis { min-height: 100vh; background: #f6f6f6; }
.list { padding: 8px 0; }
.item { display: flex; gap: 12px; padding: 14px 16px; background: #fff; margin-bottom: 8px; }
.item.unread { background: #fffaf7; }
.ic { position: relative; width: 42px; height: 42px; flex-shrink: 0; border-radius: 50%; background: #fdeee6; display: flex; align-items: center; justify-content: center; }
.ic img { width: 24px; height: 24px; object-fit: contain; }
.ic .dot { position: absolute; top: 0; right: 0; width: 9px; height: 9px; border-radius: 50%; background: #ff5c5c; border: 1.5px solid #fff; }
.body { flex: 1; min-width: 0; }
.top { display: flex; align-items: center; justify-content: space-between; }
.title { font-size: 15px; font-weight: 700; color: #17273a; }
.date { font-size: 12px; color: #b9b9b9; flex-shrink: 0; margin-left: 8px; }
.text { margin-top: 5px; font-size: 13px; line-height: 1.5; color: #686868; }
.empty { text-align: center; padding: 60px 0; color: #b9b9b9; }
.empty img { width: 90px; margin: 0 auto 10px; opacity: .8; }
</style>
