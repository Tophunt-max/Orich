<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useAuth } from '../stores/auth';
import { useToast } from '../components/useToast';

const route = useRoute();
const router = useRouter();
const auth = useAuth();
const { toast } = useToast();
const { t } = useI18n({
  useScope: 'local',
  messages: {
    en: {
      navTitle: 'Payment',
      amountPayable: 'Amount payable',
      payWith: 'Pay with',
      paymentGateway: 'Payment gateway',
      payNow: 'Pay now',
      note: 'You will be redirected after the payment is confirmed.',
      paymentSuccessful: 'Payment successful',
    },
    hi: {
      navTitle: 'भुगतान',
      amountPayable: 'देय राशि',
      payWith: 'इससे भुगतान करें',
      paymentGateway: 'भुगतान गेटवे',
      payNow: 'अभी भुगतान करें',
      note: 'भुगतान की पुष्टि होने के बाद आपको रीडायरेक्ट किया जाएगा।',
      paymentSuccessful: 'भुगतान सफल',
    },
  },
});
const amount = ref(route.query.amount || '0.00');
const channelLabel = { upi: 'UPI', xpay: 'XPay', paytm: 'Paytm' };
const channel = ref(route.query.channel || 'upi');
const busy = ref(false);

async function pay() {
  busy.value = true;
  try {
    // For a recharge, the gateway confirmation credits the wallet via addrechargepay2.
    if (route.query.type === 'recharge') {
      const amt = Number(route.query.amount) || 0;
      const data = await api.recharge(amt, channel.value);
      api.track('recharge', { amount: amt, channel: channel.value });
      if (auth.user) auth.user = { ...auth.user, balance: data.balance };
    }
    await api.payStatus(route.query.o || route.query.order || 0);
    toast(t('paymentSuccessful'));
    setTimeout(() => router.replace('/success?type=' + (route.query.type || '')), 600);
  } catch (e) { toast(e.message); busy.value = false; }
}
</script>

<!-- Faithful rebuild of the real pages/payform/payform (.form) placeholder + scoped CSS.
     The real page embeds a payment-gateway webview; here we simulate the gateway. -->
<template>
  <div>
    <NavBar :title="t('navTitle')" />
    <div class="form">
      <div class="pay_amount_label">{{ t('amountPayable') }}</div>
      <div class="pay_amount">₹{{ amount }}</div>
      <div class="pay_method">
        <span>{{ t('payWith') }}</span>
        <span class="pay_method_val">{{ channelLabel[channel] || t('paymentGateway') }}</span>
      </div>
      <button class="pay_btn" :disabled="busy" @click="pay">{{ t('payNow') }}</button>
      <div class="pay_note">{{ t('note') }}</div>
    </div>
  </div>
</template>

<style scoped>
.form { padding-top: 40px; text-align: center; }
.pay_amount_label { font-size: 14px; color: #b9b9b9; }
.pay_amount { margin-top: 10px; font-size: 36px; font-weight: 800; color: #ee5016; }
.pay_method { display: flex; align-items: center; justify-content: space-between; margin: 34px 16px 0; padding: 14px 16px; background: #fff; border-radius: 10px; font-size: 15px; color: #17273a; }
.pay_method_val { color: #b9b9b9; }
.pay_btn { display: block; width: calc(100% - 32px); margin: 30px 16px 0; height: 48px; border-radius: 24px; background: #ee5016; color: #fff; font-size: 16px; font-weight: 700; }
.pay_btn:disabled { opacity: 0.6; }
.pay_note { margin-top: 16px; font-size: 12px; color: #b9b9b9; padding: 0 24px; }
</style>
