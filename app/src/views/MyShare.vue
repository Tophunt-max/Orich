<script setup>
import { onMounted, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useToast } from '../components/useToast';

const { toast } = useToast();
const { t } = useI18n({
  useScope: 'local',
  messages: {
    en: {
      navTitle: 'My Shares',
      tabWinning: 'Winning records',
      tabParticipation: 'My participation',
      empty: 'No shares yet',
      winningRecord: 'Winning record',
      code: 'Code',
      sharesLabel: 'shares',
      shared: 'Shared',
      showOff: 'Show off',
    },
    hi: {
      navTitle: 'मेरे शेयर',
      tabWinning: 'जीत के रिकॉर्ड',
      tabParticipation: 'मेरी भागीदारी',
      empty: 'अभी कोई शेयर नहीं',
      winningRecord: 'जीत का रिकॉर्ड',
      code: 'कोड',
      sharesLabel: 'शेयर',
      shared: 'शेयर किया गया',
      showOff: 'दिखाएं',
    },
  },
});
const list = ref([]);
const tab = ref(0);
const tabs = computed(() => [t('tabWinning'), t('tabParticipation')]);

onMounted(async () => {
  try { list.value = (await api.myWinners()).list || []; }
  catch (e) { toast(e.message); }
});
</script>

<!-- Faithful rebuild of the real pages/winner/myShare (.winner) + scoped CSS. -->
<template>
  <div class="winner">
    <NavBar :title="t('navTitle')" />

    <div class="share_bar">
      <div v-for="(tb, i) in tabs" :key="tb" class="share_bar_item" @click="tab = i">
        <div class="share_bar_item_title" :class="{ active: tab === i }">{{ tb }}</div>
        <img v-if="tab === i" src="/static/image/home/Vector.png" alt="" />
      </div>
    </div>

    <div v-if="!list.length" class="empty2">
      <img src="/static/image/nodata.png" alt="" />
      <div>{{ t('empty') }}</div>
    </div>

    <div class="card_list">
      <div v-for="w in list" :key="w.id" class="card_list_item">
        <div class="card_list_item_title">{{ t('winningRecord') }} · {{ w.date }}</div>
        <div class="card_list_item_main">
          <div class="card_list_item_main_img">
            <img src="/static/image/record/img_YouWon.png" alt="" />
          </div>
          <div class="card_list_item_main_title">
            {{ w.product }}
            <div class="card_list_item_sub">{{ t('code') }} {{ w.code }} · {{ w.shares }} {{ t('sharesLabel') }}</div>
          </div>
        </div>
        <div class="card_list_comment">
          <div class="card_list_comment_btn" @click="toast(t('shared'))">
            <img src="/static/image/record/icon_Share.png" alt="" />
            <span>{{ t('showOff') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.winner { background: #f9f9f9; min-height: 100vh; }
.img { width: 100%; }
.share_bar { background: #fff; display: flex; align-items: center; justify-content: space-between; padding: 9px 33px 7px 34px; }
.share_bar_item { display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; }
.share_bar_item_title { font-size: 14px; font-family: Roboto, Roboto-Medium; font-weight: 700; color: #b9b9b9; }
.share_bar_item_title.active { font-size: 16px; color: #17273a; }
.share_bar_item img { width: 17px; height: 6px; margin-top: 3px; }
.empty2 { text-align: center; color: #b9b9b9; padding: 60px 0; }
.empty2 img { width: 90px; margin: 0 auto 10px; opacity: 0.8; }
.card_list { border-radius: 8px; }
.card_list .card_list_item { position: relative; margin: 10px 14px 8px 15px; padding: 15px 0 15px 11px; background-color: #fff; border-radius: 8px; }
.card_list .card_list_item .card_list_comment { position: absolute; bottom: 15px; right: 15px; }
.card_list .card_list_item .card_list_comment .card_list_comment_btn { width: 86px; height: 30px; display: flex; flex-direction: row; align-items: center; justify-content: center; background: linear-gradient(115deg, #ffe44b, #fea326); border-radius: 4px; box-shadow: 0px -2px 4px 0px rgba(255, 125, 0, .5) inset; font-size: 13px; font-weight: 400; color: #ad6701; }
.card_list .card_list_item .card_list_comment .card_list_comment_btn img { width: 14px; height: 14px; margin-right: 4px; }
.card_list .card_list_item .card_list_item_title { font-size: 14px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #b9b9b9; }
.card_list .card_list_item .card_list_item_main { margin-left: 3px; margin-top: 8px; display: flex; }
.card_list .card_list_item .card_list_item_main .card_list_item_main_img { width: 77px; height: 77px; flex-shrink: 0; }
.card_list .card_list_item .card_list_item_main .card_list_item_main_img img { width: 100%; }
.card_list .card_list_item .card_list_item_main .card_list_item_main_title { margin-left: 15px; padding-top: 10px; font-family: Roboto, Roboto-Medium; font-weight: 700; color: #000; }
.card_list_item_sub { margin-top: 8px; font-size: 13px; font-weight: 400; color: #b9b9b9; }
</style>
