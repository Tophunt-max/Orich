<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';

const { t } = useI18n({
  useScope: 'local',
  messages: {
    en: {
      directTitle: 'Direct Members',
      indirectTitle: 'Indirect Members',
      level1: 'Level 1',
      level2: 'Level 2',
      members: 'Members',
      rewards: 'Rewards',
      direct: 'Direct',
      indirect: 'Indirect',
      member: 'Member',
      team: 'Team',
      recharge: 'Recharge',
      reward: 'Reward',
      noMembers: 'No members at this level yet',
      commissionRecords: 'Commission records',
      noCommission: 'No commission records yet',
    },
    hi: {
      directTitle: 'प्रत्यक्ष सदस्य',
      indirectTitle: 'अप्रत्यक्ष सदस्य',
      level1: 'स्तर 1',
      level2: 'स्तर 2',
      members: 'सदस्य',
      rewards: 'इनाम',
      direct: 'प्रत्यक्ष',
      indirect: 'अप्रत्यक्ष',
      member: 'सदस्य',
      team: 'टीम',
      recharge: 'रिचार्ज',
      reward: 'इनाम',
      noMembers: 'इस स्तर पर अभी कोई सदस्य नहीं',
      commissionRecords: 'कमीशन रिकॉर्ड',
      noCommission: 'अभी तक कोई कमीशन रिकॉर्ड नहीं',
    },
  },
});

const route = useRoute();
const router = useRouter();
const level = computed(() => (route.params.level === 'indirect' ? 'indirect' : 'direct'));
const title = computed(() => (level.value === 'indirect' ? t('indirectTitle') : t('directTitle')));
const wantedLevel = computed(() => (level.value === 'indirect' ? 2 : 1));

const teamData = ref(null);
const inviteData = ref(null);
const rebates = ref([]);
const avatarFallback = '/static/image/home/icon_multiuser.png';

const summary = computed(() =>
  teamData.value?.levels?.find((l) => l.level === wantedLevel.value) || { members: 0, commission: '0.00' });

// Derived reactively so the Direct/Indirect tab updates without refetching.
const members = computed(() => {
  const list = (teamData.value?.list || []).filter((m) => !m.level || m.level === wantedLevel.value);
  if (list.length) return list;
  return inviteData.value?.list || [];
});

onMounted(async () => {
  try { teamData.value = await api.team(); } catch { /* ignore */ }
  try { inviteData.value = await api.invite(); } catch { /* ignore */ }
  try { const r = await api.rebateList(); rebates.value = r?.list || []; } catch { /* ignore */ }
});

function switchLevel(l) {
  if (l !== level.value) router.push('/team/' + l);
}
</script>

