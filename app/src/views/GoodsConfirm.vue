<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useAuth } from '../stores/auth';
import { useToast } from '../components/useToast';

const route = useRoute();
const router = useRouter();
const auth = useAuth();
const { toast } = useToast();
const item = ref(null);
const shares = ref(Number(route.query.shares) || 1);
const busy = ref(false);
const cost = computed(() => (item.value ? (shares.value * item.value.price).toFixed(2) : '0'));

onMounted(async () => { item.value = (await api.product(route.params.id)).item; await auth.refresh(); });

async function confirm() {
  busy.value = true;
  try {
    const d = await api.join(item.value.id, shares.value);
    auth.user = { ...auth.user, balance: d.balance };
    toast('Joined ✓');
    router.replace('/success');
  } catch (e) { toast(e.message); } finally { busy.value = false; }
}
</script>
<template>
  <div class="scr" v-if="item">
    <NavBar title="Confirm Order" />
    <div class="list-card goods">
      <img :src="item.cover" alt="" />
      <div class="g"><div class="gt">{{ item.title }}</div><div class="gs">{{ item.subtitle }}</div><div class="gp">₹{{ item.price }} / share</div></div>
    </div>
    <div class="list-card">
      <div class="rec-row"><span class="rec-k">Shares</span><span class="rec-v">{{ shares }}</span></div>
      <div class="rec-row"><span class="rec-k">Total</span><span class="rec-amt">₹{{ cost }}</span></div>
      <div class="rec-row"><span class="rec-k">Wallet</span><span class="rec-v">₹{{ auth.user?.balance ?? '0.00' }}</span></div>
    </div>
    <button class="big-btn" :disabled="busy" @click="confirm">Confirm & pay ₹{{ cost }}</button>
  </div>
</template>
<style scoped>
.goods { display: flex; gap: 12px; } .goods img { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; }
.gt { font-weight: 700; color: #17273a; } .gs { color: #b9b9b9; font-size: 13px; margin: 4px 0; } .gp { color: #ff5c5c; font-weight: 700; }
</style>
