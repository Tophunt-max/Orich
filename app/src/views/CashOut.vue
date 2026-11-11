<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useAuth } from '../stores/auth';
import { useToast } from '../components/useToast';

const router = useRouter();
const auth = useAuth();
const { toast } = useToast();
const amount = ref('');
const banks = ref([]);
const busy = ref(false);

onMounted(async () => { await auth.refresh(); banks.value = (await api.bankList()).list; });

async function submit() {
  busy.value = true;
  try {
    const d = await api.withdraw(Number(amount.value));
    auth.user = { ...auth.user, balance: d.balance };
    toast('Withdrawal requested');
    amount.value = '';
  } catch (e) { toast(e.message); }
  finally { busy.value = false; }
}
</script>

<template>
  <div class="form-page">
    <NavBar title="Withdraw" right="Records" @right="router.push('/cashrecord')" />
    <div class="bal">Available: <b>₹{{ auth.user?.balance ?? '0.00' }}</b></div>
    <div class="form-field"><label>Amount (₹)</label><input v-model="amount" type="number" placeholder="Min ₹100" /></div>
    <div class="form-field">
      <label>Bank / UPI</label>
      <div v-if="banks.length" class="bk">{{ banks[0].type }} · {{ banks[0].number }}</div>
      <div v-else class="addbk" @click="router.push('/payment/add')">+ Add a bank / UPI account</div>
    </div>
    <button class="big-btn" :disabled="busy || !amount" @click="submit">Request withdrawal</button>
  </div>
</template>

<style scoped>
.bal { padding: 14px 16px; font-size: 14px; color: #17273a; } .bal b { color: #ee5016; font-size: 18px; }
.bk { font-size: 15px; color: #17273a; } .addbk { color: #ee5016; font-size: 14px; }
</style>
