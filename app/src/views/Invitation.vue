<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { api } from '../api/client';
import { useToast } from '../components/useToast';

const router = useRouter();
const { t } = useI18n();
const { toast } = useToast();
const code = ref('');
const team = ref(null);
const tab = ref('records'); // records | rules

onMounted(async () => {
  code.value = (await api.invite()).inviteCode;
  try { team.value = await api.team(); } catch { /* ignore */ }
});

const invited = computed(() => team.value?.count ?? 0);
const earned = computed(() =>
  team.value?.levels?.reduce((a, l) => a + Number(l.commission), 0).toFixed(2) ?? '0.00');
// Records feed: backend returns an empty list, so fall back to per-level rows when present.
const records = computed(() => team.value?.list?.length ? team.value.list : []);

const rules = [
  'Share your invite link or code with friends.',
  'They register a new ORich account using your code.',
  'When they join a group-buy or recharge, you earn commission.',
  'Commission is credited to your wallet automatically.',
];

async function copy() {
  try { await navigator.clipboard.writeText(code.value); toast(t('invite.copy') + ' ✓'); }
  catch { toast(code.value); }
}
</script>

<!-- Faithful rebuild of the real pages/invitation/invitation: red hero, earn card, 3-step
     how-it-works and the Rules / Records tabbed card. -->
