<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useAuth } from '../stores/auth';
import { useToast } from '../components/useToast';

const { t } = useI18n();
const router = useRouter();
const auth = useAuth();
const { toast } = useToast();
const options = ref([]);
const amount = ref(0);
const custom = ref('');
const busy = ref(false);

// Payment channels now come from the backend (api.rechargeOptions().channels);
// the recharge API only accepts an amount, so the selection itself is not sent.
const channels = ref([]);
const channel = ref('');

onMounted(async () => {
  const data = await api.rechargeOptions();
  options.value = data.options || [];
  channels.value = data.channels || [];
  channel.value = channels.value[0]?.key ?? '';
  await auth.refresh();
});
function pick(v) { amount.value = v; custom.value = ''; }

async function pay() {
  const value = Number(custom.value) || amount.value;
  if (!value || value < 1) return toast(t('recharge.choose'));
  busy.value = true;
  try {
    const data = await api.recharge(value);
    api.track('recharge', { amount: value });
    auth.user = { ...auth.user, balance: data.balance };
    toast(t('recharge.success') + ' · ₹' + data.balance);
    amount.value = 0; custom.value = '';
  } catch (e) { toast(e.message); }
  finally { busy.value = false; }
}
</script>

<!-- Faithful rebuild of the real pages/payment/recharge (.comfirm) + scoped CSS:
     amount grid, custom input, payment-channel selection, tips, balance header, button. -->
<template>
  <div class="comfirm">
    <NavBar :title="t('recharge.title')" right="Records" @right="router.push('/payrecord')" />
    <div class="balance">{{ t('common.balance') }}: <b>₹{{ auth.user?.balance ?? '0.00' }}</b></div>

    <div class="pad">
      <div class="comfirm-title"><span class="comfirm-op"></span>{{ t('recharge.choose') }}</div>
      <div class="comfirm_pay">
        <div v-for="o in options" :key="o" class="comfirm_pay_item" :class="{ active: amount === o && !custom }" @click="pick(o)">₹{{ o }}</div>
      </div>

      <div class="comfirm-title"><span class="comfirm-op"></span>{{ t('recharge.custom') }}</div>
      <div class="custom-wrap"><input class="custom-input" v-model="custom" type="number" min="1" placeholder="₹" @focus="amount = 0" /></div>

      <!-- payment channel selection -->
      <div class="comfirm-title"><span class="comfirm-op"></span>Payment method</div>
      <div class="pay">
        <div class="pay-list">
          <div v-for="c in channels" :key="c.key" class="pay-item" @click="channel = c.key">
            <img class="pay-icon" :src="c.icon" :alt="c.name" />
            <div class="pay-name">{{ c.name }}</div>
            <div class="pay-radio" :class="{ 'pay-select': channel === c.key }"><div class="pay-op"></div></div>
          </div>
        </div>
      </div>

      <div class="pay-tips">Recharge is credited to your balance instantly after the payment is confirmed.</div>
      <div class="comfirm-tips">If the amount is not credited within 10 minutes, contact support with your payment reference.</div>
    </div>

    <div class="btn-bar">
      <button class="btn-buy" :disabled="busy" @click="pay">{{ t('recharge.pay') }}</button>
    </div>
  </div>
</template>

<style scoped>
.comfirm { position: relative; background: #fff; min-height: 100vh; padding-bottom: 80px; }
.balance { padding: 12px 15px 0; font-size: 13px; color: #17273a; }
.balance b { color: #ee5016; }
.pad { padding: 0 15px; }
.comfirm-title { display: flex; align-items: center; justify-content: flex-start; margin: 15px 0; font-size: 16px; font-weight: 700; color: #17273a; }
.comfirm-op { width: 5px; height: 10px; margin-right: 5px; background: #ee5016; }
.comfirm_pay { margin-top: 12px; display: flex; align-items: center; flex-wrap: wrap; gap: 16px; }
.comfirm_pay_item { width: 104px; height: 39px; line-height: 39px; text-align: center; border: 0.5px solid hsla(0,0%,72.5%,.6); border-radius: 4.5px; position: relative; color: #17273a; font-weight: 600; }
.comfirm_pay_item.active { background: #ee5016; border: 0.5px solid #ee5016; color: #fff; }
.custom-wrap { padding: 0; }
.custom-input { width: 100%; padding: 11px 14px; border: 1px solid #ececec; border-radius: 8px; font-size: 15px; outline: none; }

/* payment channel selection */
.pay .pay-list .pay-item { display: flex; flex-direction: row; align-items: center; justify-content: center; width: 100%; margin: 10px 0; padding: 5px 0; }
.pay .pay-list .pay-item .pay-icon { width: 71px; height: 34px; margin-right: 10px; object-fit: contain; }
.pay .pay-list .pay-item .pay-name { flex: 1; font-size: 14px; font-family: Roboto, Roboto-Regular; color: #17273a; }
.pay .pay-list .pay-item .pay-radio { display: flex; flex-direction: row; align-items: center; justify-content: center; width: 17px; height: 17px; border: 1px solid #b9b9b9; border-radius: 50%; }
.pay .pay-list .pay-item .pay-radio .pay-op { width: 0; height: 0; }
.pay .pay-list .pay-item .pay-select { border: 1px solid #ee5016; }
.pay .pay-list .pay-item .pay-select .pay-op { width: 9px; height: 9px; background: #ee5016; border-radius: 50%; }

.pay-tips { margin-top: 15px; text-align: center; font-size: 13px; color: grey; }
.comfirm-tips { width: 100%; margin-top: 10px; text-align: left; font-size: 13px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #17273a; }

.btn-bar { position: fixed; left: 50%; transform: translateX(-50%); bottom: 0; width: 100%; max-width: var(--maxw); padding: 10px 15px; background: #fff; border-top: 1px solid #f0f0f0; }
.btn-buy { width: 100%; height: 49px; border-radius: 25px; background: #ee5016; color: #fff; font-size: 16px; font-weight: 700; }
.btn-buy:disabled { opacity: 0.6; }
</style>
