<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
const slides = [
  { t: 'Join from ₹1', d: 'Buy shares in a group-buy and win big products.' },
  { t: 'Win & withdraw', d: 'Lucky draws decide winners. Cash out any time.' },
  { t: 'Invite & earn', d: 'Refer friends and earn commission on every join.' },
];
</script>
<template>
  <div class="intro">
    <div class="slides">
      <div v-for="(s, i) in slides" :key="i" class="slide"><div class="st">{{ s.t }}</div><div class="sd">{{ s.d }}</div></div>
    </div>
    <button class="start" @click="router.replace('/home')">Get Started</button>
  </div>
</template>
<style scoped>
.intro { min-height: 100vh; background: linear-gradient(160deg, #ee5016, #ff8a3d); color: #fff; display: flex; flex-direction: column; justify-content: center; padding: 30px; }
.slide { margin-bottom: 28px; } .st { font-size: 26px; font-weight: 800; } .sd { margin-top: 8px; opacity: .92; line-height: 1.6; }
.start { margin-top: 20px; height: 50px; border-radius: 25px; background: #fff; color: #ee5016; font-size: 17px; font-weight: 700; }
</style>
