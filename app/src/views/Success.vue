<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
</script>
<template>
  <div class="scr success">
    <img src="/static/image/home/sus.png" alt="" onerror="this.style.display='none'" />
    <div class="tick">✓</div>
    <div class="t">Success</div>
    <div class="d">Your request was completed.</div>
    <button class="big-btn" style="max-width:260px" @click="router.replace('/home')">Back to home</button>
  </div>
</template>
<style scoped>
.success { display: flex; flex-direction: column; align-items: center; padding-top: 80px; }
.tick { width: 72px; height: 72px; border-radius: 50%; background: #55e273; color: #fff; font-size: 40px; display: flex; align-items: center; justify-content: center; }
.t { font-size: 22px; font-weight: 800; color: #17273a; margin-top: 16px; } .d { color: #b9b9b9; margin-top: 6px; }
</style>
