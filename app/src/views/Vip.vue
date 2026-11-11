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
const tiers = ref([]);
const busy = ref(0);

onMounted(async () => { tiers.value = (await api.vipTiers()).list; await auth.refresh(); });

async function buy(tier) {
  busy.value = tier.id;
  try {
    const data = await api.vipBuy(tier.id);
    auth.user = { ...auth.user, balance: data.balance, vip: data.vip };
    toast(tier.name + ' VIP ✓');
  } catch (e) { toast(e.message); }
  finally { busy.value = 0; }
}
</script>

<template>
  <div class="page">
    <NavBar :title="t('vip.title')" />
    <div v-if="auth.user?.vip" class="active card">
      {{ t('vip.active', { name: auth.user.vip.name }) }}
    </div>
    <div class="list">
      <div v-for="tier in tiers" :key="tier.id" class="vcard card" :style="{ borderColor: tier.color }">
        <div class="vtop">
          <span class="vname" :style="{ color: tier.color }">{{ tier.name }}</span>
          <span class="price">₹{{ tier.price }}<small>/{{ tier.days }}d</small></span>
        </div>
        <ul class="perks">
          <li>{{ t('vip.daily', { n: tier.dailyBonus }) }}</li>
          <li>{{ t('vip.rebate', { n: tier.rebate }) }}</li>
        </ul>
        <button class="btn" :disabled="busy === tier.id" @click="buy(tier)">{{ t('vip.buy') }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.active { margin: 12px; padding: 14px; text-align: center; font-weight: 600; color: var(--brand-dark); }
.list { padding: 12px; display: flex; flex-direction: column; gap: 12px; }
.vcard { padding: 16px; border: 2px solid; display: flex; flex-direction: column; gap: 10px; }
.vtop { display: flex; justify-content: space-between; align-items: baseline; }
.vname { font-size: 20px; font-weight: 800; }
.price small { font-size: 12px; font-weight: 400; }
.perks { margin: 0; padding-left: 18px; color: var(--ink); font-size: 14px; line-height: 1.7; }
</style>
