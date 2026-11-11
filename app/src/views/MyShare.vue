<script setup>
import { onMounted, ref } from 'vue';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useToast } from '../components/useToast';

const { toast } = useToast();
const list = ref([]);

onMounted(async () => {
  try { list.value = (await api.myWinners()).list || []; }
  catch (e) { toast(e.message); }
});
</script>

<!-- Faithful rebuild of the real pages/winner/myShare (.winner) + scoped CSS. -->
<template>
  <div class="winner">
    <NavBar title="My Shares" />

    <div v-if="!list.length" class="empty2">
      <img src="/static/image/nodata.png" alt="" />
      <div>No shares yet</div>
    </div>

    <div class="card_list">
      <div v-for="w in list" :key="w.id" class="card_list_item">
        <div class="card_list_item_title">Winning record · {{ w.date }}</div>
        <div class="card_list_item_main">
          <div class="card_list_item_main_img">
            <img src="/static/image/record/img_YouWon.png" alt="" />
          </div>
          <div class="card_list_item_main_title">
            {{ w.product }}
            <div class="card_list_item_sub">Code {{ w.code }} · {{ w.shares }} shares</div>
          </div>
        </div>
        <div class="card_list_comment">
          <div class="card_list_comment_btn" @click="toast('Shared')">
            <img src="/static/image/record/icon_Share.png" alt="" />
            <span>Show off</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.winner { background: #f9f9f9; min-height: 100vh; }
.img { width: 100%; }
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
