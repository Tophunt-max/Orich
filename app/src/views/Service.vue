<script setup>
import { onMounted, ref } from 'vue';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useToast } from '../components/useToast';

const { toast } = useToast();
const service = ref('https://wa.me/910000000000');

onMounted(async () => {
  try {
    const s = await api.system();
    if (s?.service) service.value = s.service;
  } catch { /* ignore */ }
});

function openWhatsApp() {
  window.open(service.value, '_blank');
}
async function copyEmail() {
  try { await navigator.clipboard.writeText('support@orich.com'); toast('Copied'); }
  catch { toast('support@orich.com'); }
}
</script>

<!-- Faithful rebuild of the real pages/account/service layout + scoped CSS. -->
<template>
  <div class="setting">
    <NavBar title="Customer Service" />
    <div class="middle">
      <div class="name" @click="openWhatsApp">
        <span class="name_title">WhatsApp</span>
        <span class="name_info">{{ service }}</span>
      </div>
      <div class="name" @click="copyEmail">
        <span class="name_title">Email</span>
        <span class="name_info">support@orich.com</span>
      </div>
      <div class="name">
        <span class="name_title">Service Hours</span>
        <span class="name_info">09:00 - 21:00</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.setting { min-height: 100vh; background-color: #f8f8f8; }
.middle { border-top: 1px solid #f8f8f8; background-color: #fff; }
.name { display: flex; flex-direction: row; align-items: center; justify-content: space-between; position: relative; width: 100%; padding: 18.5px 15px 18.5px 15px; }
.name .name_title { font-size: 16px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #444; }
.name .name_info { font-size: 16px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #b9b9b9; max-width: 60%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.name:not(:last-child) { border-bottom: 1px solid #ececec; }
</style>
