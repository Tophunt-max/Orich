<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useToast } from '../components/useToast';

const router = useRouter();
const { toast } = useToast();
const banks = ref([]);
async function load() { banks.value = (await api.bankList()).list; }
onMounted(load);
async function del(id) { await api.bankDel(id); toast('Removed'); load(); }
</script>

<template>
  <div class="scr">
    <NavBar title="Payment Methods" right="+ Add" @right="router.push('/payment/add')" />
    <div v-if="!banks.length" class="empty2"><img src="/static/image/nodata.png" alt="" /><div>No payment method yet</div></div>
    <div v-for="b in banks" :key="b.id" class="list-card bk">
      <div><div class="t">{{ b.type }}</div><div class="n">{{ b.holder }} · {{ b.number }}</div></div>
      <span class="del" @click="del(b.id)">Delete</span>
    </div>
  </div>
</template>

<style scoped>
.bk { display: flex; align-items: center; justify-content: space-between; }
.t { font-weight: 700; color: #17273a; } .n { color: #b9b9b9; font-size: 13px; margin-top: 4px; }
.del { color: #ff5c5c; font-size: 13px; }
</style>
