<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
const route = useRoute();
const o = ref(null);
onMounted(async () => { try { o.value = (await api.orderDetail(route.params.id)).order; } catch { /* */ } });
</script>
<template>
  <div class="scr">
    <NavBar title="Order Details" />
    <div v-if="o" class="list-card">
      <div class="rec-row"><span class="rec-k">Item</span><span class="rec-v">{{ o.product || o.type }}</span></div>
      <div class="rec-row"><span class="rec-k">Amount</span><span class="rec-amt">₹{{ o.amount }}</span></div>
      <div class="rec-row" v-if="o.shares"><span class="rec-k">Shares</span><span class="rec-v">{{ o.shares }}</span></div>
      <div class="rec-row"><span class="rec-k">Status</span><span class="rec-v">{{ o.status }}</span></div>
      <div class="rec-row"><span class="rec-k">Date</span><span class="rec-v">{{ o.date }}</span></div>
      <div class="rec-row"><span class="rec-k">Order No.</span><span class="rec-v">#{{ o.id }}</span></div>
    </div>
    <div v-else class="empty2">Order not found</div>
  </div>
</template>