<template>
  <div class="invitation">
    <header class="inav">{{ t('invite.title') }}</header>

    <div class="middle_rule" @click="router.push('/rule')">
      <div class="middle_rule_item"><span class="middle_rule_item_title">Rules</span>›</div>
    </div>

    <div class="hero">
      <img src="/static/image/invite/icon_Earnrewards.png" alt="" onerror="this.style.display='none'" />
      <div class="hero-text">{{ t('invite.tip') }}</div>
    </div>

    <div class="middle_invited">
      <div class="earn">
        <div class="earn_left">
          <div class="inv">{{ t('invite.invited') }}</div>
          <div class="inv_bom"><span class="unum">{{ invited }}</span><span class="people">people</span></div>
        </div>
        <div class="earn_right">
          <div class="rew">{{ t('invite.earned') }}</div>
          <div class="rew_bom"><span class="mark">₹</span><span class="nums">{{ earned }}</span></div>
        </div>
      </div>
      <div class="mylink">
        <span class="my">{{ t('invite.yourCode') }}</span>
        <div class="bg"><span class="msg">{{ code || '—' }}</span><span class="copy" @click="copy">{{ t('invite.copy') }}</span></div>
      </div>
      <button class="invite_btn" @click="copy">{{ t('invite.share') }}</button>
    </div>

    <!-- how it works: 3 steps -->
    <div class="middle_reg">
      <div class="middle_top">
        <div class="link_img"><img src="/static/image/invite/icon_Sharelink.png" alt="" /></div>
        <div class="point"></div>
        <div class="reg_img"><img src="/static/image/invite/icon_Registion.png" alt="" /></div>
        <div class="point"></div>
        <div class="earn_img"><img src="/static/image/invite/icon_Earnrewards.png" alt="" /></div>
      </div>
      <div class="middle_bottom">
        <div class="link_text">Share link</div>
        <div class="reg_text">Register</div>
        <div class="earn_text">Earn rewards</div>
      </div>
    </div>

    <!-- Rules / Records tabbed card -->
    <div class="bottom">
      <div class="tab_item">
        <div class="item_left" @click="tab = 'rules'">
          <span :class="tab === 'rules' ? 'tab_rec' : 'tab_rul'">Rules</span>
          <i v-if="tab === 'rules'"></i>
        </div>
        <div class="item_right" @click="tab = 'records'">
          <span :class="tab === 'records' ? 'tab_rec' : 'tab_rul'">Records</span>
          <i v-if="tab === 'records'"></i>
        </div>
      </div>

      <template v-if="tab === 'records'">
        <template v-if="records.length">
          <div v-for="(r, i) in records" :key="i" class="tabs">
            <div class="tabs_rank">
              <div class="tabs_rank_num">{{ i + 1 }}</div>
              <div class="tabs_left">
                <div class="tabs_user"><span>{{ r.name || r.phone || 'Member' }}</span></div>
                <div class="tabs_time">{{ r.date || r.time || '' }}</div>
              </div>
            </div>
            <div class="tabs_right">
              <span class="tabs_num">+₹{{ r.commission ?? r.reward ?? '0.00' }}</span>
            </div>
          </div>
        </template>
        <div v-else class="empty">No referral records yet. Invite friends to get started!</div>
      </template>

      <div v-else class="rule-box">
        <div v-for="(r, i) in rules" :key="i" class="rule-row"><span class="dot">{{ i + 1 }}</span>{{ r }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.invitation { width: 100vw; min-height: 100vh; background-image: url('/static/image/invite/invite_bg.png'); background-size: 100%; background-repeat: no-repeat; background-color: #fe5541; padding-bottom: 20px; }
.inav { height: 44px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; font-weight: 700; }
.middle_rule { display: flex; align-items: center; justify-content: flex-end; margin-top: 10px; }
.middle_rule_item { height: 31px; padding: 0 12px 0 17px; background: #ffeda8; border-radius: 100px 0 0 100px; box-shadow: 0 0 11px 0 rgba(250,104,75,.5); display: flex; align-items: center; color: #fe6232; }
.middle_rule_item_title { font-size: 14px; font-weight: 500; color: #fe6232; margin-right: 4px; }
.hero { text-align: center; padding: 6px 20px 18px; }
.hero img { width: 56px; margin: 0 auto 10px; }
.hero-text { color: #ffe3dd; font-size: 14px; line-height: 1.6; }
.middle_invited { margin: 0 10px; background: #fff; border-radius: 8px; box-shadow: 0 0 7px 0 rgba(0,0,0,.05); padding: 20px 18px; }
.earn { display: flex; }
.earn_left, .earn_right { display: flex; flex: 1; flex-direction: column; align-items: center; }
.inv, .rew { font-size: 16px; color: #17273a; }
.inv_bom, .rew_bom { display: flex; align-items: center; margin-top: 8px; }
.unum, .nums { font-size: 20px; font-weight: 500; color: #ee5016; }
.unum { margin-right: 8px; }
.nums { margin-left: 8px; }
.people, .mark { font-size: 16px; color: #b9b9b9; }
.mylink { display: flex; align-items: center; margin-top: 22px; }
.my { margin-right: 9px; font-size: 15px; color: #17273a; }
.bg { flex: 1; display: flex; align-items: center; justify-content: space-between; padding: 11px 13px; height: 38px; background: #f5f5f5; border-radius: 8px; box-sizing: border-box; }
.msg { font-size: 14px; color: #7d7d7d; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 700; letter-spacing: 1px; }
.copy { font-size: 14px; color: #649dff; flex-shrink: 0; margin-left: 8px; }
.invite_btn { margin-top: 19px; width: 100%; height: 42px; border-radius: 21px; background: #ee5016; color: #fff; font-size: 16px; font-weight: 700; }

/* how it works */
.middle_reg { margin: 9px 10px 0; padding: 0 0 16px; background: #fff; border-radius: 8px; box-shadow: 0 0 7px 0 rgba(0,0,0,.05); position: relative; }
.middle_top { display: flex; align-items: center; }
.link_img, .reg_img, .earn_img { display: flex; justify-content: center; align-items: center; margin-top: 18px; width: 40px; height: 40px; background: #ffe6e2; border-radius: 50%; }
.link_img img, .reg_img img, .earn_img img { width: 60%; height: 60%; object-fit: contain; }
.link_img { margin-left: 19px; margin-right: 16px; }
.reg_img { margin-left: 20px; margin-right: 18px; }
.earn_img { margin-left: 18px; }
.point { margin-top: 38px; flex: 1; height: 2px; opacity: .3; border-top: 1px dashed #de6436; }
.middle_bottom { display: flex; }
.link_text, .reg_text, .earn_text { margin-top: 7px; font-size: 13px; color: #566c82; }
.link_text { margin-left: 21px; }
.reg_text { margin-left: 97px; }
.earn_text { margin-left: 50px; }

/* records / rules */
.bottom { margin: 8px 10px 20px; padding-bottom: 13px; background: #fff; border-radius: 8px; box-shadow: 0 0 7px 0 rgba(0,0,0,.05); }
.tab_item { display: flex; }
.item_left, .item_right { display: flex; flex: 1; align-items: center; flex-direction: column; margin-top: 16px; cursor: pointer; }
.item_left i, .item_right i { margin-top: 6px; width: 14px; height: 5px; border-radius: 3px; background: #ee5016; }
.tab_rul { font-size: 14px; font-weight: 500; color: #b9b9b9; }
.tab_rec { font-size: 16px; font-weight: 500; color: #17273a; }
.tabs { display: flex; justify-content: space-between; margin: 7px 13px 0; padding-bottom: 11px; border-bottom: .5px solid #ececec; }
.tabs_rank { display: flex; align-items: center; justify-content: flex-start; }
.tabs_rank_num { width: 21px; height: 21px; line-height: 21px; background: #ffe6e2; border-radius: 50%; text-align: center; font-size: 14px; font-weight: 500; color: #fc573b; margin-right: 12px; flex-shrink: 0; }
.tabs_left { display: flex; flex-direction: column; }
.tabs_right { display: flex; align-items: center; }
.tabs_user { font-size: 14px; color: #17273a; display: flex; align-items: center; }
.tabs_user span { margin-right: 8px; }
.tabs_time { margin-top: 8px; font-size: 13px; color: #b9b9b9; }
.tabs_num { font-size: 16px; font-weight: 500; color: #ee5016; margin-right: 2px; }
.rule-box { padding: 12px 15px 0; }
.rule-row { display: flex; align-items: flex-start; font-size: 13px; color: #566c82; line-height: 1.6; margin-bottom: 10px; }
.rule-row .dot { flex-shrink: 0; width: 18px; height: 18px; line-height: 18px; text-align: center; border-radius: 50%; background: #ffe6e2; color: #fc573b; font-size: 12px; margin-right: 8px; }
.empty { text-align: center; color: #b9b9b9; font-size: 13px; padding: 20px 15px; }
</style>
