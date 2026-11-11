<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { api } from '../api/client';
import { useAuth } from '../stores/auth';

const router = useRouter();
const { t } = useI18n();
const auth = useAuth();
const user = ref(null);

const img = '/static/image/account/';
const statuses = [
  { icon: img + 'icon_Waiting.png', label: 'account.waiting', to: '/orders' },
  { icon: img + 'icon_ToConfirm.png', label: 'account.toconfirm', to: '/orders' },
  { icon: img + 'icon_InDelivery.png', label: 'account.delivery', to: '/orders' },
  { icon: img + 'icon_Received.png', label: 'account.received', to: '/orders' },
];
const menu = [
  { icon: img + 'icon_myteam.png', label: 'account.team', to: '/team' },
  { icon: img + 'icon_Fundingrecords.png', label: 'account.funding', to: '/funding' },
  { icon: img + 'icon_Invitationrecords.png', label: 'account.invite', to: '/invitation' },
  { icon: img + 'icon_Waiting.png', label: 'account.notifications', to: '/notifications' },
  { icon: img + 'icon_Myshare.png', label: 'winner.mine', to: '/myshare' },
  { icon: img + 'icon_Earnrewards.png', label: 'vip.title', to: '/vip' },
  { icon: img + 'icon_AboutUs.png', label: 'account.about', to: '/aboutus' },
  { icon: img + 'icon_Customerservice.png', label: 'account.service', to: '/service' },
];

// Finance assets summary, from the real account finance totals (rupee strings).
const financeTotal = ref('0.00');
const financeEarn = ref('0.00');

onMounted(async () => {
  user.value = await auth.refresh();
  try {
    const d = await api.account();
    const finance = d.finance || {};
    financeTotal.value = finance.invested ?? '0.00';
    financeEarn.value = finance.earnings ?? '0.00';
  } catch { /* not logged in or none */ }
});

function logoutGo() { auth.signOut().then(() => router.replace('/home')); }
</script>

