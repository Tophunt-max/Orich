<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useToast } from '../components/useToast';

const router = useRouter();
const { toast } = useToast();
const banks = ref([]);

async function load() {
  try { banks.value = (await api.bankList()).list || []; } catch (e) { toast(e.message); }
}
onMounted(load);

async function del(id) {
  try { await api.bankDel(id); toast('Removed'); load(); } catch (e) { toast(e.message); }
}

function last4(n) { return String(n || '').slice(-4).padStart(4, '•'); }
</script>

<!-- Faithful rebuild of the real pages/payment/payment (.payment) + scoped CSS. -->
<template>
  <div class="payment">
    <NavBar title="Payment Methods" />

    <div v-if="!banks.length" class="empty2">
      <img src="/static/image/nodata.png" alt="" />
      <div>No payment method yet</div>
    </div>

    <div class="payment_main">
      <div v-for="b in banks" :key="b.id" class="payment_card">
        <div class="payment_card_top">
          <div class="payment_card_top_img">
            <img src="/static/image/pay/icon_identification.png" alt="" />
          </div>
          <div class="payment_card_top_name">{{ b.type || 'Bank' }}</div>
          <span class="card_del" @click="del(b.id)">Delete</span>
        </div>
        <div class="payment_card_number">
          <div class="payment_card_number_circular"></div>
          <div class="payment_card_number_circular"></div>
          <div class="payment_card_number_circular"></div>
          <div class="payment_card_number_circular"></div>
          <div class="payment_card_number_circular"></div>
          <div class="payment_card_number_circular"></div>
          <div class="payment_card_number_circular"></div>
          <div class="payment_card_number_circular"></div>
          <div class="payment_card_number_item">{{ last4(b.number) }}</div>
          <div class="card_holder">{{ b.holder }}</div>
        </div>
      </div>
    </div>

    <button class="payment_add" @click="router.push('/payment/add')">+ Add payment method</button>
  </div>
</template>

<style scoped>
.payment { min-height: 100vh; background: #f8f8f8; padding-bottom: 90px; }
.payment .nav_right { position: absolute; right: 10px; }
.payment .img { width: 100%; }
.payment .payment_top { padding-left: 19px; padding-bottom: 10px; margin-top: 56px; background: #fff; border-bottom: 0.50px solid #f8f8f8; }
.payment .payment_top .payment_top_title { display: inline-block; margin-left: 119px; font-size: 16px; font-family: Roboto, Roboto-Bold; font-weight: 700; color: #000; }
.payment .payment_main { margin-left: 1px; padding: 15px 12.50px 0 17px; }
.payment .payment_main .payment_card { width: 343px; height: 110px; margin-bottom: 8px; border-radius: 8px; }
.payment .payment_main .payment_card:nth-child(odd) { background: linear-gradient(75deg, #8cdcff, #10c7ff); }
.payment .payment_main .payment_card:nth-child(even) { background: linear-gradient(82deg, #f76955, #ffb44e); }
.payment .payment_main .payment_card .payment_card_top { padding: 15px 0 0 20px; display: flex; align-items: center; }
.payment .payment_main .payment_card .payment_card_top .payment_card_top_img { width: 37px; height: 37px; border-radius: 50%; overflow: hidden; }
.payment .payment_main .payment_card .payment_card_top .payment_card_top_img img { width: 100%; height: 100%; object-fit: cover; }
.payment .payment_main .payment_card .payment_card_top .payment_card_top_name { color: #fff; margin-left: 10px; font-size: 20px; }
.payment .payment_main .payment_card .payment_card_top .card_del { margin-left: auto; margin-right: 15px; color: #fff; font-size: 13px; opacity: 0.9; }
.payment .payment_main .payment_card .payment_card_number { display: flex; align-items: center; margin-left: 34.50px; margin-top: 19px; }
.payment .payment_main .payment_card .payment_card_number .payment_card_number_circular { width: 9px; height: 9px; opacity: .5; background: #fff; border-radius: 50%; margin-right: 6px; }
.payment .payment_main .payment_card .payment_card_number .payment_card_number_circular:nth-child(4n) { margin-right: 20px; }
.payment .payment_main .payment_card .payment_card_number .payment_card_number_item { font-size: 20px; font-family: Roboto, Roboto-Medium; font-weight: 700; color: #fff; letter-spacing: 0px; }
.payment .payment_main .payment_card .payment_card_number .card_holder { margin-left: 14px; color: #fff; font-size: 13px; opacity: 0.9; }
.payment .payment_add { width: 300px; height: 45px; border-radius: 4px; position: fixed; left: 50%; transform: translateX(-50%); bottom: 20px; background: #ee5016; color: #fff; font-size: 16px; font-weight: 700; }
</style>
