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

onMounted(async () => { options.value = (await api.rechargeOptions()).options; await auth.refresh(); });
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

<!-- Faithful rebuild of the real pages/payment/recharge (.comfirm) + scoped CSS. -->
<template>
  <div class="comfirm">
    <NavBar :title="t('recharge.title')" />
    <div class="balance">{{ t('common.balance') }}: <b>₹{{ auth.user?.balance ?? '0.00' }}</b></div>

    <div class="comfirm-title"><span class="comfirm-op"></span>{{ t('recharge.choose') }}</div>
    <div class="comfirm_pay">
      <div v-for="o in options" :key="o" class="comfirm_pay_item" :class="{ active: amount === o && !custom }" @click="pick(o)">₹{{ o }}</div>
    </div>

    <div class="comfirm-title"><span class="comfirm-op"></span>{{ t('recharge.custom') }}</div>
    <div class="custom-wrap"><input class="custom-input" v-model="custom" type="number" min="1" placeholder="₹" @focus="amount = 0" /></div>

    <div class="btn">
      <button class="btn-buy" :disabled="busy" @click="pay">{{ t('recharge.pay') }}</button>
    </div>
  </div>
</template>

<style scoped>
.comfirm { position: relative; background: #fff; min-height: 100vh; padding-bottom: 80px; }
.balance { padding: 12px 15px 0; font-size: 13px; color: #17273a; }
.balance b { color: #ee5016; }
.comfirm-title { display: flex; align-items: center; margin: 15px; font-size: 16px; font-weight: 700; color: #17273a; }
.comfirm-op { width: 5px; height: 10px; margin-right: 5px; background: #ee5016; }
.comfirm_pay { display: flex; flex-wrap: wrap; padding: 0 15px; gap: 16px; }
.comfirm_pay_item { width: 104px; height: 39px; line-height: 39px; text-align: center; border: 0.5px solid hsla(0,0%,72.5%,.6); border-radius: 4.5px; color: #17273a; font-weight: 600; }
.comfirm_pay_item.active { background: #ee5016; border-color: #ee5016; color: #fff; }
.custom-wrap { padding: 0 15px; }
.custom-input { width: 100%; padding: 11px 14px; border: 1px solid #ececec; border-radius: 8px; font-size: 15px; outline: none; }
.btn { position: fixed; left: 50%; transform: translateX(-50%); bottom: 0; width: 100%; max-width: var(--maxw); padding: 10px 15px; background: #fff; border-top: 1px solid #f0f0f0; }
.btn-buy { width: 100%; height: 49px; border-radius: 25px; background: #ee5016; color: #fff; font-size: 16px; font-weight: 700; }
.btn-buy:disabled { opacity: 0.6; }
</style>
