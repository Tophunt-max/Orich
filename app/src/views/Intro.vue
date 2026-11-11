<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
</script>

<!-- Faithful rebuild of the real pages/intro (.download) guide screen + scoped CSS. -->
<template>
  <div class="download">
    <div class="intro_hero">
      <img class="intro_logo" src="/static/image/logo.png" alt="ORich" />
      <div class="intro_title">Welcome to ORich</div>
      <div class="intro_sub">Join group-buys from ₹1, win big products, and withdraw your rewards anytime.</div>
    </div>

    <div class="suc-btn">
      <div class="suc-btn-detail" @click="router.replace('/home')">Get started</div>
    </div>
  </div>
</template>

<style scoped>
.download { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; min-height: 100vh; background-image: url('/static/image/download/download-bg.png'); background-size: cover; background-position: center; }
.download .bg { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; position: fixed; width: 100vw; height: 100vh; z-index: 99; font-size: 15px; color: #fff; background-color: rgba(0, 0, 0, .6); }
.download .bg img { width: 80px; margin-top: 150px; margin-bottom: 25px; }
.download .suc-btn { display: flex; flex-direction: column; align-items: center; justify-content: space-around; width: 100%; margin-top: auto; margin-bottom: 50px; padding: 0 32px; font-size: 14px; }
.download .suc-btn .suc-btn-home { display: flex; flex-direction: row; align-items: center; justify-content: center; width: 263px; height: 79px; opacity: 1; background: #fff; border-radius: 4px; }
.download .suc-btn .suc-btn-home img { width: 46px; height: 46px; margin-right: 18px; }
.download .suc-btn .suc-btn-detail { display: flex; flex-direction: row; align-items: center; justify-content: center; width: 138px; height: 40px; border-radius: 20px; background: #e2b87f; color: #fff; font-size: 16px; font-weight: 700; }
.download .suc-btn .android { font-size: 18px; font-family: PingFang SC, PingFang SC-Bold; font-weight: 700; text-align: left; color: #a4c937; }
.download .suc-btn .ios { margin-top: 18px; margin-bottom: 50px; font-size: 18px; font-family: PingFang SC, PingFang SC-Bold; font-weight: 700; text-align: left; color: #1179f8; }
.intro_hero { display: flex; flex-direction: column; align-items: center; margin-top: 120px; padding: 0 32px; text-align: center; }
.intro_logo { width: 96px; height: 96px; border-radius: 22px; margin-bottom: 20px; }
.intro_title { font-size: 24px; font-weight: 800; color: #17273a; }
.intro_sub { margin-top: 12px; font-size: 14px; line-height: 1.7; color: #444; }
</style>
