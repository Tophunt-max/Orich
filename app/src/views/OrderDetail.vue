<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useToast } from '../components/useToast';

const route = useRoute();
const router = useRouter();
const { toast } = useToast();
const o = ref(null);

onMounted(async () => {
  try { o.value = (await api.orderDetail(route.params.id)).order; }
  catch (e) { toast(e.message); }
});
</script>

<!-- Faithful rebuild of the real pages/order/detail (.detail) + scoped CSS. -->
<template>
  <div class="detail">
    <NavBar title="Order Details" />

    <div class="detail_main">
      <template v-if="o">
        <div class="detail_main_order">
          <div class="detail_main_title">
            <div class="red_icon"></div>
            <div class="detail_main_title_font">Order Information</div>
          </div>

          <div class="detail_main_item">
            <span class="gray">Item</span>
            <span class="detail_main_status item_list">{{ o.product || o.type }}</span>
          </div>
          <div class="detail_main_item">
            <span class="gray">Amount</span>
            <span class="detail_main_status red">₹{{ o.amount }}</span>
          </div>
          <div class="detail_main_item" v-if="o.shares">
            <span class="gray">Shares</span>
            <span class="detail_main_status">{{ o.shares }}</span>
          </div>
          <div class="detail_main_item">
            <span class="gray">Status</span>
            <span class="detail_main_status">{{ o.status }}</span>
          </div>
          <div class="border"></div>
          <div class="detail_main_item">
            <span class="gray">Order No.</span>
            <span class="detail_main_status">#{{ o.id }}</span>
          </div>
          <div class="detail_main_item">
            <span class="gray">Date</span>
            <span class="detail_main_status">{{ o.date }}</span>
          </div>
        </div>
      </template>
      <div v-else class="empty2">
        <img src="/static/image/nodata.png" alt="" />
        <div>Order not found</div>
      </div>
    </div>

    <div class="detail_append">
      <button class="detail_append_btn" @click="router.back()">Back</button>
    </div>
  </div>
</template>

<style scoped>
.detail { font-family: Roboto, Roboto-Medium; }
.img { width: 100%; }
.gray { color: #b6b6b6; }
.red { color: #f47766; }
.red_icon { width: 5px; height: 10px; background: #ee5016; }
.detail_share { display: flex; align-items: center; justify-content: space-between; padding: 0 0 0 10px; }
.detail_share .detail_share_left { display: flex; align-items: center; }
.detail_share .detail_share_left .detail_share_left_title { font-size: 16px; margin-left: 12px; font-weight: 700; color: #17273a; }
.detail_share .detail_share_right { width: 49px; height: 51px; }
.detail_main { background: #f9f9f9; min-height: 100vh; padding-bottom: 60px; }
.detail_main .detail_main_title { display: flex; align-items: center; margin-bottom: 10px; }
.detail_main .detail_main_title .detail_main_title_font { margin-left: 12px; font-size: 16px; font-weight: 700; color: #17273a; }
.detail_main .detail_main_order { padding: 10px 15px; background: #fff; margin-top: 6px; }
.detail_main .detail_main_item { display: flex; flex-wrap: wrap; justify-content: space-between; min-height: 32px; line-height: 32px; }
.detail_main .detail_main_item .detail_main_status { text-align: right; width: 80%; line-height: 32px; }
.detail_main .item_list { height: 100%; max-width: 184px; }
.detail_main .border { margin: 10px 0; border-bottom: 1px solid #f3f3f4; }
.detail_foot { background: #f9f9f9; width: 100%; height: 100px; }
.detail_append { width: 100%; padding: 5px 0; position: fixed; left: 50%; transform: translateX(-50%); max-width: var(--maxw); bottom: 0; height: 49px; background-color: #fff; box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, .1); display: flex; align-items: center; justify-content: center; }
.detail_append .detail_append_btn { width: 300px; height: 39px; border-radius: 20px; background: #ee5016; color: #fff; font-size: 15px; font-weight: 700; }
</style>
