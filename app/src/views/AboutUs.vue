<script setup>
import NavBar from '../components/NavBar.vue';

const arrow = '/static/image/icon_CaretRight.png';
const version = '2.1.4';
</script>

<!-- Faithful rebuild of the real pages/account/aboutus layout + scoped CSS. -->
<template>
  <div class="about">
    <NavBar title="About Us" />

    <div class="about_logo">
      <img class="about_logo_icon" src="/static/image/logo.png" alt="" />
      <div class="about_logo_name">ORich</div>
      <div class="about_logo_ver">Version {{ version }}</div>
    </div>

    <div class="about_main">
      <div class="about_main_item border_bottom">
        <div class="about_main_item_title">Current Version</div>
        <div class="about_main_item_right">
          <span>{{ version }}</span>
        </div>
      </div>
      <div class="about_main_item border_bottom">
        <div class="about_main_item_title">User Agreement</div>
        <div class="about_main_item_right">
          <img class="about_main_item_icon" :src="arrow" alt="" />
        </div>
      </div>
      <div class="about_main_item">
        <div class="about_main_item_title">Privacy Policy</div>
        <div class="about_main_item_right">
          <img class="about_main_item_icon" :src="arrow" alt="" />
        </div>
      </div>
    </div>

    <div class="about_desc">
      ORich is a group-buy and lucky-draw platform where you can join product rounds from
      as little as a few rupees per share, win prizes, grow your wallet with finance plans,
      and invite friends to earn referral rewards.
    </div>
  </div>
</template>

<style scoped>
.about { min-height: 100vh; background: #f8f8f8; }
.about .img { width: 100%; }
.about_logo { background: #fff; text-align: center; padding: 24px 0 28px; border-bottom: 0.5px solid #ececec; }
.about_logo_icon { width: 72px; height: 72px; border-radius: 16px; object-fit: contain; }
.about_logo_name { margin-top: 10px; font-size: 18px; font-weight: 700; font-family: Roboto, Roboto-Bold; color: #000; }
.about_logo_ver { margin-top: 4px; font-size: 13px; color: #b9b9b9; }
.about_main { background: #fff; margin-top: 10px; margin-left: 1px; padding: 0 12px 0 15px; }
.about_main .border_bottom { border-bottom: 0.5px solid #ececec; }
.about_main .about_main_item { display: flex; align-items: center; justify-content: space-between; padding: 18.5px 0; }
.about_main .about_main_item .about_main_item_title { font-size: 16px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #444; letter-spacing: 0px; }
.about_main .about_main_item .about_main_item_right { display: flex; align-items: center; }
.about_main .about_main_item .about_main_item_right span { margin-right: 8px; opacity: 1; font-size: 16px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #b9b9b9; letter-spacing: 0px; }
.about_main .about_main_item .about_main_item_right .about_main_item_icon { width: 16px; height: 16px; }
.about_desc { padding: 18px 15px; font-size: 14px; line-height: 1.7; color: #17273a; }
</style>
