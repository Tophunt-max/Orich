<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useAuth } from '../stores/auth';
import { useToast } from '../components/useToast';

const { t } = useI18n();
const auth = useAuth();
const { toast } = useToast();
const options = ref([]);
const amount = ref(0);
const custom = ref('');
const busy = ref(false);

onMounted(async () => {
  options.value = (await api.rechargeOptions()).options;
  await auth.refresh();
});

function pick(v) { amount.value = v; custom.value = ''; }

async function pay() {
  const value = Number(custom.value) || amount.value;
  if (!value || value < 1) return toast(t('recharge.choose'));
  busy.value = true;
  try {
    const data = await api.recharge(value);
    auth.user = { ...auth.user, balance: data.balance };
    toast(t('recharge.success') + ' · ₹' + data.balance);
    amount.value = 0; custom.value = '';
  } catch (e) { toast(e.message); }
  finally { busy.value = false; }
}
</script>

<template>
  <div class="page">
    <NavBar :title="t('recharge.title')" />
    <div class="bal card">
      <span class="muted">{{ t('common.balance') }}</span>
      <span class="price big">₹{{ auth.user?.balance ?? '0.00' }}</span>
    </div>

    <div class="section-title">{{ t('recharge.choose') }}</div>
    <div class="grid">
      <button v-for="o in options" :key="o" class="opt card" :class="{ on: amount === o && !custom }" @click="pick(o)">
        <span class="price">₹{{ o }}</span>
      </button>
    </div>

    <div class="section-title">{{ t('recharge.custom') }}</div>
    <div style="padding:0 12px">
      <input class="field" v-model="custom" type="number" min="1" placeholder="₹" @focus="amount = 0" />
    </div>

    <div style="padding:20px 12px">
      <button class="btn" :disabled="busy" @click="pay">{{ t('recharge.pay') }}</button>
    </div>
  </div>
</template>

<style scoped>
.bal { margin: 12px; padding: 16px; display: flex; flex-direction: column; gap: 4px; align-items: center; }
.price.big { font-size: 26px; }
.grid { padding: 0 12px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.opt { padding: 18px 0; text-align: center; border: 2px solid transparent; }
.opt.on { border-color: var(--brand); }
</style>
