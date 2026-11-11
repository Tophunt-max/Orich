<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';

const { t } = useI18n();
const list = ref([]);
const loading = ref(true);

onMounted(async () => {
  try { list.value = (await api.orders()).list; } finally { loading.value = false; }
});
</script>

<template>
  <div class="page">
    <NavBar :title="t('order.title')" />
    <div v-if="loading" class="empty">{{ t('common.loading') }}</div>
    <div v-else-if="!list.length" class="empty">
      <img src="/static/image/nodata.png" alt="" />
      <div>{{ t('common.empty') }}</div>
    </div>
    <div v-else class="list">
      <div v-for="o in list" :key="o.id" class="orow card">
        <div class="otop">
          <span class="oname">{{ o.product }}</span>
          <span class="badge">{{ o.status }}</span>
        </div>
        <div class="muted small">{{ o.shares }} {{ t('product.shares') }} · {{ o.date }}</div>
        <div class="price">₹{{ o.amount }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.orow { padding: 14px; display: flex; flex-direction: column; gap: 6px; }
.otop { display: flex; justify-content: space-between; align-items: center; }
.oname { font-weight: 600; }
.small { font-size: 12px; }
</style>