<!-- Faithful rebuild of the real pages/account/teamDetail layout + scoped CSS. -->
<template>
  <div class="detail">
    <NavBar :title="title" />

    <div class="detail_count">
      <div class="detail_count_march">
        <div class="detail_count_march_item">
          <span class="detail_count_march_title">{{ title }}</span>
          <span class="detail_count_march_select">{{ level === 'indirect' ? t('level2') : t('level1') }}</span>
        </div>
      </div>
      <div class="detail_count_money">
        <div class="detail_count_money_item">
          <div class="money">{{ summary.members }}</div>
          <div class="title">{{ t('members') }}</div>
        </div>
        <div class="detail_count_money_item">
          <div class="money">₹{{ summary.commission }}</div>
          <div class="title">{{ t('rewards') }}</div>
        </div>
      </div>
    </div>

    <div class="detail_tab">
      <div class="detail_list_tab">
        <div class="detail_list_tab_item" @click="switchLevel('direct')">
          <div class="detail_list_tab_item_title" :class="{ item_active: level === 'direct' }">{{ t('direct') }}</div>
        </div>
        <div class="detail_list_tab_item" @click="switchLevel('indirect')">
          <div class="detail_list_tab_item_title" :class="{ item_active: level === 'indirect' }">{{ t('indirect') }}</div>
        </div>
      </div>

      <div class="detail_list_content">
        <template v-if="members.length">
          <div v-for="(m, i) in members" :key="i" class="detail_list_content_item">
            <div class="detail_list_content_item_user">
              <div class="detail_list_content_item_avatar">
                <img :src="m.avatar || avatarFallback" alt="" />
              </div>
              <div class="detail_list_content_item_name">{{ m.nickname || m.name || t('member') }}</div>
              <div v-if="m.vip" class="detail_list_content_item_vipimg">VIP</div>
              <div class="detail_list_content_item_team">
                {{ t('team') }}<span>{{ m.teamCount ?? 0 }}</span>
              </div>
            </div>
            <div class="detail_list_content_item_count">
              <div class="detail_list_content_item_count_tab">
                <div>{{ t('recharge') }}</div>
                <div class="money">₹{{ m.recharge || '0.00' }}</div>
              </div>
              <div class="detail_list_content_item_count_tab">
                <div>{{ t('reward') }}</div>
                <div class="money">₹{{ m.commission || '0.00' }}</div>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="detail_empty">{{ t('noMembers') }}</div>
      </div>
    </div>

    <!-- Commission records (api.rebateList) -->
    <div class="rebate">
      <div class="rebate_head">{{ t('commissionRecords') }}</div>
      <div class="rebate_list">
        <template v-if="rebates.length">
          <div v-for="(r, i) in rebates" :key="i" class="rebate_item">
            <div class="rebate_item_left">
              <div class="rebate_item_name">{{ r.name || t('member') }}</div>
              <div class="rebate_item_meta">
                <span class="rebate_badge" :class="(r.level === 'Indirect') ? 'indirect' : 'direct'">{{ r.level || t('direct') }}</span>
                <span class="rebate_date">{{ r.date || '' }}</span>
              </div>
            </div>
            <div class="rebate_item_amount">+₹{{ r.amount ?? '0.00' }}</div>
          </div>
        </template>
        <div v-else class="detail_empty">{{ t('noCommission') }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail { width: 100%; background: #f9f9f9; min-height: 100vh; }
.detail .detail_count { margin: 6px auto 0; padding: 0 17px 0 15px; width: 100%; height: 117px; background-image: url('/static/image/account/bg_reward.png'); background-size: 343px 117px; background-repeat: no-repeat; background-position: 15px; }
.detail .detail_count .detail_count_march { display: flex; align-items: center; justify-content: space-between; padding-top: 17px; padding-left: 13px; padding-right: 26px; }
.detail .detail_count .detail_count_march .detail_count_march_item { display: flex; align-items: center; justify-content: flex-start; }
.detail .detail_count .detail_count_march .detail_count_march_title { font-size: 18px; font-family: Roboto, Roboto-Bold; font-weight: 700; color: #fff; }
.detail .detail_count .detail_count_march .detail_count_march_select { margin-left: 13px; font-size: 14px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #fff; position: relative; }
.detail .detail_count .detail_count_money { padding: 0 26px 0 27px; margin-top: 16px; display: flex; align-items: center; justify-content: space-between; }
.detail .detail_count .detail_count_money .detail_count_money_item { display: flex; align-items: center; justify-content: center; flex-direction: column; white-space: nowrap; }
.detail .detail_count .detail_count_money .detail_count_money_item .money { font-size: 18px; font-family: Roboto, Roboto-Bold; font-weight: 700; color: #fff; }
.detail .detail_count .detail_count_money .detail_count_money_item .title { margin-top: 8px; font-size: 13px; font-family: Roboto, Roboto-Medium; font-weight: 500; color: #fff; }
.detail .detail_tab { margin-top: 12px; }
.detail .detail_tab .detail_list_tab { background-color: #fff; height: 49px; display: flex; align-items: center; justify-content: space-around; font-family: Roboto, Roboto-Medium; font-weight: 500; letter-spacing: 0px; }
.detail .detail_tab .detail_list_tab .detail_list_tab_item { display: flex; align-items: center; justify-content: center; flex-direction: column; cursor: pointer; }
.detail .detail_tab .detail_list_tab .detail_list_tab_item .detail_list_tab_item_title { color: #b9b9b9; }
.detail .detail_tab .detail_list_tab .detail_list_tab_item .item_active { color: #17273a; }
.detail .detail_tab .detail_list_content { margin-top: 4px; background-color: #fff; }
.detail .detail_tab .detail_list_content .detail_list_content_item { padding: 15px 0; margin-right: 15px; margin-left: 15px; border-bottom: 1px solid #f9f9f9; }
.detail .detail_tab .detail_list_content .detail_list_content_item .detail_list_content_item_user { display: flex; align-items: center; justify-content: flex-start; }
.detail .detail_tab .detail_list_content .detail_list_content_item .detail_list_content_item_user .detail_list_content_item_avatar { width: 32px; height: 32px; border-radius: 50%; overflow: hidden; }
.detail .detail_tab .detail_list_content .detail_list_content_item .detail_list_content_item_user .detail_list_content_item_avatar img { width: 100%; height: 100%; object-fit: cover; }
.detail .detail_tab .detail_list_content .detail_list_content_item .detail_list_content_item_user .detail_list_content_item_name { margin-left: 7px; font-size: 14px; font-family: Roboto, Roboto-Medium; font-weight: 500; color: #17273a; letter-spacing: 0px; max-width: 100px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.detail .detail_tab .detail_list_content .detail_list_content_item .detail_list_content_item_user .detail_list_content_item_vipimg { margin-left: 8px; padding: 2px 8px; border-radius: 4px; background: linear-gradient(111deg, #ffe44b, #fea326); color: #9c4d08; font-size: 11px; font-weight: 700; }
.detail .detail_tab .detail_list_content .detail_list_content_item .detail_list_content_item_user .detail_list_content_item_team { margin-left: 19px; font-size: 14px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #17273a; letter-spacing: 0px; }
.detail .detail_tab .detail_list_content .detail_list_content_item .detail_list_content_item_user .detail_list_content_item_team span { color: #ff5c5c; margin: 0 3px; }
.detail .detail_tab .detail_list_content .detail_list_content_item .detail_list_content_item_count { margin-top: 16px; padding-left: 13px; padding-right: 16px; display: flex; align-items: center; justify-content: space-between; }
.detail .detail_tab .detail_list_content .detail_list_content_item .detail_list_content_item_count .detail_list_content_item_count_tab { display: flex; align-items: center; justify-content: center; flex-direction: column; font-size: 14px; font-family: Roboto, Roboto-Medium; font-weight: 500; color: #17273a; letter-spacing: 0px; }
.detail .detail_tab .detail_list_content .detail_list_content_item .detail_list_content_item_count .detail_list_content_item_count_tab .money { margin-top: 5px; color: #ff5c5c; }
.detail .detail_tab .detail_list_content .detail_empty { padding: 40px 0; text-align: center; color: #b9b9b9; font-size: 13px; }

.detail .rebate { margin-top: 12px; background-color: #fff; }
.detail .rebate .rebate_head { padding: 15px 15px 0; font-size: 15px; font-family: Roboto, Roboto-Bold; font-weight: 700; color: #17273a; }
.detail .rebate .rebate_list { padding: 0 15px; }
.detail .rebate .rebate_item { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #f9f9f9; }
.detail .rebate .rebate_item .rebate_item_name { font-size: 14px; font-family: Roboto, Roboto-Medium; font-weight: 500; color: #17273a; }
.detail .rebate .rebate_item .rebate_item_meta { margin-top: 7px; display: flex; align-items: center; }
.detail .rebate .rebate_item .rebate_badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
.detail .rebate .rebate_item .rebate_badge.direct { background: #ffe6e2; color: #fc573b; }
.detail .rebate .rebate_item .rebate_badge.indirect { background: #e7f0ff; color: #4a85e8; }
.detail .rebate .rebate_item .rebate_date { margin-left: 10px; font-size: 13px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #b9b9b9; }
.detail .rebate .rebate_item .rebate_item_amount { font-size: 15px; font-family: Roboto, Roboto-Medium; font-weight: 700; color: #ff5c5c; white-space: nowrap; }
.detail .rebate .detail_empty { padding: 40px 0; text-align: center; color: #b9b9b9; font-size: 13px; }
</style>
