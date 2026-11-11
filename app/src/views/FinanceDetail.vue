<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { api } from '../api/client';
import { useAuth } from '../stores/auth';
import { useToast } from '../components/useToast';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const auth = useAuth();
const { toast } = useToast();
const item = ref(null);
const amount = ref('');
const busy = ref(false);
const tab = ref('records'); // records | rules

const projected = computed(() => {
  if (!item.value || !amount.value) return '0.00';
  return (Number(amount.value) * (item.value.rate / 100) * item.value.days).toFixed(2);
});
const canBuy = computed(() => {
  if (!item.value) return false;
  const a = Number(amount.value);
  return a >= item.value.min && a <= item.value.max;
});

// Participant feed and rules come from the real backend response.
const participants = ref([]);
const rules = ref([]);
// Daily earning history for this plan (from api.financeHistory).
const history = ref([]);

onMounted(async () => {
  const d = await api.finance(route.params.id);
  item.value = d.item;
  participants.value = d.participants || [];
  rules.value = d.rules || [];
  amount.value = item.value.min;
  auth.refresh();
  try {
    const h = await api.financeHistory(route.params.id);
    history.value = h?.list || [];
  } catch { history.value = []; }
});

async function invest() {
  if (!canBuy.value || busy.value) return;
  busy.value = true;
  try {
    const data = await api.financeBuy(item.value.id, Number(amount.value));
    auth.user = { ...auth.user, balance: data.balance };
    toast(t('finance.confirm') + ' ✓');
  } catch (e) { toast(e.message); }
  finally { busy.value = false; }
}
</script>

<!-- Faithful rebuild of the real pages/finance/fdetail: header info, plan card, amount form,
     Records / Rules tabs with participant feed, and fixed buy bar. -->
