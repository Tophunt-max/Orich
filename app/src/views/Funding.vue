<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';

const { t } = useI18n({
  useScope: 'local',
  messages: {
    en: {
      navTitle: 'Funding Records',
      empty: 'No funding records',
      recharge: 'Recharge',
      withdrawal: 'Withdrawal',
      spending: 'Spending',
      luckyDraw: 'Lucky draw',
      finance: 'Finance',
      vip: 'VIP',
      luckyNumber: 'Lucky number',
    },
    hi: {
      navTitle: 'फंडिंग रिकॉर्ड',
      empty: 'कोई फंडिंग रिकॉर्ड नहीं',
      recharge: 'रिचार्ज',
      withdrawal: 'निकासी',
      spending: 'व्यय',
      luckyDraw: 'लकी ड्रॉ',
      finance: 'वित्त',
      vip: 'वीआईपी',
      luckyNumber: 'लकी नंबर',
    },
  },
});

const list = ref([]);

// Human labels for the spending record types returned by consumeList.
const CONSUME_LABELS = {
  join: t('luckyDraw'),
  finance: t('finance'),
  vip: t('vip'),
  lucky: t('luckyNumber'),
  withdraw: t('withdrawal'),
};

onMounted(async () => {
  const merged = [];
  try {
    const r = await api.rechargeRecord();
    (r?.list || []).forEach((o) => merged.push({ ...o, _label: t('recharge'), _sign: '+' }));
  } catch { /* ignore */ }
  try {
    const c = await api.cashList();
    (c?.list || []).forEach((o) => merged.push({ ...o, _label: t('withdrawal'), _sign: '−' }));
  } catch { /* ignore */ }
  try {
    const s = await api.consumeList();
    (s?.list || []).forEach((o) => {
      const label = CONSUME_LABELS[o.type] || o.product || t('spending');
      merged.push({ ...o, _label: label, _sign: '−' });
    });
  } catch { /* ignore */ }
  merged.sort((a, b) => {
    if (a.date !== b.date) return (a.date || '') < (b.date || '') ? 1 : -1;
    return (b.id || 0) - (a.id || 0);
  });
  list.value = merged;
});
</script>

<!-- Faithful rebuild of the real pages/account/funding layout + scoped CSS. -->
<template>
  <div class="funding">
    <NavBar :title="t('navTitle')" />

    <div v-if="list.length" class="list">
      <div v-for="(o, i) in list" :key="o._label + '-' + (o.id || i)" class="item">
        <div class="item-menu">
          <div class="item-key">{{ o._label }}</div>
          <div class="item-value" :class="{ credit: o._sign === '+' }">{{ o._sign }}₹{{ o.amount }}</div>
        </div>
        <div class="item-text">{{ o.date }}<template v-if="o.status"> · {{ o.status }}</template></div>
      </div>
    </div>

    <div v-else class="funding_empty">
      <img src="/static/image/nodata.png" alt="" />
      <div>{{ t('empty') }}</div>
    </div>
  </div>
</template>

<style scoped>
.funding { position: relative; min-height: 100vh; background: #f8f8f8; }
.funding .list { background: #fff; padding: 0 15px; }
.funding .list .item { padding: 10px 0; }
.funding .list .item .item-menu { display: flex; flex-direction: row; align-items: center; justify-content: space-between; width: 100%; }
.funding .list .item .item-key { width: 200px; font-size: 16px; font-family: Roboto, Roboto-Medium; font-weight: 700; color: #444; }
.funding .list .item .item-value { font-size: 16px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #ff5c5c; letter-spacing: 0px; }
.funding .list .item .item-value.credit { color: #20a060; }
.funding .list .item .item-text { margin-top: 5px; font-size: 13px; font-family: Roboto, Roboto-Regular; color: #b9b9b9; }
.funding .list .item:not(:last-child) { border-bottom: 0.5px solid #ececec; }
.funding_empty { padding: 80px 0; text-align: center; color: #b9b9b9; font-size: 13px; }
.funding_empty img { width: 120px; height: 120px; object-fit: contain; opacity: 0.8; }
</style>
