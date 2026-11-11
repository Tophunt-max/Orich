<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useToast } from '../components/useToast';
const router = useRouter();
const { toast } = useToast();
const list = ref([]);
async function load() { list.value = (await api.addressList()).list; }
onMounted(load);
async function del(id) { await api.addressDel(id); toast('Removed'); load(); }
</script>
<template>
  <div class="scr">
    <NavBar title="Addresses" right="+ Add" @right="router.push('/address/add')" />
    <div v-if="!list.length" class="empty2"><img src="/static/image/nodata.png" alt="" /><div>No address yet</div></div>
    <div v-for="a in list" :key="a.id" class="list-card ad">
      <div><div class="n">{{ a.name }} <span class="ph">{{ a.phone }}</span></div><div class="l">{{ a.line }}</div></div>
      <span class="del" @click="del(a.id)">Delete</span>
    </div>
  </div>
</template>
<style scoped>
.ad { display: flex; align-items: center; justify-content: space-between; }
.n { font-weight: 700; color: #17273a; } .ph { color: #b9b9b9; font-weight: 400; font-size: 13px; margin-left: 6px; }
.l { color: #686868; font-size: 13px; margin-top: 4px; } .del { color: #ff5c5c; font-size: 13px; }
</style>
