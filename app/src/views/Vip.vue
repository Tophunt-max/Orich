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

onMounted(async () => {
  tiers.value = (await api.vipTiers()).list;
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
.member_open_card { margin-top: 16px; padding-left: 16px; display: flex; align-items: center; overflow-x: auto; gap: 10px; }
.member_open_card_item { flex-shrink: 0; width: 179px; border-radius: 10px; padding: 13px 3px 13px 16px; color: #a5a2a1; background: #3a322d; }
.member_open_card_item.memactive { background: linear-gradient(135deg, #ffe9c2, #f6deae); color: #9c4d08; }
.moc-name { font-size: 18px; font-weight: 500; }
.member_open_card_item .price { font-size: 26px; font-weight: 700; margin: 2px 0; }
.member_open_card_item .price small { font-size: 12px; font-weight: 400; }
.member_open_card_item .detail { font-size: 13px; line-height: 18px; }
.member_btnbar { position: fixed; left: 50%; transform: translateX(-50%); bottom: 0; width: 100%; max-width: var(--maxw); padding: 10px 17px; background: #fff; border-top: 1px solid #f0f0f0; }
.member_btn { width: 100%; height: 46px; border-radius: 23px; background: linear-gradient(89deg, #e7be76, #d79a3a); color: #5a3100; font-size: 16px; font-weight: 700; }
.member_btn:disabled { opacity: 0.6; }
</style>
