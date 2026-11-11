<script setup>
import { computed, onMounted, ref } from 'vue';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useToast } from '../components/useToast';

const { toast } = useToast();
const list = ref([]);
const tab = ref('active'); // active | done

onMounted(async () => {
  try { list.value = ((await api.myFinance()).list || []).slice().reverse(); }
  catch (e) { toast(e.message); }
});

const isActive = (o) => String(o.status || '').toLowerCase() === 'active';
const shown = computed(() => list.value.filter((o) => (tab.value === 'active' ? isActive(o) : !isActive(o))));
const total = computed(() => list.value.reduce((s, o) => s + Number(o.amount || 0), 0).toFixed(2));
const count = computed(() => list.value.length);
</script>

<!-- Faithful rebuild of the real pages/finance/order (.order) + scoped CSS. -->
<template>
  <div class="order">
    <NavBar title="My Finance" />

    <div class="order_total">
      <div class="order_total_income">Total Invested</div>
      <div class="order_total_income_num">₹{{ total }}</div>
      <div class="order_total_amount">
        <div class="order_total_amount_item">
          <div class="title">Active orders</div>
          <div class="number">{{ count }}</div>
        </div>
        <div class="order_total_amount_item">
          <div class="title">Total amount</div>
          <div class="number">₹{{ total }}</div>
        </div>
      </div>
    </div>

    <div class="order_list">
      <div class="order_list_tab">
        <div class="order_list_tab_item" @click="tab = 'active'">
          <div :class="tab === 'active' ? 'active' : 'name'">In Progress</div>
          <div v-if="tab === 'active'" class="img"></div>
        </div>
        <div class="order_list_tab_item" @click="tab = 'done'">
          <div :class="tab === 'done' ? 'active' : 'name'">Completed</div>
          <div v-if="tab === 'done'" class="img"></div>
        </div>
      </div>

      <div v-if="!shown.length" class="empty2">
        <img src="/static/image/nodata.png" alt="" onerror="this.style.display='none'" />
        <div>{{ tab === 'active' ? 'No active investments' : 'No completed investments' }}</div>
      </div>

      <div class="order_list_card">
        <div v-for="o in shown" :key="o.id" class="order_list_card_item">
          <div class="order_list_card_item_title">{{ o.product }}</div>
          <div class="order_list_card_item_total">
            <div class="order_list_card_item_total_strip">
              <div class="title">Amount</div>
              <div class="number">₹{{ o.amount }}</div>
            </div>
            <div class="order_list_card_item_total_strip">
              <div class="title">Status</div>
              <div class="number endin">{{ o.status }}</div>
            </div>
          </div>
          <div class="order_list_card_item_pro">
            <div class="order_list_card_item_pro_title">Progress</div>
            <div class="order_list_card_item_pro_gress"><span :style="{ width: (o.progress || 0) + '%' }"></span></div>
            <div class="order_list_card_item_pro_num">{{ o.progress || 0 }}%</div>
          </div>
          <div class="order_list_card_item_pro mr_top36">
            <div class="order_list_card_item_pro_title">Earned</div>
            <div class="order_list_card_item_pro_time">₹{{ o.earned ?? '0.00' }}<template v-if="o.daysLeft != null"> · {{ o.daysLeft }} days left</template></div>
          </div>
          <div class="order_list_card_item_pro mr_top36">
            <div class="order_list_card_item_pro_title">Date</div>
            <div class="order_list_card_item_pro_time">{{ o.date }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.order { min-height: 100vh; }
.order .order_total { background-image: url('/static/image/finance/bg_order.png'); background-size: 100% 100%; background-repeat: no-repeat; height: 221px; padding-top: 24px; color: #fff; }
.order .order_total .order_total_income { text-align: center; font-size: 18px; font-family: Roboto, Roboto-Medium; font-weight: 500; letter-spacing: 0px; }
.order .order_total .order_total_income_num { margin-top: 15px; text-align: center; font-size: 26px; font-family: Roboto, Roboto-Bold; font-weight: 700; letter-spacing: 0px; }
.order .order_total .order_total_amount { display: flex; align-items: center; justify-content: space-between; margin-top: 18px; padding: 0 11px; }
.order .order_total .order_total_amount .order_total_amount_item { color: #fff; text-align: center; flex: 1; }
.order .order_total .order_total_amount .order_total_amount_item .title { font-size: 14px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #fff; letter-spacing: 0px; }
.order .order_total .order_total_amount .order_total_amount_item .number { margin-top: 7px; font-size: 18px; font-family: Roboto, Roboto-Bold; font-weight: 700; color: #fff; letter-spacing: 0px; max-width: 100px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; margin-left: auto; margin-right: auto; }
.order .order_list { margin-top: -15px; background: #fff; border-radius: 10px 10px 0px 0px; padding-top: 15px; position: relative; }
.order .order_list .order_list_tab { display: flex; align-items: center; justify-content: center; }
.order .order_list .order_list_tab .order_list_tab_item { font-family: Roboto, Roboto-Medium; font-weight: 500; font-size: 14px; letter-spacing: 0px; text-align: center; margin: 0 28px; }
.order .order_list .order_list_tab .order_list_tab_item .name { color: #b9b9b9; }
.order .order_list .order_list_tab .order_list_tab_item .active { font-size: 16px; color: #17273a; }
.order .order_list .order_list_card { margin-top: 10px; }
.order .order_list .order_list_card .order_list_card_item { padding: 15px 12px; border-top: 1px solid #f9f9f9; border-bottom: 1px solid #f9f9f9; }
.order .order_list .order_list_card .order_list_card_item .order_list_card_item_title { font-size: 16px; font-family: Roboto, Roboto-Medium; font-weight: 500; color: #17273a; letter-spacing: 0px; }
.order .order_list .order_list_card .order_list_card_item .order_list_card_item_total { margin-top: 14px; display: flex; align-items: center; justify-content: space-between; }
.order .order_list .order_list_card .order_list_card_item .order_list_card_item_total .order_list_card_item_total_strip { font-size: 14px; font-family: Roboto, Roboto-Regular; font-weight: 400; text-align: center; letter-spacing: 0px; }
.order .order_list .order_list_card .order_list_card_item .order_list_card_item_total .order_list_card_item_total_strip .title { color: #b9b9b9; }
.order .order_list .order_list_card .order_list_card_item .order_list_card_item_total .order_list_card_item_total_strip .number { margin-top: 8px; color: #ff5c5c; font-weight: 700; max-width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.order .order_list .order_list_card .order_list_card_item .order_list_card_item_pro { margin-top: 12px; font-size: 14px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #b9b9b9; letter-spacing: 0px; display: flex; align-items: center; justify-content: flex-start; }
.order .order_list .order_list_tab .order_list_tab_item .img { width: 17px; height: 3px; border-radius: 2px; background: #ee5016; margin: 2px auto 0; }
.order .order_list .order_list_card .order_list_card_item .order_list_card_item_pro .order_list_card_item_pro_title { flex-shrink: 0; }
.order .order_list .order_list_card .order_list_card_item .order_list_card_item_pro .order_list_card_item_pro_gress { margin-left: 6px; margin-right: 12px; width: 100%; height: 6px; border-radius: 6px; background: #f0e3dc; overflow: hidden; }
.order .order_list .order_list_card .order_list_card_item .order_list_card_item_pro .order_list_card_item_pro_gress span { display: block; height: 100%; background: linear-gradient(115deg, #ffe44b, #fea326); }
.order .order_list .order_list_card .order_list_card_item .order_list_card_item_pro .order_list_card_item_pro_num { flex-shrink: 0; color: #ee5016; }
.order .order_list .order_list_card .order_list_card_item .order_list_card_item_pro .order_list_card_item_pro_time { margin-left: 7px; }
.order .order_list .order_list_card .order_list_card_item .endin { color: #ee5016; }
.order .order_list .order_list_card .order_list_card_item .mr_top36 { margin-top: 18px; }
.empty2 { text-align: center; padding: 40px 0; color: #b9b9b9; font-size: 14px; }
.empty2 img { width: 120px; margin: 0 auto 10px; display: block; }
</style>
