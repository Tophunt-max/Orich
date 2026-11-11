<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Data-light: read optional details from the route query.
const title = computed(() => route.query.title || route.query.product || 'Your order');
const orderNo = computed(() => route.query.order || route.query.id || '');
const amount = computed(() => route.query.amount || '');
const time = computed(() => route.query.time || new Date().toLocaleString());

// Finance purchases pass type=finance plus start/maturity dates to show the term card.
const isFinance = computed(() => route.query.type === 'finance' || !!route.query.start || !!route.query.end);
const startTime = computed(() => route.query.start || '');
const endTime = computed(() => route.query.end || '');

const steps = [
  'Add our official WhatsApp number to receive your order updates.',
  'Send your order number in the chat to confirm your entry.',
  'Our team will share winner announcements and delivery details.',
];
</script>

<!-- Faithful rebuild of the real pages/success/index payment-success layout + scoped CSS. -->
<template>
  <div class="success">
    <div class="top">
      <img class="top-img" src="/static/image/bask/img_Successful.png" alt="" />
      <div class="top-tips">Payment successful! Your order has been placed.</div>

      <div v-if="isFinance" class="finance-tips">
        <div class="finance-tips-dot">
          <span class="icon"></span>
          <span class="line"></span>
          <span class="icon"></span>
        </div>
        <div class="finance-tips-main">
          <div class="start">
            <div>Start</div>
            <div class="time"><span>{{ startTime || '—' }}</span></div>
          </div>
          <div class="end">
            <div>Maturity</div>
            <div class="time"><span>{{ endTime || '—' }}</span></div>
          </div>
        </div>
      </div>

      <div class="top-btn">
        <button class="big-btn" style="height:39px;margin:0;width:143px" @click="router.replace('/home')">Home</button>
        <button class="big-btn" style="height:39px;margin:0;width:143px;background:#fff;color:#ee5016;border:1px solid #ee5016" @click="router.replace('/account')">My orders</button>
      </div>
    </div>

    <div class="goods">
      <div class="goods-title">{{ title }}</div>
      <div class="goods-num">
        Order No: {{ orderNo || '—' }}
        <span class="goods-view" @click="router.replace('/account')">View ›</span>
      </div>
      <div v-if="amount" class="goods-time">Amount: ₹{{ amount }}</div>
      <div class="goods-time">Time: {{ time }}</div>
    </div>

    <div class="bottom">
      <div class="gift">
        <img src="/static/image/bask/img_Gift.png" alt="" />
        <div class="gift-text">Join our WhatsApp group to track your order and claim rewards</div>
      </div>

      <div class="step">
        <div v-for="(s, i) in steps" :key="i" class="step-item" style="margin-bottom:16px">
          <div class="step-num">{{ i + 1 }}</div>
          <div class="step-text">{{ s }}</div>
        </div>
      </div>

      <div class="whatsapp">
        <div class="whatsapp_img"><img src="/static/image/bask/img_whatsapp.png" alt="" /></div>
        <div class="whatsapp_text">Join WhatsApp</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.success { min-height: 100vh; width: 100%; background-color: #f9f9f9; }
.top { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 0 5px; background-color: #fff; margin-bottom: 12px; }
.top .top-img { height: 190px; }
.top .top-tips { width: 265px; margin-top: 0px; text-align: center; font-size: 14px; font-family: Roboto, Roboto-Regular; color: #ee5016; }
.top .finance-tips { margin-top: 15px; display: flex; align-items: center; justify-content: center; flex-direction: column; width: 332px; height: 113px; background: #fff; border-radius: 8px; box-shadow: 0 0 11px 0 rgba(0,0,0,.05); }
.top .finance-tips .finance-tips-dot { display: flex; align-items: center; justify-content: center; }
.top .finance-tips .finance-tips-dot .icon { width: 12px; height: 12px; background: #ee5016; border-radius: 50%; }
.top .finance-tips .finance-tips-dot .line { width: 150px; border-top: 1px dashed #ee5016; opacity: .3; margin: 0 4px; }
.top .finance-tips .finance-tips-main { margin-top: 10px; display: flex; align-items: flex-start; justify-content: space-between; width: 174px; font-size: 13px; font-weight: 500; text-align: center; color: #b9b9b9; letter-spacing: 0px; }
.top .finance-tips .finance-tips-main span { color: #ee5016; }
.top .finance-tips .finance-tips-main .time { margin-top: 5px; }
.top .finance-tips .finance-tips-main .start { margin-right: 15px; }
.top .top-btn { display: flex; flex-direction: row; align-items: center; justify-content: space-around; width: 100%; padding: 0 5px; margin-top: 21px; margin-bottom: 18px; }
.top .top-btn .top-btn-item { width: 143px; height: 39px; }

.goods { width: 100%; padding: 18px 16px; background-color: #fff; margin-bottom: 12px; }
.goods .goods-title { font-size: 16px; font-family: PingFang SC, PingFang SC-Bold; font-weight: 700; color: #17273a; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.goods .goods-num { margin-top: 10px; word-break: break-all; font-size: 13px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #b9b9b9; line-height: 18px; position: relative; }
.goods .goods-view { font-size: 13px; font-weight: 400; color: #58a5ff; position: absolute; right: 0; }
.goods .goods-time { margin-top: 5px; font-size: 13px; font-family: Roboto, Roboto-Regular; font-weight: 400; text-align: left; color: #b9b9b9; }

.bottom { position: relative; width: 100%; padding: 21px 16px; background-color: #fff; }
.bottom .gift { display: flex; flex-direction: row; align-items: flex-start; justify-content: center; padding: 0 13px; }
.bottom .gift img { width: 40px; margin-right: 22px; }
.bottom .gift .gift-text { flex: 1; margin: 0 5px; text-align: center; font-size: 16px; font-family: Roboto, Roboto-Medium; font-weight: 700; line-height: 18px; color: #ee5016; }
.bottom .step { position: relative; width: 100%; margin-top: 30px; }
.bottom .step .step-item { display: flex; flex-direction: row; align-items: center; justify-content: center; width: 100%; padding-right: 52px; }
.bottom .step .step-num { display: flex; flex-direction: row; align-items: center; justify-content: center; width: 32px; height: 32px; margin-right: 12px; opacity: 1; background: #fff2e2; border-radius: 50%; font-size: 18px; font-family: Roboto, Roboto-Medium; font-weight: 700; text-align: center; color: #ff881a; flex-shrink: 0; }
.bottom .step .step-text { flex: 1; font-size: 14px; line-height: 16px; font-family: Roboto, Roboto-Regular; font-weight: 400; text-align: left; color: #b9b9b9; }

.whatsapp { margin-top: 43px; display: flex; align-items: center; justify-content: center; width: 201px; height: 58px; background: #f0fff2; border-radius: 10px; box-shadow: 0px -3px 4px 0px rgba(48,171,65,.2) inset; margin-left: 50%; transform: translateX(-50%); }
.whatsapp .whatsapp_img { width: 33px; height: 33px; }
.whatsapp .whatsapp_img img { width: 100%; height: 100%; object-fit: contain; }
.whatsapp .whatsapp_text { margin-left: 7px; font-size: 18px; font-family: PingFang SC, PingFang SC-Bold; font-weight: 700; color: #55cd63; letter-spacing: 0px; }
</style>