<template>
  <div class="fdetail" v-if="item">
    <div class="fdetail_bg">
      <header class="fnav">
        <span class="back" @click="router.back()">‹</span>{{ item.name }}
        <span class="bar_help" @click="tab = 'rules'"><img src="/static/image/finance/icon_Problem.png" alt="" /></span>
      </header>
      <div class="fdetail_info">
        <div class="fdetail_info_img">
          <img :src="item.cover || '/static/image/finance/icon_Finance.png'" alt="" />
          <div class="fdetail_info_time">{{ item.days }}-day term</div>
        </div>
        <div class="fdetail_info_dd">
          <div class="fdetail_info_dd_title">{{ item.name }}</div>
          <div class="fdetail_info_dd_strip">{{ item.rate }}%<span>/{{ t('finance.day') }}</span></div>
          <div class="fdetail_info_dd_strip">Principal returned on maturity</div>
        </div>
      </div>
    </div>

    <div class="fdetail_card">
      <div class="fdetail_card_item"><span class="k">{{ t('finance.rate') }}</span><span class="price">{{ item.rate }}%</span></div>
      <div class="fdetail_card_item"><span class="k">{{ t('finance.days') }}</span><span class="v">{{ item.days }} days</span></div>
      <div class="fdetail_card_item"><span class="k">{{ t('finance.min') }}</span><span class="v">₹{{ item.min }}</span></div>
      <div class="fdetail_card_item"><span class="k">Max</span><span class="v">₹{{ item.max }}</span></div>
      <div class="fdetail_card_item"><span class="k gray">{{ item.desc }}</span></div>
    </div>

    <div class="form">
      <div class="form-label">{{ t('finance.amount') }} (₹)</div>
      <input class="form-input" v-model="amount" type="number" :min="item.min" :max="item.max" />
      <div class="proj"><span>{{ t('finance.projected') }}</span><span class="price">₹{{ projected }}</span></div>
    </div>

    <!-- Records / Rules tabs -->
    <div class="fdetail_part">
      <div class="fdetail_part_tab">
        <div class="fdetail_part_tab_item" @click="tab = 'records'">
          <span class="tab_name" :class="{ active: tab === 'records' }">Records</span>
          <i v-if="tab === 'records'"></i>
        </div>
        <div class="fdetail_part_tab_item" @click="tab = 'rules'">
          <span class="tab_name" :class="{ active: tab === 'rules' }">Rules</span>
          <i v-if="tab === 'rules'"></i>
        </div>
      </div>

      <div v-if="tab === 'records'" class="fdetail_part_main">
        <div v-for="(p, i) in participants" :key="i" class="fdetail_part_main_item">
          <div class="fdetail_part_main_item_avatar"><img :src="p.avatar" alt="" /></div>
          <div class="fdetail_part_main_item_user">
            <div class="fdetail_part_main_item_user_info">
              <div class="name">{{ p.name }}</div>
              <div class="time">{{ p.time }}</div>
            </div>
            <div class="fdetail_part_main_item_user_buyin">
              Invested ₹{{ p.amount }}
            </div>
          </div>
        </div>
      </div>

      <div v-else class="fdetail_part_html">
        <p v-for="(r, i) in rules" :key="i">{{ r }}</p>
      </div>
    </div>

    <!-- Earnings history (real daily earnings for this plan) -->
    <div v-if="history.length" class="fdetail_history">
      <div class="fdetail_history_title">Earnings history</div>
      <div v-for="(h, i) in history" :key="i" class="fdetail_history_row">
        <span class="day">Day {{ h.day }}</span>
        <span class="date">{{ h.date }}</span>
        <span class="earn">+₹{{ h.earning }}</span>
      </div>
    </div>

    <!-- fixed buy bar -->
    <div class="btn_buy">
      <div class="btn_buy_price">
        <div class="price">₹{{ Number(amount || 0).toFixed(2) }}</div>
        <div class="balance">Projected return ₹{{ projected }}</div>
      </div>
      <button class="btn_buy_price_submin" :class="canBuy && !busy ? 'btnactive' : 'btndisable'" :disabled="!canBuy || busy" @click="invest">
        {{ t('finance.confirm') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.fdetail { min-height: 100vh; background: #f9f9f9; padding-bottom: 60px; }
.fdetail_bg { background: linear-gradient(160deg, #ff7a45, #ee5016); padding-bottom: 40px; }
.fnav { position: relative; height: 44px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; font-weight: 700; }
.fnav .back { position: absolute; left: 12px; font-size: 24px; line-height: 1; }
.bar_help { position: absolute; right: 15px; width: 19px; height: 19px; }
.bar_help img { width: 100%; height: 100%; object-fit: contain; }
.fdetail_info { display: flex; align-items: flex-start; justify-content: flex-start; padding: 6px 11px 0; }
.fdetail_info_img { width: 86px; height: 86px; position: relative; flex-shrink: 0; border-radius: 8px; overflow: hidden; background: rgba(255,255,255,.15); }
.fdetail_info_img img { width: 100%; height: 100%; object-fit: contain; }
.fdetail_info_time { position: absolute; left: 0; bottom: 0; width: 100%; height: 20px; line-height: 20px; background: #90b9ff; border-radius: 5px 5px 0 0; font-size: 12px; font-weight: 500; color: #fff; text-align: center; white-space: nowrap; }
.fdetail_info_dd { padding-left: 14px; }
.fdetail_info_dd_title { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 7px; }
.fdetail_info_dd_strip { font-size: 14px; font-weight: 700; color: #ffe2db; margin-top: 3px; }
.fdetail_info_dd_strip span { margin-left: 3px; }
.fdetail_card { margin: -28px 11px 0; background: #fff; border-radius: 5px; padding: 18px; }
.fdetail_card_item { display: flex; align-items: center; justify-content: space-between; font-size: 14px; }
.fdetail_card_item + .fdetail_card_item { margin-top: 15px; }
.fdetail_card_item .k { color: #b9b9b9; }
.fdetail_card_item .v { color: #17273a; }
.fdetail_card_item .price { color: #ff5c5c; font-weight: 700; }
.fdetail_card_item .gray { color: #b9b9b9; font-size: 13px; line-height: 1.6; }
.form { margin: 10px 11px 0; background: #fff; border-radius: 5px; padding: 16px; }
.form-label { font-size: 13px; color: #b9b9b9; margin-bottom: 8px; }
.form-input { width: 100%; padding: 11px 14px; border: 1px solid #ececec; border-radius: 8px; font-size: 16px; outline: none; box-sizing: border-box; }
.proj { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; font-size: 15px; }
.proj .price { color: #ff5c5c; font-weight: 700; }
.fdetail_part { margin-top: 10px; background: #fff; }
.fdetail_part_tab { padding: 13px; display: flex; align-items: center; justify-content: space-around; border-bottom: 1px solid #f9f9f9; }
.fdetail_part_tab_item { display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; }
.fdetail_part_tab_item .tab_name { font-size: 14px; font-weight: 500; color: #b9b9b9; }
.fdetail_part_tab_item .tab_name.active { font-size: 16px; color: #17273a; }
.fdetail_part_tab_item i { margin-top: 3px; width: 14px; height: 3px; border-radius: 2px; background: #ee5016; }
.fdetail_part_main { padding-bottom: 10px; }
.fdetail_part_main_item { display: flex; align-items: flex-start; justify-content: flex-start; padding: 10px 27px; }
.fdetail_part_main_item_avatar { flex-shrink: 0; width: 48px; height: 48px; border-radius: 50%; overflow: hidden; }
.fdetail_part_main_item_avatar img { width: 100%; height: 100%; object-fit: cover; }
.fdetail_part_main_item_user { width: 100%; padding-left: 17px; }
.fdetail_part_main_item_user_info { display: flex; align-items: center; justify-content: space-between; }
.fdetail_part_main_item_user_info .name { max-width: 120px; font-size: 14px; font-weight: 500; color: #17273a; }
.fdetail_part_main_item_user_info .time { font-size: 12px; color: #b9b9b9; }
.fdetail_part_main_item_user_buyin { margin-top: 6px; font-size: 14px; color: #b9b9b9; }
.fdetail_part_main_item_user_buyin .earn { margin-left: 6px; color: #ff5c5c; }
.fdetail_part_html { padding: 12px 15px 16px; font-size: 13px; line-height: 1.8; color: #566c82; }
.fdetail_part_html p { margin: 0; }
.fdetail_history { margin-top: 10px; background: #fff; padding: 14px 15px 6px; }
.fdetail_history_title { font-size: 15px; font-weight: 700; color: #17273a; margin-bottom: 8px; }
.fdetail_history_row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: .5px solid #ececec; font-size: 14px; }
.fdetail_history_row:last-child { border-bottom: none; }
.fdetail_history_row .day { color: #17273a; font-weight: 500; }
.fdetail_history_row .date { color: #b9b9b9; font-size: 13px; }
.fdetail_history_row .earn { color: #ff5c5c; font-weight: 700; }
.btn_buy { position: fixed; left: 50%; transform: translateX(-50%); bottom: 0; width: 100%; max-width: var(--maxw); height: 49px; display: flex; align-items: center; justify-content: space-between; padding: 0 15px 0 30px; background: #fff; border-top: 1px solid #f9f9f9; }
.btn_buy_price .price { font-size: 16px; font-weight: 700; color: #ff5c5c; }
.btn_buy_price .balance { font-size: 13px; font-weight: 400; color: #b9b9b9; white-space: nowrap; }
.btn_buy_price_submin { width: 202px; height: 39px; border-radius: 4px; line-height: 39px; text-align: center; color: #fff; font-size: 16px; font-weight: 700; }
.btn_buy .btndisable { background: #dbdbdb; }
.btn_buy .btnactive { background: #ee5016; }
</style>
