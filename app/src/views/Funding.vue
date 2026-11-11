<script setup>
import { onMounted, ref } from 'vue';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';

const list = ref([]);

onMounted(async () => {
  const merged = [];
  try {
    const r = await api.rechargeRecord();
    (r?.list || []).forEach((o) => merged.push({ ...o, _label: 'Recharge', _sign: '+' }));
  } catch { /* ignore */ }
  try {
    const c = await api.cashList();
    (c?.list || []).forEach((o) => merged.push({ ...o, _label: 'Withdrawal', _sign: '−' }));
  } catch { /* ignore */ }
  merged.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return (b.id || 0) - (a.id || 0);
  });
  list.value = merged;
});
</script>

<!-- Faithful rebuild of the real pages/account/funding layout + scoped CSS. -->
<template>
  <div class="funding">
    <NavBar title="Funding Records" />

    <div v-if="list.length" class="list">
      <div v-for="o in list" :key="o._label + '-' + o.id" class="item">
        <div class="item-menu">
          <div class="item-key">{{ o._label }}</div>
          <div class="item-value">{{ o._sign }}₹{{ o.amount }}</div>
        </div>
        <div class="item-text">{{ o.date }} · {{ o.status }}</div>
      </div>
    </div>

    <div v-else class="funding_empty">
      <img src="/static/image/nodata.png" alt="" />
      <div>No funding records</div>
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
.funding .list .item .item-text { margin-top: 5px; font-size: 13px; font-family: Roboto, Roboto-Regular; color: #b9b9b9; }
.funding .list .item:not(:last-child) { border-bottom: 0.5px solid #ececec; }
.funding_empty { padding: 80px 0; text-align: center; color: #b9b9b9; font-size: 13px; }
.funding_empty img { width: 120px; height: 120px; object-fit: contain; opacity: 0.8; }
</style>
