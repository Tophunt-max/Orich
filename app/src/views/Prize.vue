<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api/client';
import { useToast } from '../components/useToast';

const router = useRouter();
const { toast } = useToast();

const prizes = ref([]);
const winners = ref([]);
const tab = ref(0); // 0 = winners, 1 = rules
const showSuccess = ref(false); // win modal, hidden by default

const DEFAULT_AVATAR = '/static/image/prize/default_avatar.png';

// Headline prize pool: sum of all prize costs, with a safe fallback.
const poolAmount = computed(() => {
  const sum = prizes.value.reduce((t, p) => t + (Number(p.cost) || 0), 0);
  return (sum || 8888).toLocaleString('en-IN');
});
const peopleCount = computed(() => (prizes.value.length ? prizes.value.length * 326 : 1234));

// Up to five avatars for the invite row.
const inviteAvatars = computed(() => {
  const av = winners.value.map((w) => w.avatar).filter(Boolean);
  while (av.length < 5) av.push(DEFAULT_AVATAR);
  return av.slice(0, 5);
});

const rules = [
  'Invite friends to join and the shared prize pool grows for everyone.',
  'Each friend who joins adds their contribution to your group total.',
  'When the timer ends, the pool is divided among all participants.',
  'Your share is credited to your balance automatically.',
];

onMounted(async () => {
  try { prizes.value = (await api.prizes()).list || []; } catch { /* ignore */ }
  try { winners.value = (await api.winners()).list || []; } catch { /* ignore */ }
});

function invite() {
  toast('Invite link copied — share to grow the pool!');
}
</script>

