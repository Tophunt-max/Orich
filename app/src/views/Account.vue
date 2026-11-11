<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuth } from '../stores/auth';

const router = useRouter();
const { t } = useI18n();
const auth = useAuth();
const user = ref(null);

const menu = [
  { key: 'orders', label: 'account.orders', icon: '/static/image/home/icon_MyOrders.png', to: '/orders' },
  { key: 'finance', label: 'account.finance', icon: '/static/image/account/bg_finance.png', to: '/finance' },
  { key: 'tasks', label: 'task.title', icon: '/static/image/home/icon_Tips.png', to: '/tasks' },
  { key: 'vip', label: 'vip.title', icon: '/static/image/home/icon_HotPicks.png', to: '/vip' },
  { key: 'team', label: 'account.team', icon: '/static/image/account/bg_myteam.png', to: '/invitation' },
  { key: 'invite', label: 'account.invite', icon: '/static/image/home/icon_Invite.png', to: '/invitation' },
  { key: 'help', label: 'account.help', icon: '/static/image/home/icon_FAQ.png', to: '/help' },
  { key: 'service', label: 'account.service', icon: '/static/image/home/icon_Support.png', to: '/help' },
];

onMounted(async () => { user.value = await auth.refresh(); });

async function signOut() {
  await auth.signOut();
  router.replace('/home');
}
</script>

<template>
  <div class="page">
    <div class="header">
      <img class="avatar" :src="user?.avatar || '/static/image/home/icon_multiuser.png'" alt="" />
      <div class="uinfo">
        <div class="name">{{ user?.nickname || '—' }}</div>
        <div class="phone">{{ user?.phone }}</div>
      </div>
    </div>

    <div class="wallet card">
      <div class="wcol">
        <span class="wlabel">{{ t('account.wallet') }} (₹)</span>
        <span class="wval">{{ user?.balance ?? '0.00' }}</span>
      </div>
      <div class="wcol">
        <span class="wlabel">{{ t('account.frozen') }} (₹)</span>
        <span class="wval">{{ user?.frozen ?? '0.00' }}</span>
      </div>
      <div class="wactions">
        <button class="btn" @click="router.push('/recharge')">{{ t('common.recharge') }}</button>
        <button class="btn btn-ghost" @click="router.push('/recharge')">{{ t('account.withdraw') }}</button>
      </div>
    </div>

    <div class="menu card">
      <button v-for="m in menu" :key="m.key" class="mrow" @click="router.push(m.to)">
        <img :src="m.icon" alt="" />
        <span>{{ t(m.label) }}</span>
        <span class="chev">›</span>
      </button>
    </div>

    <button class="signout" @click="signOut">{{ t('account.signOut') }}</button>
  </div>
</template>

<style scoped>
.header { background: var(--brand); color: #fff; padding: 28px 18px; display: flex; align-items: center; gap: 14px; }
.avatar { width: 58px; height: 58px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.6); object-fit: cover; background: #fff; }
.name { font-size: 18px; font-weight: 700; }
.phone { opacity: 0.85; font-size: 13px; }
.wallet { margin: -18px 12px 12px; padding: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.wcol { display: flex; flex-direction: column; gap: 4px; }
.wlabel { font-size: 12px; color: var(--muted); }
.wval { font-size: 22px; font-weight: 700; color: var(--brand-dark); }
.wactions { grid-column: 1 / 3; display: flex; gap: 10px; margin-top: 6px; }
.menu { margin: 0 12px; padding: 0 14px; }
.mrow { width: 100%; background: none; display: flex; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid var(--line); font-size: 15px; color: var(--ink); }
.mrow:last-child { border-bottom: none; }
.mrow img { width: 24px; height: 24px; object-fit: contain; }
.chev { margin-left: auto; color: var(--muted); font-size: 20px; }
.signout { display: block; margin: 20px 12px; width: calc(100% - 24px); padding: 13px; border-radius: 24px; background: #fff; color: var(--brand-dark); font-weight: 600; border: 1px solid var(--line); }
</style>
