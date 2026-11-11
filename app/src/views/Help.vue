<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';

const { t } = useI18n();
const list = ref([]);
const open = ref(0);

onMounted(async () => { list.value = (await api.help()).list; });
</script>

<!-- Faithful rebuild of the real pages/help/help (.help / help_main). -->
<template>
  <div class="help">
    <div class="help_top"><header class="hnav">{{ t('account.help') }}</header></div>
    <div class="help_main">
      <div class="help_main_title">
        <span class="help_main_title_name">FAQ</span>
        <span class="help_main_title_url">orich.in</span>
      </div>
      <div v-for="(f, i) in list" :key="f.id" class="help_main_item" @click="open = open === i ? -1 : i">
        <div class="q"><span class="icon_qr"></span>{{ f.q }}<span class="chev" :class="{ on: open === i }">›</span></div>
        <div v-if="open === i" class="a">{{ f.a }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.help { min-height: 100vh; background: #ee5016; padding-bottom: 15px; }
.hnav { height: 44px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; font-weight: 700; }
.help_top { height: 120px; }
.help_main { background: #fff; margin-top: -40px; border-radius: 30px 30px 0 0; min-height: 60vh; padding: 20px 0 0; }
.help_main_title { padding: 0 15px 10px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e9ecef; }
.help_main_title_name { font-weight: 700; font-size: 16px; color: #17273a; }
.help_main_title_url { font-size: 12px; color: #dcdcdc; }
.help_main_item { border-bottom: 1px solid #e9ecef; padding: 14px 15px; }
.q { display: flex; align-items: center; font-size: 14px; font-weight: 600; color: #17273a; }
.icon_qr { display: inline-block; width: 5px; height: 5px; background: #ee5016; border-radius: 50%; margin-right: 8px; flex-shrink: 0; }
.chev { margin-left: auto; color: #b9b9b9; font-size: 20px; transition: transform .2s; }
.chev.on { transform: rotate(90deg); }
.a { margin-top: 10px; font-size: 13px; line-height: 1.7; color: #686868; padding-left: 13px; }
</style>