<!-- Faithful rebuild of the real pages/prize/prize "dividing the prize" layout + scoped CSS. -->
<template>
  <div class="prize">
    <div class="prize_bg"><img src="/static/image/prize/bg_partition.png" alt="" /></div>

    <div class="prize_people">{{ peopleCount.toLocaleString('en-IN') }} people are dividing the prize</div>

    <div class="prize_amount">
      <div class="prize_amount_title">Total prize pool</div>
      <div class="prize_amount_money"><span>₹</span>{{ poolAmount }}</div>
      <div class="prize_amount_time">Ends in<span>23:59:59</span></div>
    </div>

    <div class="prize_invite">
      <div class="prize_invite_avatar">
        <div v-for="(a, i) in inviteAvatars" :key="i" class="prize_invite_avatar_item">
          <img :src="a" alt="" />
        </div>
      </div>
      <div class="prize_invite_tips">Invite friends to split a bigger prize together</div>
      <button class="prize_invite_btn" @click="invite">Invite now</button>
    </div>

    <div class="prize_tabs">
      <div class="prize_tabs_item" @click="tab = 0">
        <div :class="{ active: tab === 0 }">Winners</div>
        <div v-if="tab === 0" class="prize_tabs_item_icon"></div>
      </div>
      <div class="prize_tabs_item" @click="tab = 1">
        <div :class="{ active: tab === 1 }">Rules</div>
        <div v-if="tab === 1" class="prize_tabs_item_icon"></div>
      </div>
    </div>

    <div class="prize_main">
      <div v-if="tab === 0" class="prize_main_users">
        <template v-if="winners.length">
          <div v-for="w in winners" :key="w.id" class="prize_main_users_item">
            <div class="prize_main_users_item_left"><img :src="w.avatar || DEFAULT_AVATAR" alt="" /></div>
            <div class="prize_main_users_item_right">
              <div class="top">
                <span class="name">{{ w.name }}</span>
                <span class="time">{{ w.date }}</span>
              </div>
              <div class="bottom">won {{ w.product }} · {{ w.shares }} shares</div>
            </div>
          </div>
        </template>
      </div>

      <div v-else class="prize_main_users">
        <div class="prize_main_rules">
          <div class="rule-list">
            <div v-for="(r, i) in rules" :key="i" class="rule-list-item">
              <div class="list-icon"></div>
              <div class="list-main">{{ r }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showSuccess" class="mask" @click.self="showSuccess = false">
      <div class="m-modal m-modal-success">
        <div class="p-title">Congratulations</div>
        <div class="m-title">You won a share!</div>
        <div class="p-main">
          <div class="p-main-icon"><img src="/static/image/prize/Group247.png" alt="" /></div>
          <div class="p-main-tips">Your prize has been credited</div>
          <div class="p-main-price"><span>₹</span>{{ poolAmount }}</div>
          <div class="p-main-tips2">Keep inviting friends to win even more</div>
          <div class="p-btn">
            <div class="m-btn-item m-btn-left" @click="showSuccess = false">Close</div>
            <div class="m-btn-item m-btn-right" @click="router.push('/winner')">View</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prize { background: #35a2ff; padding-top: 15px; position: relative; min-height: 100vh; }
.prize .prize_bg { width: 100vw; background: #ffac41; }
.prize .prize_bg img { width: 100%; }
.prize .prize_people { width: 236px; height: 28px; background: rgba(0,0,0,.2); border-radius: 100px; position: absolute; top: 60px; left: 50%; transform: translateX(-50%); font-size: 14px; font-family: Roboto, Roboto-Regular; font-weight: 400; text-align: center; color: #fff; line-height: 28px; letter-spacing: 0px; }
.prize .prize_amount { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; position: absolute; top: 318px; }
.prize .prize_amount .prize_amount_title { font-size: 16px; font-family: Roboto, Roboto-Medium; font-weight: 500; color: #bb451e; line-height: 18px; letter-spacing: 0px; }
.prize .prize_amount .prize_amount_money { font-size: 46px; font-family: Roboto, Roboto-Medium; font-weight: 500; color: #ff5c5c; letter-spacing: 0px; line-height: 60px; }
.prize .prize_amount .prize_amount_money span { margin-right: 8px; }
.prize .prize_amount .prize_amount_time { margin-top: 3px; font-size: 14px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #ee5016; line-height: 18px; letter-spacing: 0px; }
.prize .prize_amount .prize_amount_time span { margin-left: 4px; }
.prize .prize_invite { width: 100%; position: absolute; top: 470px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.prize .prize_invite .prize_invite_avatar { width: 100%; height: 48px; display: flex; align-items: center; justify-content: center; }
.prize .prize_invite .prize_invite_avatar .prize_invite_avatar_item { width: 48px; height: 48px; border: 1px solid #fff; border-radius: 50%; overflow: hidden; margin: 0 11px; }
.prize .prize_invite .prize_invite_avatar .prize_invite_avatar_item img { width: 100%; height: 100%; object-fit: cover; }
.prize .prize_invite .prize_invite_tips { font-size: 14px; font-family: Roboto, Roboto-Regular; font-weight: 400; text-align: center; color: #ffdc93; line-height: 18px; letter-spacing: 0px; margin-top: 20px; white-space: nowrap; }
.prize .prize_invite .prize_invite_btn { width: 70%; height: 40px; margin-top: 24px; font-size: 16px; font-family: Roboto, Roboto-Bold; font-weight: 700; text-align: center; color: #c86904; line-height: 40px; letter-spacing: 0px; background: linear-gradient(90deg, #ffe44b, #fea326); border-radius: 20px; }
.prize .prize_tabs { width: 100%; display: flex; align-items: center; justify-content: center; position: absolute; top: 683.50px; }
.prize .prize_tabs .prize_tabs_item { font-size: 16px; font-family: Roboto, Roboto-Medium; font-weight: 400; text-align: center; color: #ffc84e; line-height: 18px; letter-spacing: 0px; }
.prize .prize_tabs .prize_tabs_item .active { color: #ffc84e; font-weight: 500; }
.prize .prize_tabs .prize_tabs_item:nth-child(1) { margin-right: 63px; }
.prize .prize_tabs .prize_tabs_item .prize_tabs_item_icon { width: 38px; height: 4px; background: #ffc84e; margin: 0 auto; margin-top: 6px; border-radius: 100px; }
.prize .prize_main { width: 100%; position: absolute; top: 745px; }
.prize .prize_main .prize_main_users { width: 85%; margin: 0 auto; padding: 0 12px; height: 260px; overflow: hidden; }
.prize .prize_main .prize_main_users .prize_main_rules { height: 100%; overflow-y: auto; }
.prize .prize_main .prize_main_users .prize_main_users_item { background: rgba(255,200,78,.2); border-radius: 10px; padding: 8px 9px 7px 10px; display: flex; margin-bottom: 8px; }
.prize .prize_main .prize_main_users .prize_main_users_item .prize_main_users_item_left { width: 39px; height: 39px; border: 1px solid #fff; border-radius: 50%; overflow: hidden; margin-right: 8px; }
.prize .prize_main .prize_main_users .prize_main_users_item .prize_main_users_item_left img { width: 100%; height: 100%; object-fit: cover; }
.prize .prize_main .prize_main_users .prize_main_users_item .prize_main_users_item_right { width: calc(100% - 47px); }
.prize .prize_main .prize_main_users .prize_main_users_item .prize_main_users_item_right .top { display: flex; justify-content: space-between; }
.prize .prize_main .prize_main_users .prize_main_users_item .prize_main_users_item_right .top .name { font-size: 14px; font-family: Roboto, Roboto-Medium; font-weight: 500; color: #ee5016; letter-spacing: 0px; }
.prize .prize_main .prize_main_users .prize_main_users_item .prize_main_users_item_right .top .time { font-size: 12px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #ee5016; }
.prize .prize_main .prize_main_users .prize_main_users_item .prize_main_users_item_right .bottom { margin-top: 3px; font-size: 11px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #17273a; }

.mask { position: fixed; left: 0; top: 0; z-index: 99999; display: flex; flex-direction: row; align-items: center; justify-content: center; width: 100vw; height: 100vh; background: rgba(0,0,0,.6); }
.mask .m-modal { z-index: 100000; width: 338px; height: 524px; margin-top: -10%; }
.mask .m-modal-success { background: url('/static/image/record/img_YouWon.png'); background-size: 100% 100%; position: relative; }
.mask .p-btn { display: flex; flex-direction: row; align-items: center; justify-content: space-between; width: 100%; margin-top: 125px; }
.mask .p-btn .m-btn-item { display: flex; flex-direction: row; align-items: center; justify-content: center; width: 103.50px; height: 39px; border-radius: 4.50px; font-size: 14px; color: #fff; font-family: PingFang SC, PingFang SC-Bold; }
.mask .p-btn .m-btn-left { background: transparent; border: 1px solid #fff; }
.mask .p-main { width: 250px; margin: auto; margin-top: 146px; display: flex; flex-direction: column; align-items: center; }
.mask .p-main .p-main-icon { width: 89px; height: 89px; }
.mask .p-main .p-main-icon img { width: 100%; height: 100%; object-fit: contain; }
.mask .p-main .p-main-tips { margin-top: 17px; font-size: 16px; font-family: Roboto, Roboto-Medium; font-weight: 500; text-align: center; color: #6f3f3f; }
.mask .p-main .p-main-price { margin-top: 7px; font-size: 26px; font-family: Roboto, Roboto-Black; font-weight: 900; text-align: center; color: #ff5c5c; }
.mask .p-main .p-main-price span { margin-right: 4px; }
.mask .p-main .p-main-tips2 { margin-top: 6px; font-size: 14px; font-family: Roboto, Roboto-Regular; font-weight: 400; text-align: center; color: #6f3f3f; }
.mask .m-modal-success .m-title { position: absolute; left: 86px; top: 121px; font-size: 24px; font-family: YouSheBiaoTiHei, YouSheBiaoTiHei-Regular; color: #fff; }
.mask .m-modal-success .p-title { position: absolute; left: 86px; top: 86px; font-size: 20px; font-family: YouSheBiaoTiHei, YouSheBiaoTiHei-Regular; font-weight: 400; color: #fff; text-shadow: 0px 2px 4px 0px #bf2322; }
.mask .m-modal-success .m-btn-right { background: #fd583f; box-shadow: 0px 4px 0px 0px #cd0413; }
.rule-list { padding-left: 8px; }
.rule-list .rule-list-item { display: flex; margin-bottom: 13px; }
.rule-list .rule-list-item .list-icon { width: 4px; height: 4px; background: #c86904; border-radius: 50%; margin-top: 5px; }
.rule-list .rule-list-item .list-main { width: 269px; margin-left: 4px; font-size: 12px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #c86904; }
</style>
