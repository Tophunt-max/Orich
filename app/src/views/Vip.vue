<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from '../api/client';
import { useAuth } from '../stores/auth';
import { useToast } from '../components/useToast';

const { t } = useI18n();
const auth = useAuth();
const { toast } = useToast();
const tiers = ref([]);
const picked = ref(null);
const busy = ref(0);

// Benefits grid + privileges list now come from the backend (api.vipTiers()).
const benefits = ref([]);
const privileges = ref([]);

onMounted(async () => {
  const data = await api.vipTiers();
  tiers.value = data.list || [];
  benefits.value = data.benefits || [];
  privileges.value = data.privileges || [];
  picked.value = tiers.value[1]?.id ?? tiers.value[0]?.id;
  await auth.refresh();
});

async function buy(tier) {
  busy.value = tier.id;
  try {
    const data = await api.vipBuy(tier.id);
    auth.user = { ...auth.user, balance: data.balance, vip: data.vip };
    toast(tier.name + ' VIP ✓');
  } catch (e) { toast(e.message); }
  finally { busy.value = 0; }
}
</script>

<!-- Faithful rebuild of the real pages/task/member (VIP) layout + scoped CSS. -->
<template>
  <div class="member">
    <div class="member_bg"><header class="mnav">{{ t('vip.title') }}</header></div>

    <div class="member_user">
      <div class="member_user_item">
        <div class="avatar"><img :src="auth.user?.avatar || '/static/image/home/icon_multiuser.png'" alt="" /></div>
        <div class="info">
          <div class="info_name">{{ auth.user?.nickname || 'ORich' }}</div>
          <div class="info_number">{{ auth.user?.vip ? auth.user.vip.name + ' member' : t('vip.none') }}</div>
        </div>
      </div>
      <div class="level"><span>VIP</span></div>
    </div>

    <div class="member_open">
      <div class="member_open_title">{{ t('vip.choose') }}</div>
      <div class="member_open_card">
        <div v-for="tier in tiers" :key="tier.id" class="member_open_card_item" :class="{ memactive: picked === tier.id }" @click="picked = tier.id">
          <div class="moc-name">{{ tier.name }}</div>
          <div class="price">₹{{ tier.price }}<small>/{{ tier.days }}d</small></div>
          <div class="detail">{{ t('vip.daily', { n: tier.dailyBonus }) }}</div>
          <div class="detail">{{ t('vip.rebate', { n: tier.rebate }) }}</div>
        </div>
      </div>
    </div>

    <!-- member detail: benefits grid + privileges + earnings table (real member_detail) -->
    <div class="member_detailbg">
      <div class="member_detail">
        <div class="member_detail_title">
          <div class="name">Member Benefits</div>
          <div class="help"><img src="/static/image/member/icon_problem.png" alt="" /></div>
        </div>

        <div class="member_detail_strip">
          <div v-for="b in benefits" :key="b.label" class="member_detail_strip_item">
            <div class="icon"><img :src="b.icon" alt="" /></div>
            <div class="info">{{ b.label }}</div>
          </div>
        </div>

        <div class="member_detail_enjoy">
          <div class="member_detail_enjoy_card">
            <div class="title">Privileges you enjoy</div>
            <div class="main m_bg">
              <div v-for="(p, i) in privileges" :key="i" class="main_item">
                <div class="main_item_icon"><img src="/static/image/member/icon_select.png" alt="" /></div>
                <div class="main_item_des">{{ p }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="member_detail_invition">
          <div class="member_detail_invition_item titlebg">
            <div class="strip">Plan</div>
            <div class="strip">Daily bonus</div>
            <div class="strip">Rebate</div>
          </div>
          <div v-for="tier in tiers" :key="'row' + tier.id" class="member_detail_invition_item pricebg">
            <div class="strip">{{ tier.name }}</div>
            <div class="strip">₹{{ tier.dailyBonus }}</div>
            <div class="strip">{{ tier.rebate }}%</div>
          </div>
        </div>
      </div>
    </div>

    <div class="member_btnbar">
      <button class="member_btn" :disabled="busy" @click="buy(tiers.find((x) => x.id === picked))">{{ t('vip.buy') }}</button>
    </div>
  </div>
</template>

<style scoped>
.member { min-height: 100vh; background: #f9f9f9; padding-bottom: 90px; }
.member_bg { height: 120px; background: linear-gradient(160deg, #3a2a1a, #7a5a2a); }
.mnav { height: 44px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; font-weight: 700; }
.member_user { margin: -60px 17px 0 18px; background: linear-gradient(89deg, #e7be76, #f6deae); border-radius: 15px 15px 0 0; padding: 16px 0 0 23px; height: 110px; position: relative; }
.member_user_item { display: flex; align-items: center; }
.avatar { width: 60px; height: 60px; flex-shrink: 0; border-radius: 50%; border: 2px solid #fff; overflow: hidden; }
.avatar img { width: 100%; height: 100%; object-fit: cover; }
.info { color: #a0743c; margin-left: 9px; }
.info_name { font-size: 16px; font-weight: 500; }
.info_number { font-size: 13px; margin-top: 8px; }
.level { width: 74px; height: 27px; line-height: 27px; background: linear-gradient(89deg, #ebbe70, #fef0d5); border-radius: 0 15px 0 15px; text-align: center; position: absolute; right: 0; top: 0; }
.level span { font-size: 18px; font-weight: 700; color: #9c4d08; }
.member_open { margin: 0 17px; background: #2b2320; border-radius: 0 0 12px 12px; padding: 20px 0 16px; }
.member_open_title { margin-left: 17px; color: #f6deae; font-size: 16px; font-weight: 700; }
.member_open_card { margin-top: 16px; padding-left: 16px; padding-right: 16px; display: flex; flex-wrap: nowrap; align-items: center; overflow-x: auto; -webkit-overflow-scrolling: touch; gap: 10px; }
.member_open_card_item { flex-shrink: 0; width: 179px; border-radius: 10px; padding: 13px 3px 13px 16px; color: #a5a2a1; background: #3a322d; }
.member_open_card_item.memactive { background: linear-gradient(135deg, #ffe9c2, #f6deae); color: #9c4d08; }
.moc-name { font-size: 18px; font-weight: 500; }
.member_open_card_item .price { font-size: 26px; font-weight: 700; margin: 2px 0; }
.member_open_card_item .price small { font-size: 12px; font-weight: 400; }
.member_open_card_item .detail { font-size: 13px; line-height: 18px; }
/* member detail: benefits grid + privileges + earnings table */
.member_detailbg { margin: 0 17px; }
.member_detail { width: 100%; margin-top: -4px; padding: 18px 0 8px; background: #fff; position: relative; border-radius: 0 0 12px 12px; }
.member_detail_title { display: flex; align-items: center; justify-content: space-between; padding: 0 18px; }
.member_detail_title .name { font-size: 16px; font-weight: 700; color: #a0743c; }
.member_detail_title .help { width: 18px; height: 18px; }
.member_detail_title .help img { width: 100%; height: 100%; object-fit: contain; }
.member_detail_strip { margin-top: 20px; padding: 0 5px; display: flex; align-items: flex-start; justify-content: space-between; }
.member_detail_strip_item { flex: 1; display: flex; align-items: center; justify-content: center; flex-direction: column; }
.member_detail_strip_item .icon { width: 44px; height: 44px; }
.member_detail_strip_item .icon img { width: 100%; height: 100%; object-fit: contain; }
.member_detail_strip_item .info { margin-top: 5px; font-size: 12px; text-align: center; color: #a0743c; line-height: 1.3; }
.member_detail_enjoy { margin-top: 18px; padding: 0 12px; }
.member_detail_enjoy_card { width: 100%; border-radius: 10px; overflow: hidden; background: #2b2320; }
.member_detail_enjoy_card .title { font-size: 14px; font-weight: 500; color: #f6deae; padding: 12px 0 0 16px; }
.member_detail_enjoy_card .main.m_bg { color: #fff; padding: 12px 15px 16px 20px; margin-top: 10px; background: linear-gradient(180deg, #262932, #534f53 100%); border-radius: 0 0 10px 10px; }
.member_detail_enjoy_card .main_item { display: flex; align-items: flex-start; justify-content: flex-start; padding: 7px 0; }
.member_detail_enjoy_card .main_item_icon { width: 18px; height: 18px; flex-shrink: 0; margin-top: 1px; }
.member_detail_enjoy_card .main_item_icon img { width: 100%; height: 100%; object-fit: contain; }
.member_detail_enjoy_card .main_item_des { margin-left: 11px; font-size: 13px; font-weight: 500; color: #fff; line-height: 1.4; }
.member_detail_invition { margin: 19px 10px 0; padding-bottom: 20px; }
.member_detail_invition_item { display: flex; align-items: center; justify-content: flex-start; text-align: center; border-bottom: 1px solid #f4d8ab; }
.member_detail_invition_item:last-child { border-bottom: none; }
.member_detail_invition_item .strip { flex: 1; font-size: 14px; font-weight: 500; color: #a0743c; height: 44px; line-height: 44px; }
.member_detail_invition_item .strip:nth-child(2) { border-left: 1px solid #f4d8ab; border-right: 1px solid #f4d8ab; }
.member_detail_invition .titlebg { background: #f7e2c1; }
.member_detail_invition .pricebg { background: #fcf9f0; }

.member_btnbar { position: fixed; left: 50%; transform: translateX(-50%); bottom: 0; width: 100%; max-width: var(--maxw); padding: 10px 17px; background: #fff; border-top: 1px solid #f0f0f0; }
.member_btn { width: 100%; height: 46px; border-radius: 23px; background: linear-gradient(89deg, #e7be76, #d79a3a); color: #5a3100; font-size: 16px; font-weight: 700; }
.member_btn:disabled { opacity: 0.6; }
</style>
