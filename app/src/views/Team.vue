<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useToast } from '../components/useToast';

const router = useRouter();
const { toast } = useToast();
const team = ref(null);
const activeTab = ref('direct');

const invImg = '/static/image/invite/';
const downArrow = '/static/image/account/icon_Downarrow.png';

const level1 = computed(() => team.value?.levels?.find((l) => l.level === 1) || { members: 0, commission: '0.00' });
const level2 = computed(() => team.value?.levels?.find((l) => l.level === 2) || { members: 0, commission: '0.00' });
const totalCommission = computed(() =>
  (team.value?.levels || []).reduce((a, l) => a + Number(l.commission || 0), 0).toFixed(2));
const members = computed(() => team.value?.list || []);
const inviteCode = computed(() => team.value?.inviteCode || '—');

const steps = [
  { icon: invImg + 'icon_Sharelink.png', title: 'Share link' },
  { icon: invImg + 'icon_Registion.png', title: 'Friend joins' },
  { icon: invImg + 'icon_Earnrewards.png', title: 'Earn rewards' },
];

onMounted(async () => {
  try { team.value = await api.team(); } catch (e) { toast(e.message); }
});

async function copyCode() {
  try { await navigator.clipboard.writeText(inviteCode.value); toast('Copied'); }
  catch { toast(inviteCode.value); }
}
function openLevel(level) {
  activeTab.value = level;
  router.push('/team/' + level);
}
</script>

<!-- Faithful rebuild of the real pages/account/team layout + scoped CSS. -->
<template>
  <div class="team">
    <header class="team_nav">
      <NavBar title="My Team" />
      <span class="team_nav_rule" @click="router.push('/rule')">Rules</span>
    </header>

    <div class="team_top">
      <div class="team_main">
        <div class="team_main_item">
          <div class="team_main_item_title">Team Members</div>
          <div class="team_main_item_num">{{ team?.count ?? 0 }}<span>people</span></div>
        </div>
        <div class="team_main_item">
          <div class="team_main_item_title">Total Rewards</div>
          <div class="team_main_item_num">{{ totalCommission }}<span>₹</span></div>
        </div>
      </div>

      <div class="team_personal">
        <div class="team_personal_item">Direct<span>{{ level1.members }}</span></div>
        <div class="team_personal_line">|</div>
        <div class="team_personal_item">Reward ₹<span>{{ level1.commission }}</span></div>
      </div>
      <div class="team_direct">
        <div class="team_direct_item">Indirect<span>{{ level2.members }}</span></div>
        <div class="team_direct_line">|</div>
        <div class="team_direct_item">Reward ₹<span>{{ level2.commission }}</span></div>
      </div>
    </div>

    <div class="team_invite">
      <div class="team_invite_step">
        <div v-for="s in steps" :key="s.title" class="team_invite_step_item">
          <div class="team_invite_step_item_icon"><img :src="s.icon" alt="" /></div>
          <div class="team_invite_step_item_title">{{ s.title }}</div>
        </div>
      </div>
      <div class="team_invite_url">
        <div class="team_invite_url_title">Invite Code</div>
        <div class="team_invite_url_main">
          <div class="team_invite_url_main_link">{{ inviteCode }}</div>
          <div class="team_invite_url_main_btn" @click="copyCode">Copy</div>
        </div>
      </div>
      <button class="team_invite_button" @click="router.push('/invitation')">Invite Friends</button>
    </div>

    <div class="team_list">
      <div class="team_list_tab">
        <div class="team_list_tab_item" @click="openLevel('direct')">
          <div class="team_list_tab_item_title" :class="{ item_active: activeTab === 'direct' }">Direct</div>
          <img v-if="activeTab === 'direct'" :src="downArrow" alt="" />
        </div>
        <div class="team_list_tab_item" @click="openLevel('indirect')">
          <div class="team_list_tab_item_title" :class="{ item_active: activeTab === 'indirect' }">Indirect</div>
          <img v-if="activeTab === 'indirect'" :src="downArrow" alt="" />
        </div>
      </div>

      <div class="team_list_content">
        <div class="team_list_content_ranking">
          <div class="item">Member</div>
          <div class="item">Reward</div>
        </div>
        <template v-if="members.length">
          <div v-for="(m, i) in members" :key="i" class="team_list_content_item">
            <div class="team_list_content_item_left">
              <div class="rank">
                <div class="rank_user">
                  <div class="title">{{ m.nickname || m.name || 'Member' }}</div>
                  <div class="time">{{ m.date || '' }}</div>
                </div>
              </div>
            </div>
            <div class="team_list_content_item_right">₹{{ m.commission || '0.00' }}</div>
          </div>
        </template>
        <div v-else class="team_empty">No team members yet</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Frame-relative width: 100vw is the full viewport (390px) and pushes the header/top past the 375 frame's right edge. */
