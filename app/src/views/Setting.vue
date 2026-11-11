<script setup>
import { useRouter } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import { useAuth } from '../stores/auth';
const router = useRouter();
const auth = useAuth();
const rows = [
  { label: 'Edit name', to: '/username' },
  { label: 'Payment methods', to: '/payment' },
  { label: 'Addresses', to: '/address' },
  { label: 'About us', to: '/aboutus' },
  { label: 'Help & FAQ', to: '/help' },
];
function out() { auth.signOut().then(() => router.replace('/home')); }
</script>
<template>
  <div class="scr">
    <NavBar title="Settings" />
    <div class="list-card menu">
      <div v-for="r in rows" :key="r.to" class="mrow" @click="router.push(r.to)">{{ r.label }}<span>›</span></div>
    </div>
    <button class="big-btn" style="background:#fff;color:#ff5c5c;border:1px solid #f0d0c5" @click="out">Sign out</button>
  </div>
</template>
<style scoped>
.menu { padding: 0 16px; } .mrow { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #f2f2f2; color: #17273a; font-size: 15px; }
.mrow:last-child { border-bottom: none; } .mrow span { color: #b9b9b9; }
</style>
