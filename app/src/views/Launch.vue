<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
onMounted(() => setTimeout(() => router.replace('/home'), 1200));
</script>
<template>
  <div class="launch"><div class="badge">O</div><div class="name">ORich</div></div>
</template>
<style scoped>
.launch { min-height: 100vh; background: #ee5016; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; }
.badge { width: 84px; height: 84px; border-radius: 20px; background: #fff; color: #ee5016; font-size: 52px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
.name { color: #fff; font-size: 26px; font-weight: 800; letter-spacing: 1px; }
</style>
