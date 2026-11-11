<script setup>
import { onMounted, ref } from 'vue';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
const list = ref([]);
onMounted(async () => { try { list.value = (await api.myWinners()).list; } catch { /* */ } });
</script>
<template>
  <div class="scr">
    <NavBar title="My Shares" />
    <div v-if="!list.length" class="empty2"><img src="/static/image/nodata.png" alt="" /><div>No shares yet</div></div>
    <div v-for="w in list" :key="w.id" class="list-card sh">
      <img :src="w.avatar" alt="" />
      <div><div class="p">{{ w.product }}</div><div class="c">{{ w.code }} · {{ w.shares }} shares</div></div>
    </div>
  </div>
</template>
<style scoped>
.sh { display: flex; align-items: center; gap: 12px; } .sh img { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; }
.p { font-weight: 700; color: #17273a; } .c { color: #b9b9b9; font-size: 13px; margin-top: 3px; }
</style>