<!-- Faithful rebuild of the real pages/account/account ("mine") layout + scoped CSS. -->
<template>
  <div class="mine">
    <div class="mine_user" :style="{ backgroundImage: `url(${img}bg_my.png)` }">
      <div class="mine_user_main">
        <div class="mine_user_img"><img class="img" :src="user?.avatar || '/static/image/home/icon_multiuser.png'" alt="" /></div>
        <div class="mine_user_info">
          <div class="mine_user_info_name">{{ user?.nickname || 'ORich' }}</div>
          <div class="mine_user_info_number">{{ user?.phone ? 'ID: ' + user.phone : '—' }}</div>
        </div>
      </div>
      <img class="mine_setting" :src="img + 'icon_setup.png'" alt="" @click="router.push('/setting')" />

      <div class="mine_user_member" @click="router.push('/vip')">
        <div class="mine_user_member_title">
          <div class="icon"><img src="/static/image/member/icon_vip.png" alt="" /></div>
          <div class="name">{{ user?.vip ? user.vip.name + ' Member' : 'ORich VIP Club' }}</div>
        </div>
        <div class="mine_user_member_item">
          <div class="benefits">Benefits</div>
          <img class="coin" src="/static/image/member/icon_goldcoins.png" alt="" />
          <div class="enjoy1">Daily bonus</div>
          <img class="redpacket" src="/static/image/member/icon_redenvelope.png" alt="" />
          <div class="enjoy2">Extra rebate</div>
          <img class="tovip" src="/static/image/account/icon_leftarrow.png" alt="" style="transform:rotate(180deg)" />
        </div>
      </div>
    </div>

    <div class="mine_main">
      <div class="mine_main_menu">
        <div class="mine_main_menu_left">{{ t('account.orders') }}</div>
        <div class="mine_main_menu_right" @click="router.push('/orders')">
          <span>{{ t('common.all') }}</span>›
        </div>
      </div>
      <div class="mine_main_nav">
        <div v-for="s in statuses" :key="s.label" class="mine_main_nav_item" @click="router.push(s.to)">
          <div class="mine_main_nav_item_icon"><img :src="s.icon" alt="" /></div>
          <div class="mine_main_nav_item_title">{{ t(s.label) }}</div>
        </div>
      </div>
    </div>

    <div class="mine_wallet" :style="{ backgroundImage: `url(${img}bg_Wallet.png)` }">
      <div class="mine_wallet_title">{{ t('account.wallet') }}</div>
      <div class="mine_wallet_main">
        <div class="mine_wallet_main_count">₹{{ user?.balance ?? '0.00' }}</div>
        <div class="mine_wallet_main_btnrecharge" @click="router.push('/recharge')">{{ t('common.recharge') }}</div>
        <div class="mine_wallet_main_btndraw" @click="router.push('/withdraw')">{{ t('account.withdraw') }}</div>
      </div>
      <div class="mine_wallet_tip">{{ t('account.frozen') }}: ₹{{ user?.frozen ?? '0.00' }}</div>
    </div>

    <div class="mine_finance" :style="{ backgroundImage: `url(${img}bg_finance.png)` }" @click="router.push('/finance')">
      <div class="mine_finance_bar">
        <div class="mine_finance_bar_title">My Finance</div>
        <div class="mine_finance_bar_icon"><img :src="img + 'icon_leftarrow.png'" alt="" style="transform:rotate(180deg)" /></div>
      </div>
      <div class="mine_finance_total">
        <div class="mine_finance_total_item">
          <div class="number">₹{{ financeTotal }}</div>
          <div class="tip">Total invested</div>
        </div>
        <div class="mine_finance_total_item">
          <div class="number">₹{{ financeEarn }}<span class="number_add">+</span></div>
          <div class="tip">Total earnings</div>
        </div>
      </div>
    </div>

    <div class="mine_menulist">
      <div v-for="(m, i) in menu" :key="m.label + i" class="mine_menulist_item" :class="{ mar_top: i > 0 }" @click="router.push(m.to)">
        <div class="mine_menulist_item_left">
          <div class="mine_menulist_item_icon iconsize"><img :src="m.icon" alt="" style="width:100%;height:100%" /></div>
          <div class="mine_menulist_item_title">{{ t(m.label) }}</div>
        </div>
        <img class="mine_menulist_item_right" :src="img + 'icon_leftarrow.png'" alt="" style="transform:rotate(180deg)" />
      </div>
      <div class="mine_menulist_item mar_top" @click="logoutGo">
        <div class="mine_menulist_item_left">
          <div class="mine_menulist_item_title" style="color:#ff5c5c">{{ t('account.signOut') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mine { width: 100%; min-height: 100vh; background: #f9f9f9; padding-bottom: 59px; }
.mine .img { width: 100%; height: 100%; object-fit: cover; }
.mine_user { position: relative; height: 284px; background-size: 100% 100%; background-repeat: no-repeat; padding-top: 60px; }
.mine_user_main { display: flex; }

/* VIP member banner inside the user header */
.mine_user_member { margin: 18px 8px 0 8px; min-height: 80px; background: linear-gradient(90deg, #3a2b1d, #6b4d2a); border-radius: 10px; padding-bottom: 10px; }
.mine_user_member_title { display: flex; align-items: center; height: 26px; padding: 12px 0 0 20px; }
.mine_user_member_title .icon { width: 22px; height: 19px; }
.mine_user_member_title .icon img { width: 100%; height: 100%; object-fit: contain; }
.mine_user_member_title .name { font-size: 16px; font-weight: 700; color: #ffe0ad; margin-left: 10px; }
.mine_user_member_item { display: flex; align-items: center; padding: 8px 9px 0 12px; }
.mine_user_member_item .benefits { font-size: 16px; font-weight: 500; color: #ffd9a8; flex-shrink: 0; }
.mine_user_member_item .coin { width: 24px; height: 24px; margin-left: 15px; flex-shrink: 0; object-fit: contain; }
.mine_user_member_item .enjoy1 { width: 69px; font-size: 13px; color: #ffd9a8; margin-left: 7px; flex-shrink: 0; }
.mine_user_member_item .redpacket { width: 32px; height: 32px; flex-shrink: 0; margin-left: 2px; object-fit: contain; }
.mine_user_member_item .enjoy2 { width: 62px; font-size: 13px; color: #ffd9a8; flex-shrink: 0; }
.mine_user_member_item .tovip { width: 8px; height: 14px; flex-shrink: 0; margin-left: 8px; opacity: .8; }
.mine_user_img { width: 60px; height: 60px; border-radius: 50%; overflow: hidden; margin-left: 16px; border: 2px solid #fff; }
.mine_user_info { margin-top: 7px; margin-left: 17px; }
.mine_user_info_name { font-size: 16px; font-weight: 700; line-height: 18px; color: #fff; }
.mine_user_info_number { margin-top: 6px; font-size: 13px; font-weight: 400; line-height: 18px; color: #fff; }
.mine_setting { width: 20px; height: 20px; position: absolute; top: 52px; right: 12px; }

.mine_main { margin: -43px 6px 0 8px; background: #fff; border-radius: 8px; position: relative; }
.mine_main_menu { padding: 20px 12px 0 16px; line-height: 18px; display: flex; align-items: center; justify-content: space-between; }
.mine_main_menu_left { font-size: 16px; font-weight: 700; color: #17273a; }
.mine_main_menu_right { font-size: 13px; font-weight: 400; color: #b9b9b9; }
.mine_main_menu_right span { margin-right: 4px; }
.mine_main_nav { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 16px 22px; }
.mine_main_nav_item { text-align: center; }
.mine_main_nav_item_icon { width: 32px; height: 32px; margin: 0 auto; }
.mine_main_nav_item_icon img { width: 100%; height: 100%; object-fit: contain; }
.mine_main_nav_item_title { font-size: 13px; font-weight: 400; color: #17273a; line-height: 18px; margin-top: 4px; }

.mine_wallet { margin: 12px 6px 12px 8px; height: 113px; background-size: 100% 100%; background-repeat: no-repeat; border-radius: 8px; }
.mine_wallet_title { font-weight: 600; padding: 16px 0 0 23px; color: #17273a; }
.mine_wallet_main { line-height: 18px; margin-top: 17px; margin-left: 24px; display: flex; align-items: center; }
.mine_wallet_main_count { width: 150px; font-size: 26px; font-weight: 700; color: #ee5016; }
.mine_wallet_main_btnrecharge { padding: 0 14px; height: 35px; display: flex; align-items: center; justify-content: center; background: linear-gradient(115deg, #ffe44b, #fea326); border-radius: 4px; box-shadow: 0 -2px 4px 0 rgba(255,125,0,.5) inset; font-size: 13px; color: #ad6701; font-weight: 600; }
.mine_wallet_main_btndraw { padding: 0 14px; height: 35px; margin-left: 8px; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid #ee5016; border-radius: 4px; font-size: 13px; color: #ee5016; font-weight: 600; }
.mine_wallet_tip { margin-top: 6px; margin-left: 24px; font-weight: 400; color: #a6a5a5; line-height: 18px; font-size: 13px; }

.mine_finance { margin: 12px 6px 12px 8px; height: 113px; background-size: 100% 100%; background-repeat: no-repeat; border-radius: 8px; }
.mine_finance_bar { display: flex; justify-content: space-between; padding: 15px 12px 0 14px; }
.mine_finance_bar_title { font-size: 16px; font-weight: 600; color: #17273a; }
.mine_finance_bar_icon { width: 12px; height: 12px; }
.mine_finance_bar_icon img { width: 100%; height: 100%; opacity: .5; }
.mine_finance_total { margin-top: 21px; padding: 0 10px 0 7px; display: flex; justify-content: space-between; }
.mine_finance_total_item { text-align: center; font-weight: 400; }
.mine_finance_total_item .number { font-size: 20px; font-weight: 700; color: #ff5c5c; max-width: 140px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; margin: 0 auto; }
.mine_finance_total_item .number .number_add { margin-left: 3px; font-size: 12px; }
.mine_finance_total_item .tip { margin-top: 6px; font-size: 13px; color: #b9b9b9; }

.mine_menulist { background: #fff; margin: 12px 8px; border-radius: 8px; padding: 12px 12px 14px 14px; }
.mine_menulist_item { display: flex; justify-content: space-between; align-items: center; }
.mine_menulist_item.mar_top { margin-top: 22px; }
.mine_menulist_item_left { display: flex; align-items: center; }
.mine_menulist_item_icon { margin-right: 11px; }
.mine_menulist_item .iconsize { width: 22px; height: 22px; }
.mine_menulist_item_title { font-weight: 400; font-size: 16px; line-height: 18px; color: #17273a; }
.mine_menulist_item_right { width: 12px; height: 12px; opacity: 0.5; }
</style>
