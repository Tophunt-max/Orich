<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { api } from '../api/client';

const { t } = useI18n();
const router = useRouter();
const list = ref([]);
const open = ref(0);
const keyword = ref('');

const faqIcon = '/static/image/icon_faq.png';

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase();
  if (!k) return list.value;
  return list.value.filter(
    (f) => (f.q || '').toLowerCase().includes(k) || (f.a || '').toLowerCase().includes(k)
  );
});

onMounted(async () => {
  try { list.value = (await api.help()).list || []; } catch { list.value = []; }
});

function toggle(i) { open.value = open.value === i ? -1 : i; }
</script>

<!-- Faithful rebuild of the real pages/help/help: FAQ banner, help_main card,
     search, collapsible question list (u-collapse-item + help_main_item icon/content). -->
<template>
  <div class="help">
    <div class="help_top"><header class="hnav">{{ t('account.help') }}</header></div>

    <div class="help_main">
      <div class="help_main_title">
        <span class="help_main_title_name">FAQ</span>
        <span class="help_main_title_url">orich.in</span>
      </div>

      <div class="help_search">
        <span class="help_search_icon">🔍</span>
        <input v-model="keyword" class="help_search_input" placeholder="Search questions" />
      </div>

      <div class="mar_bottom">
        <div v-for="(f, i) in filtered" :key="f.id ?? i" class="u-collapse-item">
          <div class="help_main_item" @click="toggle(i)">
            <div class="help_main_item_icon">
              <div class="help_main_item_icon_url"><img :src="faqIcon" alt="" /></div>
              <div class="help_main_item_icon_title">Q{{ i + 1 }}</div>
            </div>
            <div class="help_main_item_content">
              <div class="iconb">
                <span class="icon_qr"></span>
                <span class="q_text">{{ f.q }}</span>
                <span class="chev" :class="{ on: open === i }">›</span>
              </div>
              <div v-if="open === i" class="a">{{ f.a }}</div>
              <div v-if="open === i && f.id != null" class="more" @click.stop="router.push('/help/' + f.id)">
                View details ›
              </div>
            </div>
          </div>
        </div>

        <div v-if="!filtered.length" class="help_empty">No matching questions</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.help { padding-bottom: 15px; min-height: 100vh; background: #f6f6f6; }
.help_top { width: 100%; height: 196px; background: url('/static/image/faq/bg_FAQ.png') no-repeat; background-size: cover; background-color: #ee5016; }
.hnav { height: 44px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; font-weight: 700; }
.help_main { background: #fff; margin-top: -23px; border-radius: 30px 30px 0 0; min-height: calc(100vh - 173px); width: 100%; padding-top: 20px; }
.help_main_title { width: 100%; padding: 15px 15px 10px 15px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e9ecef; }
.help_main_title_name { font-weight: 700; font-size: 16px; color: #17273a; }
.help_main_title_url { font-size: 12px; color: #dcdcdc; }

.help_search { margin: 12px 15px 4px; display: flex; align-items: center; height: 38px; padding: 0 12px; background: #f4f5f7; border-radius: 19px; }
.help_search_icon { font-size: 13px; opacity: 0.6; margin-right: 6px; }
.help_search_input { flex: 1; border: none; outline: none; background: transparent; font-size: 14px; color: #17273a; }

.u-collapse-item { border-bottom: 1px solid #e9ecef; }
.u-collapse-item:last-child { border-bottom: none; }
.help_main_item { display: flex; align-items: flex-start; justify-content: flex-start; width: 100%; padding: 10px; }
.help_main_item_icon { width: 35%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 10px; }
.help_main_item_icon_url { width: 30px; height: 30px; }
.help_main_item_icon_url img { width: 100%; height: 100%; object-fit: contain; }
.help_main_item_icon_title { margin-top: 5px; text-align: center; color: #a9a9a9; font-size: 12px; }
.help_main_item_content { width: 65%; }
.iconb { display: flex; align-items: center; }
.icon_qr { display: inline-block; width: 5px; height: 5px; background: #a9a9a9; border-radius: 50%; margin-right: 4px; opacity: 0.4; flex-shrink: 0; }
.q_text { flex: 1; font-size: 14px; font-weight: 600; color: #17273a; }
.chev { margin-left: 6px; color: #b9b9b9; font-size: 20px; transition: transform 0.2s; }
.chev.on { transform: rotate(90deg); }
.a { margin-top: 10px; font-size: 13px; line-height: 1.7; color: #686868; }
.more { margin-top: 8px; font-size: 13px; color: #58a5ff; }
.mar_bottom { margin-bottom: 25px; }
.help_empty { padding: 40px 0; text-align: center; color: #b9b9b9; font-size: 13px; }
</style>
