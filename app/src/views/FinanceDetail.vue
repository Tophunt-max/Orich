<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useAuth } from '../stores/auth';
import { useToast } from '../components/useToast';

const route = useRoute();
const { t } = useI18n();
const auth = useAuth();
const { toast } = useToast();
const item = ref(null);
const amount = ref('');
const busy = ref(false);

const projected = computed(() => {
  if (!item.value || !amount.value) return '0.00';
  return (Number(amount.value) * (item.value.rate / 100) * item.value.days).toFixed(2);
});

onMounted(async () => {
  item.value = (await api.finance(route.params.id)).item;
  amount.value = item.value.min;
  auth.refresh();
});

async function invest() {
  busy.value = true;
  try {
    const data = await api.financeBuy(item.value.id, Number(amount.value));
    auth.user = { ...auth.user, balance: data.balance };
    toast(t('finance.confirm') + ' ✓');
  } catch (e) { toast(e.message); }
  finally { busy.value = false; }
}
</script>

<template>
  <div class="page" v-if="item">
    <NavBar :title="item.name" />
    <div class="hero card">
      <div class="rate">{{ item.rate }}%<small>/day</small></div>
      <div class="muted">{{ t('finance.days') }}: {{ item.days }} days · {{ t('finance.min') }} ₹{{ item.min }}</div>
    </div>
    <div class="card desc">{{ item.desc }}</div>

    <div class="card form">
      <label>{{ t('finance.amount') }} (₹)</label>
      <input class="field" v-model="amount" type="number" :min="item.min" :max="item.max" />
      <div class="proj">
        <span class="muted">Projected return</span>
        <span class="price">₹{{ projected }}</span>
      </div>
      <button class="btn" :disabled="busy" @click="invest">{{ t('finance.confirm') }}</button>
    </div>
  </div>
</template>

<style scoped>
.hero { margin: 12px; padding: 20px; text-align: center; }
.rate { font-size: 34px; font-weight: 800; color: var(--brand-dark); }
.rate small { font-size: 14px; font-weight: 400; }
.desc { margin: 0 12px 12px; padding: 14px; font-size: 14px; line-height: 1.6; }
.form { margin: 0 12px; padding: 16px; }
.form label { display: block; font-size: 13px; color: var(--muted); margin-bottom: 8px; }
.proj { display: flex; justify-content: space-between; align-items: center; margin: 16px 0; font-size: 16px; }
</style>
