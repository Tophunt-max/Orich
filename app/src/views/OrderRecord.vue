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

function statusClass(s) {
  return { ongoing: 's_wait', success: 's_green', active: 's_num', rewarded: 's_green', entered: 's_num' }[s] || 's_num';
}
</script>

<!-- Faithful rebuild of the real pages/order/record (.order_item) rows + scoped CSS. -->
<template>
  <div class="order">
    <NavBar :title="t('order.title')" />
    <div v-if="loading" class="empty">{{ t('common.loading') }}</div>
    <div v-else-if="!list.length" class="empty">
      <img src="/static/image/nodata.png" alt="" /><div>{{ t('common.empty') }}</div>
    </div>
    <div v-else class="list">
      <div v-for="o in list" :key="o.id" class="order_item">
        <div class="order_item_strip_ntr">{{ o.product || o.type }}</div>
        <div class="order_item_strip">
          <div class="order_item_strip_le">
            <span class="title">{{ t('order.amount') }}</span>
            <span class="content price">₹{{ o.amount }}</span>
          </div>
          <div :class="statusClass(o.status)">{{ o.status }}</div>
        </div>
        <div class="order_item_strip">
          <div class="order_item_strip_le">
            <span class="title">{{ t('order.date') }}</span>
            <span class="content">{{ o.date }}</span>
          </div>
          <span v-if="o.shares" class="order_item_strip_title">{{ o.shares }} {{ t('product.shares') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.order { width: 100%; min-height: 100vh; background: #f6f6f6; }
.list { padding-top: 8px; }
.order_item { margin-bottom: 8px; padding: 16px 14px 16px 25px; background-color: #fff; }
.order_item_strip { display: flex; align-items: center; justify-content: space-between; }
.order_item_strip_title { font-size: 13px; font-family: Roboto, Roboto-Medium; font-weight: 500; color: #919191; }
.order_item_strip_ntr { margin-bottom: 10px; font-size: 14px; font-family: Roboto, Roboto-Medium; font-weight: 500; color: #17273a; }
.order_item_strip_le { flex: 1; margin-bottom: 6px; display: flex; align-items: center; }
.title { flex-shrink: 0; min-width: 62px; font-size: 13px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #b9b9b9; }
.content { font-size: 13px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #17273a; margin-left: 10px; }
.price { margin-left: 10px; font-size: 16px; color: #ff5c5c; font-weight: 700; }
.s_green { color: #55e273; font-weight: 500; }
.s_red { color: #ff4343; font-weight: 500; }
.s_wait { color: #ee5016; font-weight: 500; }
.s_num { color: #649dff; font-weight: 500; }
.empty { text-align: center; color: #b9b9b9; padding: 60px 0; }
.empty img { width: 90px; margin: 0 auto 10px; opacity: 0.8; }
</style>
