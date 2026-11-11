<script setup>
import { onMounted, ref } from 'vue';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
const list = ref([]);
onMounted(async () => {
  const [r, c, o] = await Promise.all([api.rechargeRecord(), api.cashList(), api.orders()]);
  list.value = [...r.list, ...c.list, ...o.list].sort((a, b) => b.id - a.id);
});
const sign = (t) => (t === 'recharge' ? '+' : '−');
</script>
<template>
  <div class="scr">
    <NavBar title="Fund Records" />
    <div v-if="!list.length" class="empty2"><img src="/static/image/nodata.png" alt="" /><div>No records</div></div>
    <div class="rec-list">
      <div v-for="o in list" :key="o.type + o.id" class="rec-item">
        <div class="rec-row"><span class="rec-v">{{ o.product || o.type }}</span><span class="rec-amt">{{ sign(o.type) }}₹{{ o.amount }}</span></div>
        <div class="rec-row"><span class="rec-k">{{ o.date }}</span><span class="rec-k">{{ o.status }}</span></div>
      </div>
    </div>
  </div>
</template>
