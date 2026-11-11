<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { api } from '../api/client';

const router = useRouter();
const { t } = useI18n();
const list = ref([]);

onMounted(async () => { list.value = (await api.financeList()).list; });
</script>

<!-- Faithful rebuild of the real pages/finance/flist (.flist step header + cards). -->
<template>
  <div class="flist">
    <div class="flist-step"><header class="fnav">{{ t('finance.title') }}</header>
      <div class="step-sub">{{ t('finance.sub') }}</div>
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
.flist-step { background: linear-gradient(160deg, #ee5016, #ff8a3d); padding-bottom: 20px; }
.fnav { height: 44px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; font-weight: 700; }
.step-sub { color: #ffe3d8; font-size: 13px; text-align: center; padding: 0 20px; }
.list { padding: 12px; display: flex; flex-direction: column; gap: 10px; margin-top: -8px; }
.fcard { background: #fff; border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 1px 6px rgba(23,39,58,.05); }
.ftop { display: flex; justify-content: space-between; align-items: baseline; }
.fname { font-weight: 700; font-size: 16px; color: #17273a; }
.rate { color: #ff5c5c; font-weight: 700; font-size: 20px; }
.rate small { font-size: 12px; font-weight: 400; color: #b9b9b9; }
.fdesc { font-size: 12px; color: #b9b9b9; }
.fmeta { display: flex; align-items: center; gap: 14px; font-size: 13px; color: #b9b9b9; }
.finvest { margin-left: auto; background: #ee5016; color: #fff; padding: 6px 18px; border-radius: 16px; font-weight: 600; }
</style>
