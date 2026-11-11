<script setup>
import { onMounted, ref } from 'vue';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useToast } from '../components/useToast';
const { toast } = useToast();
const list = ref([]);
onMounted(async () => { list.value = (await api.prizes()).list; });
</script>
<template>
  <div class="scr">
    <NavBar title="Prize Pool" />
    <div class="grid">
      <div v-for="p in list" :key="p.id" class="pcard">
        <img :src="p.cover" alt="" />
        <div class="pn">{{ p.name }}</div>
        <button class="redeem" @click="toast('Redeem needs ' + p.cost + ' points')">{{ p.cost }} pts</button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 12px; }
.pcard { background: #fff; border-radius: 10px; padding: 14px; text-align: center; }
.pcard img { width: 56px; height: 56px; object-fit: contain; margin: 0 auto 8px; }
.pn { font-size: 14px; color: #17273a; font-weight: 600; min-height: 36px; }
.redeem { margin-top: 8px; background: #ee5016; color: #fff; padding: 6px 16px; border-radius: 14px; font-weight: 600; }
</style>
