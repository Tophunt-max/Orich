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

<!-- Faithful rebuild of the real pages/finance/fdetail (.fdetail header + card). -->
<template>
  <div class="fdetail" v-if="item">
    <div class="fdetail_bg"><header class="fnav">{{ item.name }}</header>
      <div class="fdetail_info">
        <div class="fdetail_info_dd">
          <div class="fdetail_info_dd_title">{{ item.name }}</div>
          <div class="fdetail_info_dd_strip">{{ item.rate }}%<span>/{{ t('finance.day') }}</span> · {{ item.days }}d</div>
        </div>
      </div>
    </div>

    <div class="fdetail_card">
      <div class="fdetail_card_item"><span class="k">{{ t('finance.rate') }}</span><span class="price">{{ item.rate }}%</span></div>
      <div class="fdetail_card_item"><span class="k">{{ t('finance.days') }}</span><span class="v">{{ item.days }} days</span></div>
      <div class="fdetail_card_item"><span class="k">{{ t('finance.min') }}</span><span class="v">₹{{ item.min }}</span></div>
      <div class="fdetail_card_item"><span class="k">Max</span><span class="v">₹{{ item.max }}</span></div>
      <div class="fdetail_card_item"><span class="k gray">{{ item.desc }}</span></div>
    </div>

    <div class="form">
      <div class="form-label">{{ t('finance.amount') }} (₹)</div>
      <input class="form-input" v-model="amount" type="number" :min="item.min" :max="item.max" />
      <div class="proj"><span>{{ t('finance.projected') }}</span><span class="price">₹{{ projected }}</span></div>
      <button class="fbtn" :disabled="busy" @click="invest">{{ t('finance.confirm') }}</button>
    </div>
  </div>
</template>

<style scoped>
.fdetail { min-height: 100vh; background: #f9f9f9; padding-bottom: 30px; }
.fdetail_bg { background: linear-gradient(160deg, #ff7a45, #ee5016); padding-bottom: 40px; }
.fnav { height: 44px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; font-weight: 700; }
.fdetail_info { padding: 6px 15px 0; }
.fdetail_info_dd_title { font-size: 20px; font-weight: 700; color: #fff; }
.fdetail_info_dd_strip { font-size: 15px; color: #ffe2db; margin-top: 6px; font-weight: 700; }
.fdetail_card { margin: -28px 11px 0; background: #fff; border-radius: 8px; padding: 18px; }
.fdetail_card_item { display: flex; align-items: center; justify-content: space-between; font-size: 14px; }
.fdetail_card_item + .fdetail_card_item { margin-top: 15px; }
.fdetail_card_item .k { color: #b9b9b9; }
.fdetail_card_item .v { color: #17273a; }
.fdetail_card_item .price { color: #ff5c5c; font-weight: 700; }
.fdetail_card_item .gray { color: #b9b9b9; font-size: 13px; line-height: 1.6; }
.form { margin: 12px 11px 0; background: #fff; border-radius: 8px; padding: 16px; }
.form-label { font-size: 13px; color: #b9b9b9; margin-bottom: 8px; }
.form-input { width: 100%; padding: 11px 14px; border: 1px solid #ececec; border-radius: 8px; font-size: 16px; outline: none; }
.proj { display: flex; justify-content: space-between; align-items: center; margin: 16px 0; font-size: 15px; }
.proj .price { color: #ff5c5c; font-weight: 700; }
.fbtn { width: 100%; height: 46px; border-radius: 23px; background: #ee5016; color: #fff; font-size: 16px; font-weight: 700; }
.fbtn:disabled { opacity: 0.6; }
</style>
