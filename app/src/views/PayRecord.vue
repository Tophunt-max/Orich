<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useToast } from '../components/useToast';

const { t } = useI18n({
  useScope: 'local',
  messages: {
    en: {
      navTitle: 'Recharge Records',
      tab: 'Recharge records',
      empty: 'No records',
      amount: 'Amount',
      status: 'Status',
      date: 'Date',
    },
    hi: {
      navTitle: 'रिचार्ज रिकॉर्ड',
      tab: 'रिचार्ज रिकॉर्ड',
      empty: 'कोई रिकॉर्ड नहीं',
      amount: 'राशि',
      status: 'स्थिति',
      date: 'तारीख',
    },
  },
});

const { toast } = useToast();
const list = ref([]);

onMounted(async () => {
  try { list.value = ((await api.rechargeRecord()).list || []).slice().reverse(); }
  catch (e) { toast(e.message); }
});
</script>

<!-- Faithful rebuild of the real pages/payment/payrecord (.payrecord) + scoped CSS. -->
<template>
  <div>
    <NavBar :title="t('navTitle')" />
    <div class="payrecord">
      <div class="payrecord_tab">
        <div class="payrecord_tab_item active">{{ t('tab') }}</div>
      </div>

      <div v-if="!list.length" class="empty2">
        <img src="/static/image/nodata.png" alt="" />
        <div>{{ t('empty') }}</div>
      </div>

      <div v-for="o in list" :key="o.id" class="payrecord_list">
        <div class="payrecord_list_item border">
          <span>{{ t('amount') }}</span>
          <span class="payrecord_list_item_content">+₹{{ o.amount }}</span>
        </div>
        <div class="payrecord_list_item border">
          <span>{{ t('status') }}</span>
          <span class="payrecord_list_item_content">{{ o.status }}</span>
        </div>
        <div class="payrecord_list_item">
          <span>{{ t('date') }}</span>
          <span class="payrecord_list_item_content">{{ o.date }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payrecord { padding: 10px 15px; font-family: Roboto, Roboto-Regular; }
.payrecord .payrecord_tab { display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; }
.payrecord .payrecord_tab .payrecord_tab_item { font-size: 14px; font-family: Roboto, Roboto-Medium; font-weight: 700; color: #b9b9b9; letter-spacing: 0px; display: flex; flex-direction: column; align-items: center; }
.payrecord .payrecord_tab .active { color: #17273a; }
.payrecord .payrecord_tab img { width: 17px; height: 6px; margin-left: 3px; }
.payrecord .payrecord_list { border: 1px solid #ee5016; border-radius: 5px; margin-bottom: 15px; box-shadow: 0px 4px 4px 0px rgba(238, 80, 22, .16); padding: 0 10px; }
.payrecord .payrecord_list .payrecord_list_item { display: flex; align-items: center; justify-content: space-between; padding: 8px 3px; }
.payrecord .payrecord_list .payrecord_list_item .payrecord_list_item_content { color: #a9a9a9; }
.payrecord .payrecord_list .border { border-bottom: 1px solid #dcdcdc; }
</style>
