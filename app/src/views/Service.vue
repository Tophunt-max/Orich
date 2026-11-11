<script setup>
import { onMounted, ref } from 'vue';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
const sys = ref({});
onMounted(async () => { sys.value = await api.system(); });
</script>
<template>
  <div class="scr">
    <NavBar title="Customer Service" />
    <div class="info-page">
      <h3>We're here to help</h3>
      <p>Reach our support team any time:</p>
      <a class="row" :href="sys.service || '#'" target="_blank">
        <img src="/static/image/home/icon_Support.png" alt="" /> WhatsApp support
      </a>
      <div class="row"><img src="/static/image/home/icon_FAQ.png" alt="" /> support@orich.example</div>
    </div>
  </div>
</template>
<style scoped>.row { display: flex; align-items: center; gap: 10px; padding: 14px 0; border-bottom: 1px solid #f0f0f0; color: #17273a; } .row img { width: 26px; height: 26px; object-fit: contain; }</style>
