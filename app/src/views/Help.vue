<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';

const { t } = useI18n();
const list = ref([]);
const open = ref(-1);

onMounted(async () => { list.value = (await api.help()).list; });
</script>

<template>
  <div class="page">
    <NavBar :title="t('account.help')" />
    <div class="list">
      <div v-for="(f, i) in list" :key="f.id" class="card faq" @click="open = open === i ? -1 : i">
        <div class="q">
          <span>{{ f.q }}</span>
          <span class="chev" :class="{ open: open === i }">›</span>
        </div>
        <div v-if="open === i" class="a muted">{{ f.a }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.faq { padding: 14px 16px; }
.q { display: flex; align-items: center; justify-content: space-between; font-weight: 600; font-size: 14px; }
.chev { transition: transform 0.2s; color: var(--muted); font-size: 20px; }
.chev.open { transform: rotate(90deg); }
.a { margin-top: 10px; font-size: 13px; line-height: 1.6; }
</style>
