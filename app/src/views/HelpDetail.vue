<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';

const { t } = useI18n({
  useScope: 'local',
  messages: {
    en: {
      navTitle: 'Help',
      noDetails: 'No additional details for this question.',
      notFound: 'Question not found',
    },
    hi: {
      navTitle: 'सहायता',
      noDetails: 'इस प्रश्न के लिए कोई अतिरिक्त विवरण नहीं है।',
      notFound: 'प्रश्न नहीं मिला',
    },
  },
});

const route = useRoute();
const item = ref(null);
const loaded = ref(false);

// Split the answer into paragraphs so plain-text bodies render with spacing.
const paragraphs = computed(() =>
  String(item.value?.a || '')
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
);

onMounted(async () => {
  try {
    const l = (await api.help()).list || [];
    item.value = l.find((x) => String(x.id) === String(route.params.id)) || l[0] || null;
  } catch { item.value = null; }
  finally { loaded.value = true; }
});
</script>

<!-- Faithful rebuild of pages/help/help_detail (.detail): question title + rich answer body. -->
<template>
  <div class="scr">
    <NavBar :title="t('navTitle')" />
    <div class="detail">
      <template v-if="item">
        <div class="detail_title">{{ item.q }}</div>
        <div class="detail_body">
          <p v-for="(p, i) in paragraphs" :key="i">{{ p }}</p>
          <p v-if="!paragraphs.length">{{ t('noDetails') }}</p>
        </div>
      </template>
      <div v-else-if="loaded" class="detail_empty">{{ t('notFound') }}</div>
    </div>
  </div>
</template>

<style scoped>
.scr { min-height: 100vh; background: #f8f8f8; }
.detail { padding: 15px; }
.detail_title { font-size: 16px; font-weight: 700; font-family: Roboto, Roboto-Bold; color: #17273a; line-height: 1.5; }
.detail_body { margin-top: 14px; background: #fff; border-radius: 8px; padding: 16px 15px; font-size: 14px; font-family: Roboto, Roboto-Regular; color: #444; }
.detail_body p { margin: 0 0 12px; line-height: 1.8; }
.detail_body p:last-child { margin-bottom: 0; }
.detail_empty { padding: 60px 0; text-align: center; color: #b9b9b9; font-size: 13px; }
</style>
