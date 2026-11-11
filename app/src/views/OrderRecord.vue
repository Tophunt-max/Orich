<script setup>
import { onMounted, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';

// Local scope adds the search key; global keys (order.*, common.*, product.*)
// still resolve via vue-i18n's fallback to the root scope.
const { t } = useI18n({ useScope: 'local', messages: {
  en: { searchPh: 'Search by product, order ID or status' },
  hi: { searchPh: 'प्रोडक्ट, ऑर्डर ID या स्थिति से खोजें' },
  zh: { searchPh: '按商品、订单号或状态搜索' },
} });
const router = useRouter();
const list = ref([]);
const loading = ref(true);
const activeTab = ref('all');
const query = ref('');

onMounted(async () => {
  try { list.value = (await api.orders()).list; } finally { loading.value = false; }
});

// Status tabs are derived client-side from the order statuses (no dedicated API).
const tabs = computed(() => {
  const seen = [];
  for (const o of list.value) if (o.status && !seen.includes(o.status)) seen.push(o.status);
  return ['all', ...seen];
});
const filtered = computed(() => {
  let rows = activeTab.value === 'all'
    ? list.value
    : list.value.filter((o) => o.status === activeTab.value);
  const q = query.value.trim().toLowerCase();
  if (q) {
    rows = rows.filter((o) => {
      const name = (o.product || o.type || '').toString().toLowerCase();
      const id = (o.id != null ? String(o.id) : '').toLowerCase();
      const status = (o.status || '').toString().toLowerCase();
      return name.includes(q) || id.includes(q) || status.includes(q);
    });
  }
  return rows;
});

function statusClass(s) {
  return { ongoing: 's_wait', success: 's_green', active: 's_num', rewarded: 's_green', entered: 's_num' }[s] || 's_num';
}
</script>

<!-- Faithful rebuild of the real pages/order/record (.record) + scoped CSS:
     status tabs, order cards and card action (open detail). -->
<template>
  <div class="record">
    <NavBar :title="t('order.title')" />

    <!-- search -->
    <div v-if="!loading && list.length" class="record_search">
      <input v-model="query" class="record_search_input" type="search" :placeholder="t('searchPh')" />
    </div>

    <!-- status tabs -->
    <div v-if="!loading && list.length" class="record_tabs">
      <div
        v-for="s in tabs"
        :key="s"
        class="record_tab_item"
        :class="{ active: activeTab === s }"
        @click="activeTab = s"
      >{{ s === 'all' ? 'All' : s }}</div>
    </div>

    <div v-if="loading" class="record_loading">{{ t('common.loading') }}</div>
    <div v-else-if="!list.length" class="empty">
      <img src="/static/image/nodata.png" alt="" /><div>{{ t('common.empty') }}</div>
    </div>

    <div v-else class="record_main">
      <div v-if="!filtered.length" class="empty"><div>{{ t('common.empty') }}</div></div>
      <div class="record_main_card">
        <div v-for="o in filtered" :key="o.id" class="order_item" @click="router.push('/orders/' + o.id)">
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
          <div class="order_item_action">
            <span class="order_item_action_btn">View details ›</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.record { width: 100%; min-height: 100vh; background: #f9f9f9; }
.record_loading { padding-top: 10px; text-align: center; background: #f9f9f9; color: #b9b9b9; }
.record_main { background: #f9f9f9; }
.record_main_card { background: #f9f9f9; padding: 8px 15px; }

/* search */
.record_search { background: #fff; padding: 10px 15px; border-bottom: 1px solid #f0f0f0; }
.record_search_input { width: 100%; box-sizing: border-box; height: 38px; padding: 0 14px; border: none; outline: none; background: #f4f4f4; border-radius: 19px; font-size: 14px; color: #17273a; }
.record_search_input::placeholder { color: #b9b9b9; }

/* status tabs (derived) */
.record_tabs { display: flex; align-items: center; background: #fff; padding: 0 6px; overflow-x: auto; border-bottom: 1px solid #f0f0f0; }
.record_tab_item { flex-shrink: 0; padding: 12px 14px; font-size: 14px; color: #b9b9b9; position: relative; text-transform: capitalize; }
.record_tab_item.active { color: #17273a; font-weight: 700; }
.record_tab_item.active::after { content: ''; position: absolute; left: 50%; bottom: 4px; transform: translateX(-50%); width: 20px; height: 3px; border-radius: 2px; background: #ee5016; }

.order_item { margin-bottom: 8px; padding: 16px 14px 14px 25px; background-color: #fff; border-radius: 8px; }
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
.order_item_action { margin-top: 8px; padding-top: 10px; border-top: 0.5px solid #f0f0f0; text-align: right; }
.order_item_action_btn { font-size: 13px; color: #ee5016; font-weight: 500; }
.empty { text-align: center; color: #b9b9b9; padding: 60px 0; }
.empty img { width: 90px; margin: 0 auto 10px; opacity: 0.8; }
</style>
