<script setup>
import { onMounted, ref } from 'vue';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useToast } from '../components/useToast';
const { toast } = useToast();
const list = ref([]);
onMounted(async () => { list.value = (await api.games()).list; });
</script>
<template>
  <div class="scr">
    <NavBar title="Games" />
    <div v-for="g in list" :key="g.id" class="list-card gcard" @click="toast(g.name + ' — coming soon')">
      <img :src="g.cover" alt="" />
      <div class="g"><div class="gn">{{ g.name }}</div><div class="gt">₹{{ g.ticket }} / play</div></div>
      <span class="play">Play ›</span>
    </div>
  </div>
</template>
<style scoped>
.gcard { display: flex; align-items: center; gap: 12px; }
.gcard img { width: 44px; height: 44px; object-fit: contain; }
.g { flex: 1; } .gn { font-weight: 700; color: #17273a; } .gt { color: #b9b9b9; font-size: 13px; }
.play { color: #ee5016; font-weight: 600; }
</style>
