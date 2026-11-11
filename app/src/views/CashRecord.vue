<script setup>
import { onMounted, ref } from 'vue';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
const list = ref([]);
onMounted(async () => { list.value = (await api.cashList()).list.reverse(); });
</script>
<template>
  <div class="scr">
    <NavBar title="Withdrawal Records" />
    <div v-if="!list.length" class="empty2"><img src="/static/image/nodata.png" alt="" /><div>No records</div></div>
    <div class="rec-list">
      <div v-for="o in list" :key="o.id" class="rec-item">
        <div class="rec-row"><span class="rec-v">Withdrawal</span><span class="rec-amt">−₹{{ o.amount }}</span></div>
        <div class="rec-row"><span class="rec-k">{{ o.date }}</span><span class="s-pending">{{ o.status }}</span></div>
      </div>
    </div>
  </div>
</template>
