<script setup>
import { onMounted, ref, computed } from 'vue';
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
      navTitle: 'Confirm Order',
      product: 'Product',
      walletBalance: 'Wallet balance',
      paymentMethod: 'Payment method',
      perShare: '/ share',
      payNow: 'Pay now',
      joined: 'Joined ✓',
    },
    hi: {
      navTitle: 'ऑर्डर की पुष्टि करें',
      product: 'उत्पाद',
      walletBalance: 'वॉलेट बैलेंस',
      paymentMethod: 'भुगतान का तरीका',
      perShare: '/ शेयर',
      payNow: 'अभी भुगतान करें',
      joined: 'शामिल हुए ✓',
    },
  },
});

const item = ref(null);
const shares = ref(Number(route.query.shares) || 1);
const busy = ref(false);
const cost = computed(() => (item.value ? (shares.value * item.value.price).toFixed(2) : '0'));

// Payment methods. The backend settles joins against the wallet balance, so UPI/Paytm
// are presentational options here — wire a real gateway later.
const pays = computed(() => [
  { key: 'wallet', name: t('walletBalance'), icon: '/static/image/account/bg_Wallet.png' },
  { key: 'upi', name: 'UPI', icon: '/static/image/goods/upi.png' },
  { key: 'paytm', name: 'Paytm', icon: '/static/image/goods/paytm.png' },
]);
const pay = ref('wallet');

onMounted(async () => { item.value = (await api.product(route.params.id)).item; await auth.refresh(); });

async function confirm() {
  busy.value = true;
  try {
    const d = await api.join(item.value.id, shares.value);
    auth.user = { ...auth.user, balance: d.balance };
    toast(t('joined'));
    router.replace('/success');
  } catch (e) { toast(e.message); } finally { busy.value = false; }
}
</script>

<!-- Faithful rebuild of the real pages/goods/comfirm: product summary, payment method
     list and the fixed bottom pay bar. -->
