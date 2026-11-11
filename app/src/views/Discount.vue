<script setup>
import NavBar from '../components/NavBar.vue';
</script>

<!-- Faithful rebuild of the real pages/order/discount (.discount) + scoped CSS. -->
<template>
  <div class="discount">
    <NavBar title="Coupons" />
    <div class="discount_main">
      <div class="discount_empty">
        <img src="/static/image/nodata.png" alt="" />
        <div class="discount_empty_text">No coupons</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.discount { background: #fe995d; min-height: 100vh; }
.discount .discount_main { margin-top: 41px; padding: 0 14px 0 16px; }
.discount .discount_main .discount_main_item { margin-bottom: 29px; height: 100%; width: 100%; border-radius: 8px; position: relative; }
.discount .discount_main .discount_main_item .discount_main_item_ranking { height: 33px; background: linear-gradient(103deg, #ffe44b, #fea326); border-radius: 4px; box-shadow: 0px -2px 4px 0px rgba(255, 125, 0, .5) inset; position: absolute; top: -17px; left: 50%; transform: translateX(-50%); font-size: 16px; font-family: Roboto, Roboto-Medium; font-weight: 500; text-align: center; color: #fff; line-height: 33px; white-space: nowrap; }
.discount .discount_main .discount_main_item .discount_main_item_bg_1 { width: 345.50px; }
.discount .discount_main .discount_main_item .discount_main_item_bg_1 img { width: 100%; height: 100%; }
.discount .discount_main .discount_main_item .discount_main_item_name { position: absolute; top: 4px; left: 18px; font-size: 14px; font-family: Roboto, Roboto-Medium; font-weight: 500; color: #fff; }
.discount .discount_main .discount_main_item .discount_main_item_second { position: absolute; top: 40px; left: 0; height: 110px; width: 100%; padding-left: 30px; padding-top: 8px; display: flex; flex-wrap: wrap; overflow-y: auto; }
.discount .discount_main .discount_main_item .discount_main_item_second .discount_main_item_second_box { width: 50%; }
.discount .discount_main .discount_main_item .discount_main_item_second .second_name { font-size: 14px; font-family: Roboto, Roboto-Medium; font-weight: 500; color: #ee5016; line-height: 24px; }
.discount .discount_main .discount_main_item .discount_main_item_second .second_code { margin-left: 11px; font-size: 12px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #ee5016; line-height: 24px; }
.discount .discount_main .discount_main_item .discount_main_item_info { display: flex; align-items: center; justify-content: space-between; position: absolute; left: 50%; top: 49px; transform: translateX(-50%); }
.discount .discount_main .discount_main_item .discount_main_item_info .discount_main_item_info_avatar { width: 36px; display: flex; align-items: center; flex-direction: column; }
.discount .discount_main .discount_main_item .discount_main_item_info .discount_main_item_info_avatar .avatar_king { width: 14px; height: 14px; }
.discount .discount_main .discount_main_item .discount_main_item_info .discount_main_item_info_avatar .avatar_king img { width: 100%; height: 100%; }
.discount .discount_main .discount_main_item .discount_main_item_info .discount_main_item_info_avatar .avatar_main { width: 36px; height: 36px; border: 2px solid #ffcf5c; border-radius: 50%; overflow: hidden; }
.discount .discount_main .discount_main_item .discount_main_item_info .discount_main_item_info_avatar .avatar_main img { width: 100%; height: 100%; }
.discount .discount_main .discount_main_item .discount_main_item_info .discount_main_item_info_code { margin-left: 7px; margin-top: 11px; }
.discount .discount_main .discount_main_item .discount_main_item_info .discount_main_item_info_code .winner { font-size: 14px; font-family: Roboto, Roboto-Medium; font-weight: 500; color: #ee5016; }
.discount .discount_main .discount_main_item .discount_main_item_info .discount_main_item_info_code .code { font-size: 12px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #ee5016; margin-top: 5px; }
.discount .discount_main .discount_main_item .discount_main_item_info .right { margin-left: 2px; font-weight: 500; text-align: left; }
.discount .discount_main .discount_main_item .discount_main_item_info .discount_main_item_info_name { display: flex; font-size: 14px; font-family: Roboto, Roboto-Bold; font-weight: 700; text-align: center; color: #fff; line-height: 24px; }
.discount .discount_main .discount_main_item .discount_main_item_info .discount_main_item_info_name span { white-space: nowrap; }
.discount_empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 70px 0; }
.discount_empty img { width: 90px; opacity: 0.95; margin-bottom: 12px; }
.discount_empty_text { color: #fff; font-size: 15px; font-weight: 600; }
</style>