.team { background-image: url('/static/image/account/bg_myteam.png'); background-size: 100%; background-repeat: no-repeat; width: 100%; min-height: 100vh; padding-bottom: 10px; background-color: #f9f9f9; }
.team .team_nav { position: relative; color: #fff; }
.team .team_nav :deep(.navbar) { background: transparent; color: #fff; }
.team .team_nav .team_nav_rule { position: absolute; top: 0; right: 29px; height: 44px; line-height: 44px; font-size: 14px; font-family: 'PingFang SC', 'PingFang SC-Bold'; font-weight: 700; color: #fff; z-index: 2; }
.team .team_top { height: 220px; border: 1px solid transparent !important; }
.team .team_main { margin-top: 22px; font-family: Roboto, Roboto-Bold; display: flex; align-items: center; justify-content: flex-start; font-weight: 700; color: #fff; text-align: center; padding-left: 41px; }
.team .team_main .team_main_item .team_main_item_title { font-size: 18px; height: 24px; }
.team .team_main .team_main_item .team_main_item_num { margin-top: 6px; font-size: 20px; height: 24px; line-height: 24px; }
.team .team_main .team_main_item .team_main_item_num span { margin-left: 6px; font-size: 14px; opacity: 0.8; }
.team .team_main .team_main_item:nth-child(2) { margin-left: 24px; }
.team .team_personal { margin-top: 38px; padding-left: 25px; font-size: 13px; font-family: Roboto, Roboto-Medium; font-weight: 500; color: #fff; display: flex; align-items: center; justify-content: flex-start; }
.team .team_personal .team_personal_line { margin: 0 13px; opacity: 0.8; height: 24px; line-height: 24px; }
.team .team_personal .team_personal_item { height: 24px; line-height: 24px; }
.team .team_personal .team_personal_item span { padding-left: 2px; }
.team .team_direct { margin-top: 15px; font-size: 13px; font-family: Roboto, Roboto-Medium; font-weight: 500; color: #fff; padding-left: 62px; display: flex; align-items: center; justify-content: flex-start; }
.team .team_direct .team_direct_line { height: 24px; line-height: 24px; opacity: 0.8; margin: 0 50px; }
.team .team_direct .team_direct_item { height: 24px; line-height: 24px; }
.team .team_direct .team_direct_item span { margin-left: 2px; }
.team .team_invite { padding: 8px 15px 21px 15px; background-color: #fff; margin: 0 10px; border-radius: 8px; }
.team .team_invite .team_invite_step { margin-top: 25px; display: flex; align-items: center; justify-content: space-between; }
.team .team_invite .team_invite_step .team_invite_step_item { display: flex; align-items: center; justify-content: center; flex-direction: column; }
.team .team_invite .team_invite_step .team_invite_step_item .team_invite_step_item_icon { width: 40px; height: 40px; }
.team .team_invite .team_invite_step .team_invite_step_item .team_invite_step_item_icon img { width: 100%; height: 100%; object-fit: contain; }
.team .team_invite .team_invite_step .team_invite_step_item .team_invite_step_item_title { margin-top: 7px; font-size: 13px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #566c82; }
.team .team_invite .team_invite_url { margin-top: 21px; display: flex; align-items: center; justify-content: flex-start; }
.team .team_invite .team_invite_url .team_invite_url_title { opacity: 0.9; font-size: 14px; font-family: 'PingFang SC', 'PingFang SC-Medium'; font-weight: 500; color: #566c82; }
.team .team_invite .team_invite_url .team_invite_url_main { margin-left: 31px; flex: 1; max-width: 228px; height: 34px; background: rgba(143, 148, 180, 0.1); border-radius: 4px; padding: 0 9px 0 8px; display: flex; align-items: center; justify-content: space-between; }
.team .team_invite .team_invite_url .team_invite_url_main .team_invite_url_main_link { max-width: 165px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 14px; font-family: 'PingFang SC', 'PingFang SC-Medium'; font-weight: 500; color: #8f94b4; }
.team .team_invite .team_invite_url .team_invite_url_main .team_invite_url_main_btn { font-size: 14px; font-family: 'PingFang SC', 'PingFang SC-Medium'; font-weight: 500; color: #58a5ff; }
.team .team_invite .team_invite_button { margin-top: 17px; width: 100%; height: 42px; border-radius: 21px; border: none; background: #ee5016; color: #fff; font-size: 16px; font-weight: 700; }
.team .team_list { margin-top: 8px; }
.team .team_list .team_list_tab { background-color: #fff; height: 49px; display: flex; align-items: center; justify-content: space-around; font-family: Roboto, Roboto-Medium; font-weight: 500; letter-spacing: 0px; }
.team .team_list .team_list_tab .team_list_tab_item { display: flex; align-items: center; justify-content: center; flex-direction: column; }
.team .team_list .team_list_tab .team_list_tab_item .team_list_tab_item_title { color: #b9b9b9; }
.team .team_list .team_list_tab .team_list_tab_item .item_active { color: #17273a; }
.team .team_list .team_list_tab .team_list_tab_item img { margin-top: 3px; width: 14px; height: 5px; }
.team .team_list .team_list_content { margin-top: 4px; background-color: #fff; }
.team .team_list .team_list_content .team_list_content_ranking { padding: 11px 13px 0 15px; display: flex; align-items: center; justify-content: space-between; }
.team .team_list .team_list_content .team_list_content_ranking .item { font-size: 13px; font-family: Roboto, Roboto-Regular; font-weight: 400; text-align: center; color: #b9b9b9; letter-spacing: 0px; }
.team .team_list .team_list_content .team_list_content_item { margin: 0 14px; padding: 14px 0; border-bottom: 1px solid #f9f9f9; display: flex; align-items: center; justify-content: space-between; }
.team .team_list .team_list_content .team_list_content_item .team_list_content_item_left .rank { display: flex; align-items: center; justify-content: flex-start; }
.team .team_list .team_list_content .team_list_content_item .team_list_content_item_left .rank .rank_user { margin-left: 12px; }
.team .team_list .team_list_content .team_list_content_item .team_list_content_item_left .rank .rank_user .title { font-size: 14px; font-family: Roboto, Roboto-Medium; font-weight: 500; color: #17273a; letter-spacing: 0px; }
.team .team_list .team_list_content .team_list_content_item .team_list_content_item_left .rank .rank_user .time { margin-top: 2px; font-size: 13px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #b9b9b9; }
.team .team_list .team_list_content .team_list_content_item .team_list_content_item_right { font-size: 14px; font-family: Roboto, Roboto-Medium; font-weight: 500; color: #ff5c5c; }
.team .team_list .team_list_content .team_empty { padding: 40px 0; text-align: center; color: #b9b9b9; font-size: 13px; }
</style>
