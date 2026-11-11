<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';

const router = useRouter();
const { t } = useI18n();
const list = ref([]);

onMounted(async () => { list.value = (await api.financeList()).list; });
</script>

<template>
  <div class="page">
    <NavBar :title="t('finance.title')" />
    <div class="list">
      <div v-for="f in list" :key="f.id" class="fcard card" @click="router.push('/finance/' + f.id)">
        <div class="ftop">
          <span class="fname">{{ f.name }}</span>
          <span class="rate">{{ f.rate }}%<small>/day</small></span>
        </div>
        <div class="muted small">{{ f.desc }}</div>
        <div class="fmeta">
          <span>{{ t('finance.days') }}: {{ f.days }}d</span>
          <span>{{ t('finance.min') }}: ₹{{ f.min }}</span>
          <button class="mini">{{ t('finance.invest') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.fcard { padding: 14px; display: flex; flex-direction: column; gap: 8px; }
.ftop { display: flex; justify-content: space-between; align-items: baseline; }
.fname { font-weight: 700; font-size: 16px; }
.rate { color: var(--brand-dark); font-weight: 700; font-size: 20px; }
.rate small { font-size: 12px; font-weight: 400; }
.small { font-size: 12px; }
.fmeta { display: flex; align-items: center; gap: 14px; font-size: 13px; color: var(--muted); }
.mini { margin-left: auto; background: var(--brand); color: #fff; padding: 6px 16px; border-radius: 16px; font-weight: 600; }
</style>
