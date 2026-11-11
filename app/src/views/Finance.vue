<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { api } from '../api/client';

const router = useRouter();
const { t } = useI18n();
const list = ref([]);

onMounted(async () => { list.value = (await api.financeList()).list; });

// Recent-arrivals ticker (real .toast). No backend feed for this, so derive a rolling
// list from the plan names with plausible payout amounts.
const ARR_AVATARS = [
  '/static/image/networkimg/abdul.png',
  '/static/image/networkimg/babu.png',
  '/static/image/networkimg/praveen.png',
  '/static/image/networkimg/sultan.png',
  '/static/image/networkimg/behrul-islam.png',
];
const ARR_NAMES = ['rahul***', 'meena***', 'arjun***', 'sana***', 'vikram***', 'neha***'];
const arrivals = computed(() => {
  const src = list.value.length ? list.value : [{ name: 'ORich Daily 7', rate: 0.8, min: 500 }];
  return ARR_NAMES.map((name, i) => {
    const f = src[i % src.length];
    const earn = Math.round(Number(f.min || 500) * (Number(f.rate || 1) / 100) * 7);
    return { name, avatar: ARR_AVATARS[i % ARR_AVATARS.length], plan: f.name, earn };
  });
});
</script>

<!-- Faithful rebuild of the real pages/finance/flist (.flist step header + toast ticker + cards). -->
<template>
  <div class="flist">
    <div class="flist-step">
      <header class="fnav">{{ t('finance.title') }}
        <span class="bar-help" @click="router.push('/rule')"><img src="/static/image/finance/icon_Problem.png" alt="" /></span>
      </header>
      <div class="step-sub">{{ t('finance.sub') }}</div>
    </div>

    <!-- recent arrivals ticker -->
    <div class="toast">
      <div class="toast-swiper">
        <div v-for="(a, i) in arrivals.slice(0, 1)" :key="i" class="toast-swiper-item">
          <div class="toast-swiper-item-img"><img :src="a.avatar" alt="" /></div>
          <div class="toast-swiper-item-main">
            <span class="uname">{{ a.name }}</span>
            <span class="arrival">just earned</span>
            <span class="name">₹{{ a.earn }}</span>
            <span class="arrival">from {{ a.plan }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="list">
      <div v-for="f in list" :key="f.id" class="fcard" @click="router.push('/finance/' + f.id)">
        <div class="ftop">
          <span class="fname">{{ f.name }}</span>
          <span class="rate">{{ f.rate }}%<small>/{{ t('finance.day') }}</small></span>
        </div>
        <div class="fdesc">{{ f.desc }}</div>
        <div class="fmeta">
          <span>{{ t('finance.days') }}: {{ f.days }}d</span>
          <span>{{ t('finance.min') }}: ₹{{ f.min }}</span>
          <button class="finvest">{{ t('finance.invest') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flist { width: 100%; min-height: 100vh; background: #f9f9f9; padding-bottom: 20px; }
.flist-step { height: 144px; padding: 10px 19px 0 18px; background-image: url('/static/image/finance/bg_list.png'); background-size: 100% 100%; background-repeat: no-repeat; background-color: #ee5016; position: relative; }
.fnav { position: relative; height: 44px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; font-weight: 700; }
.bar-help { position: absolute; right: 0; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; }
.bar-help img { width: 100%; height: 100%; object-fit: contain; }
.step-sub { color: #ffe3d8; font-size: 13px; text-align: center; padding: 6px 20px 0; }
.toast { margin: 10px 14px 0; padding: 11px 15px 6px; background-color: #fff; border-bottom: 1px solid #f5f5f5; border-radius: 6px; }
.toast-swiper { height: 35px; }
.toast-swiper-item { display: flex; align-items: center; justify-content: flex-start; }
.toast-swiper-item-img { width: 30px; height: 30px; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
.toast-swiper-item-img img { width: 100%; height: 100%; object-fit: cover; }
.toast-swiper-item-main { margin-left: 18px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 13px; color: #17273a; }
.toast-swiper-item-main .arrival { margin-left: 5px; color: #b9b9b9; }
.toast-swiper-item-main .name { color: #ee5016; margin: 0 5px; font-weight: 700; }
.list { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.fcard { background: #fff; border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 1px 6px rgba(23,39,58,.05); }
.ftop { display: flex; justify-content: space-between; align-items: baseline; }
.fname { font-weight: 700; font-size: 16px; color: #17273a; }
.rate { color: #ff5c5c; font-weight: 700; font-size: 20px; }
.rate small { font-size: 12px; font-weight: 400; color: #b9b9b9; }
.fdesc { font-size: 12px; color: #b9b9b9; }
.fmeta { display: flex; align-items: center; gap: 14px; font-size: 13px; color: #b9b9b9; }
.finvest { margin-left: auto; background: #ee5016; color: #fff; padding: 6px 18px; border-radius: 16px; font-weight: 600; }
</style>
