<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useToast } from '../components/useToast';

const { t } = useI18n();
const { toast } = useToast();
const code = ref('');
const team = ref(null);

onMounted(async () => {
  const data = await api.invite();
  code.value = data.inviteCode;
  try { team.value = await api.team(); } catch { /* ignore */ }
});

async function copy() {
  try { await navigator.clipboard.writeText(code.value); toast(t('invite.copy') + ' ✓'); }
  catch { toast(code.value); }
}
</script>

<template>
  <div class="page">
    <NavBar :title="t('invite.title')" />
    <div class="hero">
      <img src="/static/image/home/icon_Invite.png" alt="" />
      <p>{{ t('invite.tip') }}</p>
    </div>

    <div class="codecard card">
      <span class="muted">{{ t('invite.yourCode') }}</span>
      <div class="codeval">{{ code || '—' }}</div>
      <button class="btn" @click="copy">{{ t('invite.copy') }}</button>
    </div>

    <div v-if="team" class="levels card">
      <div v-for="l in team.levels" :key="l.level" class="lrow">
        <span>Level {{ l.level }}</span>
        <span class="muted">{{ l.members }} members</span>
        <span class="price">₹{{ l.commission }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero { text-align: center; padding: 24px 20px 8px; }
.hero img { width: 72px; height: 72px; margin: 0 auto 12px; object-fit: contain; }
.hero p { color: var(--muted); font-size: 14px; line-height: 1.6; margin: 0; }
.codecard { margin: 12px; padding: 20px; text-align: center; }
.codeval { font-size: 28px; font-weight: 800; letter-spacing: 2px; color: var(--brand-dark); margin: 10px 0 16px; }
.levels { margin: 0 12px; padding: 4px 16px; }
.lrow { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid var(--line); font-size: 14px; }
.lrow:last-child { border-bottom: none; }
</style>
