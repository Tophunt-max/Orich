<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
const router = useRouter();
const team = ref(null);
onMounted(async () => { team.value = await api.team(); });
</script>
<template>
  <div class="scr" v-if="team">
    <NavBar title="My Team" />
    <div class="hero">
      <div class="num">{{ team.count }}</div><div class="lbl">Total members</div>
      <div class="code">Invite code: <b>{{ team.inviteCode }}</b></div>
    </div>
    <div v-for="l in team.levels" :key="l.level" class="list-card lv" @click="router.push('/team/' + l.level)">
      <div class="lt">Level {{ l.level }}</div>
      <div class="lm">{{ l.members }} members</div>
      <div class="lc">₹{{ l.commission }} ›</div>
    </div>
  </div>
</template>
<style scoped>
.hero { background: linear-gradient(160deg, #ee5016, #ff8a3d); color: #fff; text-align: center; padding: 26px 0 20px; }
.num { font-size: 36px; font-weight: 800; } .lbl { opacity: .9; } .code { margin-top: 10px; font-size: 13px; }
.lv { display: flex; align-items: center; gap: 12px; } .lt { font-weight: 700; color: #17273a; } .lm { flex: 1; color: #b9b9b9; font-size: 13px; } .lc { color: #ee5016; font-weight: 600; }
</style>
