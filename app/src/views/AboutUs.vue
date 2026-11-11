<script setup>
import NavBar from '../components/NavBar.vue';
</script>
<template>
  <div class="scr">
    <NavBar title="About Us" />
    <div class="info-page">
      <div style="text-align:center;margin-bottom:16px">
        <span class="badge2">O</span>
        <h3 style="margin:10px 0 2px">ORich</h3>
        <div style="color:#b9b9b9">Version 2.1.4</div>
      </div>
      <p>ORich is a group-buy and lucky-draw platform where you can join product rounds from as little as ₹1 per share, win prizes, grow your wallet with finance plans, invite friends and earn rewards.</p>
      <p>This is a clean re-implementation built for the repository owner. Payments are simulated in this build.</p>
    </div>
  </div>
</template>
<style scoped>.badge2 { display: inline-flex; width: 56px; height: 56px; border-radius: 14px; background: #ee5016; color: #fff; font-size: 34px; font-weight: 800; align-items: center; justify-content: center; }</style>
