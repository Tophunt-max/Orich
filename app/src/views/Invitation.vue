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
  code.value = (await api.invite()).inviteCode;
  try { team.value = await api.team(); } catch { /* ignore */ }
});

async function copy() {
  try { await navigator.clipboard.writeText(code.value); toast(t('invite.copy') + ' ✓'); }
  catch { toast(code.value); }
}
</script>

<!-- Faithful rebuild of the real pages/invitation/invitation (red hero + white earn card). -->
<template>
  <div class="invitation">
    <header class="inav">{{ t('invite.title') }}</header>
    <div class="hero">
      <img src="/static/image/login/icon_invitation.png" alt="" onerror="this.style.display='none'" />
      <div class="hero-text">{{ t('invite.tip') }}</div>
    </div>

    <div class="middle_invited">
      <div class="earn">
        <div class="earn_col">
          <div class="label">{{ t('invite.invited') }}</div>
          <div class="nums">{{ team?.count ?? 0 }}</div>
        </div>
        <div class="earn_col">
          <div class="label">{{ t('invite.earned') }}</div>
          <div class="nums">₹{{ team?.levels?.reduce((a, l) => a + Number(l.commission), 0).toFixed(2) ?? '0.00' }}</div>
        </div>
      </div>
      <div class="mylink">
        <span class="my">{{ t('invite.yourCode') }}</span>
        <div class="bg"><span class="msg">{{ code || '—' }}</span><span class="copy" @click="copy">{{ t('invite.copy') }}</span></div>
      </div>
      <button class="invite_btn" @click="copy">{{ t('invite.share') }}</button>
    </div>

    <div v-if="team" class="levels">
      <div v-for="l in team.levels" :key="l.level" class="lrow">
        <span>Level {{ l.level }}</span><span class="g">{{ l.members }} members</span><span class="p">₹{{ l.commission }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.invitation { width: 100%; min-height: 100vh; background-color: #fe5541; padding-bottom: 20px; }
.inav { height: 44px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; font-weight: 700; }
.hero { text-align: center; padding: 10px 20px 24px; }
.hero img { width: 64px; margin: 0 auto 10px; }
.hero-text { color: #ffe3dd; font-size: 14px; line-height: 1.6; }
.middle_invited { margin: 0 10px; background: #fff; border-radius: 8px; box-shadow: 0 0 7px 0 rgba(0,0,0,.05); padding: 20px 18px; }
.earn { display: flex; }
.earn_col { flex: 1; display: flex; flex-direction: column; align-items: center; }
.earn_col .label { font-size: 16px; color: #17273a; }
.nums { font-size: 20px; font-weight: 500; color: #ee5016; margin-top: 8px; }
.mylink { display: flex; align-items: center; margin-top: 22px; }
.my { margin-right: 9px; font-size: 15px; color: #17273a; }
.bg { flex: 1; display: flex; align-items: center; justify-content: space-between; padding: 11px 13px; height: 38px; background: #f5f5f5; border-radius: 8px; }
.msg { font-size: 14px; color: #7d7d7d; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 700; letter-spacing: 1px; }
.copy { font-size: 14px; color: #649dff; flex-shrink: 0; margin-left: 8px; }
.invite_btn { margin-top: 19px; width: 100%; height: 42px; border-radius: 21px; background: #ee5016; color: #fff; font-size: 16px; font-weight: 700; }
.levels { margin: 12px 10px 0; background: #fff; border-radius: 8px; padding: 4px 16px; }
.lrow { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #f2f2f2; font-size: 14px; }
.lrow:last-child { border-bottom: none; }
.lrow .g { color: #b9b9b9; }
.lrow .p { color: #ee5016; font-weight: 600; }
</style>