<template>
  <div class="comfirm" v-if="item">
    <NavBar :title="t('navTitle')" />

    <div class="detail">
      <div class="comfirm-title"><span class="comfirm-op"></span>{{ t('product') }}</div>
      <div class="goods">
        <img :src="item.cover" alt="" />
        <div class="goods-desc">
          <div class="goods-title">
            <div class="goods-title-text">{{ item.title }}</div>
            <div class="goods-num">x{{ shares }}</div>
          </div>
          <div class="goods-finance">
            <div class="price">{{ item.subtitle }}</div>
            <div class="interest">₹{{ item.price }} {{ t('perShare') }}</div>
          </div>
          <div class="goods-price">
            <div class="goods-price-old">₹{{ item.marketValue.toLocaleString('en-IN') }}</div>
            <div class="goods-price-new">₹{{ cost }}</div>
          </div>
        </div>
      </div>
    </div>

    <img class="c-divider" src="/static/image/goods/img_Dividingline.png" alt="" />

    <div class="pay">
      <div class="comfirm-title"><span class="comfirm-op"></span>{{ t('paymentMethod') }}</div>
      <div class="pay-list">
        <div v-for="p in pays" :key="p.key" class="pay-item" @click="pay = p.key">
          <img class="pay-icon" :src="p.icon" alt="" />
          <div class="pay-name">{{ p.name }}<template v-if="p.key === 'wallet'"> · ₹{{ auth.user?.balance ?? '0.00' }}</template></div>
          <div class="pay-radio" :class="{ 'pay-select': pay === p.key }"><span class="pay-op"></span></div>
        </div>
      </div>
    </div>

    <div class="btn">
      <div class="btn-buy">
        <div class="btn-price">
          <div class="btn-price-new">₹{{ cost }}</div>
          <div class="btn-price-old">₹{{ item.marketValue.toLocaleString('en-IN') }}</div>
        </div>
        <button class="btn-btn" :disabled="busy" @click="confirm">{{ t('payNow') }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comfirm { position: relative; background: #fff; min-height: 100vh; padding-bottom: 50px; }
.comfirm .comfirm-title { display: flex; align-items: center; justify-content: flex-start; margin: 15px 0; font-size: 16px; font-weight: 700; color: #17273a; }
.comfirm .comfirm-title .comfirm-op { width: 5px; height: 10px; margin-right: 5px; background: #ee5016; }
.comfirm .detail { padding: 0 15px; }
.comfirm .detail .goods { display: flex; align-items: flex-start; justify-content: center; }
.comfirm .detail .goods img { width: 90px; height: 90px; margin-right: 15px; border-radius: 4px; object-fit: cover; }
.comfirm .detail .goods .goods-desc { flex: 1; }
.comfirm .detail .goods .goods-desc .goods-title { display: flex; align-items: center; }
.comfirm .detail .goods .goods-desc .goods-title .goods-title-text { flex: 1; font-weight: 700; color: #17273a; }
.comfirm .detail .goods .goods-desc .goods-title .goods-num { margin-left: 15px; font-size: 14px; font-family: Roboto, Roboto-Regular; color: #b9b9b9; }
.comfirm .detail .goods .goods-desc .goods-finance { margin-top: 10px; font-family: Roboto, Roboto-Regular; font-weight: 400; font-size: 14px; }
.comfirm .detail .goods .goods-desc .goods-finance .price { color: #17273a; }
.comfirm .detail .goods .goods-desc .goods-finance .interest { margin-top: 8px; color: #ff5c5c; }
.comfirm .detail .goods .goods-desc .goods-price { display: flex; align-items: center; justify-content: flex-start; width: 100%; margin-top: 10px; }
.comfirm .detail .goods .goods-desc .goods-price .goods-price-old { margin-right: 15px; font-size: 14px; font-family: Roboto, Roboto-Regular; color: #b9b9b9; text-decoration: line-through; }
.comfirm .detail .goods .goods-desc .goods-price .goods-price-new { font-size: 16px; font-family: Roboto, Roboto-Bold; font-weight: 700; color: #ff5c5c; }
.comfirm .c-divider { width: calc(100% - 30px); margin: 23px 15px 0; }
.comfirm .pay { padding: 0 15px; }
.comfirm .pay .comfirm-title { margin: 5px 0; }
.comfirm .pay .pay-list .pay-item { display: flex; flex-direction: row; align-items: center; justify-content: center; width: 100%; margin: 10px 0; padding: 5px 0; cursor: pointer; }
.comfirm .pay .pay-list .pay-item .pay-icon { width: 71px; height: 34px; margin-right: 10px; object-fit: contain; }
.comfirm .pay .pay-list .pay-item .pay-name { flex: 1; font-size: 14px; font-family: Roboto, Roboto-Regular; color: #17273a; }
.comfirm .pay .pay-list .pay-item .pay-radio { display: flex; align-items: center; justify-content: center; width: 17px; height: 17px; border: 1px solid #b9b9b9; border-radius: 50%; }
.comfirm .pay .pay-list .pay-item .pay-radio .pay-op { width: 0; height: 0; }
.comfirm .pay .pay-list .pay-item .pay-select { border: 1px solid #ee5016; }
.comfirm .pay .pay-list .pay-item .pay-select .pay-op { width: 9px; height: 9px; background: #ee5016; border-radius: 50%; }
.comfirm .btn { display: flex; flex-direction: row; align-items: center; justify-content: center; position: fixed; left: 50%; transform: translateX(-50%); bottom: 0; width: 100%; max-width: var(--maxw); height: 49px; background: #fff; box-shadow: 0px 2px 12px 0px rgba(0,0,0,.1); }
.comfirm .btn .btn-buy { display: flex; flex-direction: row; align-items: center; justify-content: center; width: 100%; height: 100%; margin: 0 15px; }
.comfirm .btn .btn-buy .btn-price { flex: 1; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; padding-left: 15px; }
.comfirm .btn .btn-buy .btn-price .btn-price-new { font-size: 24px; font-weight: 700; color: #ff5c5c; }
.comfirm .btn .btn-buy .btn-price .btn-price-old { text-decoration: line-through; font-size: 14px; color: #b9b9b9; }
.comfirm .btn .btn-buy .btn-btn { width: 141.5px; height: 39px; border-radius: 20px; background: linear-gradient(115deg, #ffe44b, #fea326); color: #ad6701; font-size: 16px; font-weight: 700; }
.comfirm .btn .btn-buy .btn-btn:disabled { opacity: .6; }
</style>
