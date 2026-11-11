<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import { useToast } from '../components/useToast';

const route = useRoute();
const router = useRouter();
const { toast } = useToast();
const amount = ref(route.query.amount || '0.00');
const busy = ref(false);

function pay() {
  busy.value = true;
  toast('Payment successful');
  setTimeout(() => router.replace('/success'), 600);
}
</script>

<!-- Faithful rebuild of the real pages/payform/payform (.form) placeholder + scoped CSS.
     The real page embeds a payment-gateway webview; here we simulate the gateway. -->
<template>
  <div>
    <NavBar title="Payment" />
    <div class="form">
      <div class="pay_amount_label">Amount payable</div>
      <div class="pay_amount">₹{{ amount }}</div>
      <div class="pay_method">
        <span>Pay with</span>
        <span class="pay_method_val">Payment gateway</span>
      </div>
      <button class="pay_btn" :disabled="busy" @click="pay">Pay now</button>
      <div class="pay_note">You will be redirected after the payment is confirmed.</div>
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
