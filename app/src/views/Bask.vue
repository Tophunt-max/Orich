<script setup>
import { onMounted, ref } from 'vue';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useToast } from '../components/useToast';
const { toast } = useToast();
const code = ref('');
onMounted(async () => { try { code.value = (await api.invite()).inviteCode; } catch { /* */ } });
async function share() {
  const text = `Join me on ORich! Use my code ${code.value}`;
  try { if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); toast('Copied'); } }
  catch { toast(text); }
}
</script>
<template>
  <div class="scr bask">
    <NavBar title="Share" />
    <div class="card">
      <div class="badge">O</div>
      <div class="t">Share ORich with friends</div>
      <div class="code">Your code: <b>{{ code }}</b></div>
      <button class="big-btn" style="max-width:280px" @click="share">Share now</button>
    </div>
  </div>
</template>
<style scoped>
.card { text-align: center; padding: 30px 16px; }
.badge { width: 64px; height: 64px; border-radius: 16px; background: #ee5016; color: #fff; font-size: 38px; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
.t { font-size: 18px; font-weight: 700; color: #17273a; } .code { margin-top: 8px; color: #686868; } .code b { color: #ee5016; }
</style>
