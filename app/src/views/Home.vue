<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { api } from '../api/client';

const router = useRouter();
const { t, locale } = useI18n();
const data = ref(null);
const loading = ref(true);
const showDownload = ref(true);

// category tabs for the bottom list come from the API (data.categories).
const cats = computed(() => (data.value?.categories || []));
const activeCat = ref(0);
const priceAsc = ref(false);

const listAll = computed(() => (data.value?.list || []));
const hotList = computed(() => listAll.value.filter((p) => p.hot));
// "High value" section cards come from the API (data.highValue).
const highList = computed(() => (data.value?.highValue || []));
// Finance carousel cards come from the home response (data.finances).
const finances = computed(() => (data.value?.finances || []));
const bottomList = computed(() => {
  let arr = [...listAll.value];
  const cat = cats.value[activeCat.value];
  if (cat && cat !== 'All') arr = arr.filter((p) => p.category === cat);
  arr.sort((a, b) => (priceAsc.value ? a.price - b.price : b.price - a.price));
  return arr;
});

// Countdown for the "High value" header, driven by the first high-value item's real endAt.
const now = ref(Date.now());
let timer = null;
const highEndAt = computed(() => highList.value[0]?.endAt || 0);
const remainSec = computed(() => Math.max(0, Math.floor((highEndAt.value - now.value) / 1000)));
const hh = computed(() => String(Math.floor(remainSec.value / 3600)).padStart(2, '0'));
const mm = computed(() => String(Math.floor(remainSec.value / 60) % 60).padStart(2, '0'));
const ss = computed(() => String(remainSec.value % 60).padStart(2, '0'));

function toggleLang() {
  locale.value = locale.value === 'en' ? 'hi' : 'en';
  localStorage.setItem('orich_lang', locale.value);
}
function go(key) {
  const map = { recharge: '/recharge', invite: '/invitation', orders: '/orders', support: '/help', task: '/tasks', vip: '/vip' };
  router.push(map[key] || '/home');
}

onMounted(async () => {
  try {
    data.value = await api.home();
  } finally { loading.value = false; }
  timer = setInterval(() => { now.value = Date.now(); }, 1000);
});
onUnmounted(() => { if (timer) clearInterval(timer); });

const inr = (n) => Number(n).toLocaleString('en-IN');
</script>

<!-- Faithful rebuild of the real pages/home/home: download bar, nav-logo, banner, quick-tab,
     winner marquee, 1₹ group-buy list, invite banner, finance carousel, Hot Picks + High-value
     horizontal lists, and the categorized bottom list (ltab + litem). -->
<template>
  <div class="home">
    <div class="home-background" :style="{ backgroundImage: `url(${data?.banners?.[0] || '/static/image/home/bg_homepage.png'})` }"></div>

    <!-- download top bar -->
    <div v-if="showDownload" class="home-download">
      <div class="home-download-main">
        <div class="home-download-main-cont">Get the ORich app for a faster, smoother experience</div>
      </div>
      <div class="home-download-down">
        <div class="down"><img src="/static/image/home/icon_download.png" alt="" /></div>
        <div class="close" @click="showDownload = false"><img src="/static/image/home/del.png" alt="" /></div>
      </div>
    </div>

    <div class="nav-logo">
      <span class="logo-badge">O</span><span class="logo-word">ORich</span>
      <span class="home-lang" @click="toggleLang">{{ locale === 'en' ? 'हिं' : 'EN' }}</span>
    </div>

    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>

    <template v-else-if="data">
      <div class="banner"><img :src="data.banners[0]" alt="" /></div>

      <div class="tab">
        <div v-for="e in data.entries" :key="e.key" class="tab-item" @click="go(e.key)">
          <img :src="e.icon" :alt="e.label" />
          <div class="tab-item-text">{{ e.label }}</div>
        </div>
      </div>

      <div class="toast">
        <div class="toast-swiper-item">
          <div class="toast-swiper-item-img"><img :src="data.winners[0]?.avatar" alt="" /></div>
          <div class="toast-swiper-item-main">
            <span class="name">{{ data.winners[0]?.name }}</span> won {{ data.winners[0]?.product }}
          </div>
        </div>
      </div>

      <!-- invite banner -->
      <div class="pad">
        <div class="invite" @click="router.push('/invitation')">
          <div class="invite-icon"><img src="/static/image/home/icon_Invite.png" alt="" /></div>
          <div class="invite-main">Invite friends &amp; earn rewards</div>
          <div class="invite-btn">Go</div>
        </div>
      </div>

      <!-- 1₹ group buy list -->
      <div class="newbie">
        <div class="newbie-title">
          <span class="newbie-title-text">{{ t('home.groupBuy') }}</span>
          <span class="newbie-title-help" @click="router.push('/winner')">{{ t('home.viewAll') }} ›</span>
        </div>
        <div v-for="p in data.list" :key="p.id" class="nshop" @click="router.push('/goods/' + p.id)">
          <img class="nshop-img" :src="p.cover" :alt="p.title" />
          <div class="nshop-detail">
            <div class="nshop-title">{{ p.title }}</div>
            <div class="nshop-countdown">{{ p.subtitle }}</div>
            <div class="nshop-precent">
              <div class="nshop-progress"><div class="bar"><span :style="{ width: p.percent + '%' }"></span></div></div>
              <div class="nshop-progress-text">{{ p.percent }}%</div>
            </div>
            <div class="nshop-price">
              <span class="np">₹{{ p.price }}<i>/{{ t('product.shares') }}</i></span>
              <span class="nbtn">{{ t('product.joinNow') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- finance carousel -->
      <div v-if="finances.length" class="pad">
        <div class="finance">
          <div class="finance-header">
            <div class="finance-header-item">
              <img class="iconimg" src="/static/image/finance/icon_Finance.png" alt="" />
              <div class="title">Finance</div>
            </div>
            <div class="finance-header-item" @click="router.push('/finance')">
              <div class="more">More</div>
              <img class="moreimg" src="/static/image/home/icon_RightArrow.png" alt="" />
            </div>
          </div>
          <div class="finance-main">
            <div v-for="f in finances" :key="f.id" class="finance-main-card" @click="router.push('/finance/' + f.id)">
              <div class="finance-main-card-image"><img src="/static/image/finance/icon_Finance.png" alt="" /></div>
              <div class="finance-main-card-content">
                <div class="ctitle">{{ f.name }}</div>
                <div class="linepro"><div class="bar"><span :style="{ width: Math.min(100, f.rate * 40) + '%' }"></span></div></div>
                <div class="ditem"><span class="ditem-title">Daily rate</span><span class="ditem-cel">{{ f.rate }}%</span></div>
                <div class="ditem"><span class="ditem-title">Term</span><span class="ditem-cel">{{ f.days }} days</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Hot Picks horizontal -->
      <div v-if="hotList.length" class="pad">
        <div class="glist">
          <div class="header">
            <div class="header-title"><img src="/static/image/home/icon_HotPicks.png" alt="" />Hot Picks</div>
            <div class="header-right" @click="router.push('/winner')">All ›</div>
          </div>
          <div class="main">
            <div v-for="p in hotList" :key="p.id" class="item" @click="router.push('/goods/' + p.id)">
              <div class="item-show">
                <img :src="p.cover" alt="" />
                <div class="item-show-prize">{{ p.percent }}% claimed</div>
              </div>
              <div class="item-text">
                <div class="item-name">{{ p.title }}</div>
                <div class="item-count">₹{{ p.price }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- High value horizontal with countdown -->
      <div v-if="highList.length" class="pad">
        <div class="glist high latest">
          <div class="header">
            <div class="header-title"><img src="/static/image/home/icon_Winner.png" alt="" />High value</div>
            <div class="header-right">
              <span class="hour">{{ hh }}</span><span class="colon">:</span>
              <span class="minute">{{ mm }}</span><span class="colon">:</span>
              <span class="seconds">{{ ss }}</span>
            </div>
          </div>
          <div class="main">
            <div v-for="p in highList" :key="p.id" class="item" @click="router.push('/goods/' + p.id)">
              <div class="item-show">
                <img :src="p.cover" alt="" />
                <div class="item-show-prize">Worth ₹{{ inr(p.marketValue) }}</div>
              </div>
              <div class="item-text">
                <div class="item-name">{{ p.title }}</div>
                <div class="item-count">₹{{ p.price }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- categorized bottom list -->
      <div class="home-list">
        <div class="ltab">
          <div class="ltab-price" @click="priceAsc = !priceAsc">
            Price <span class="ltab-price-arrow">{{ priceAsc ? '▲' : '▼' }}</span>
          </div>
          <div class="ltab-tab">
            <div v-for="(c, i) in cats" :key="c" class="ltab-item" :class="{ 'ltab-item-active': activeCat === i }" @click="activeCat = i">
              <div class="ltab-item-text">{{ c }}</div>
              <img v-if="activeCat === i" src="/static/image/home/Vector.png" alt="" />
            </div>
          </div>
        </div>

        <div v-for="(p, idx) in bottomList" :key="p.id" class="litem" :class="{ 'lgoods-noborder': idx === bottomList.length - 1 }" @click="router.push('/goods/' + p.id)">
          <div class="litem-left">
            <img class="litem-img" :src="p.cover" alt="" />
            <div class="item-prize">{{ p.percent }}% claimed</div>
          </div>
          <div class="litem-right">
            <div class="lgoods-title">{{ p.title }}</div>
            <div class="lgoods-end">{{ p.subtitle }} · <span class="draw-color">{{ p.remaining }} left</span></div>
            <div class="lgoods-precent">
              <div class="lgoods-progress"><div class="bar"><span :style="{ width: p.percent + '%' }"></span></div></div>
              <div class="lgoods-progress-text">{{ p.percent }}%</div>
            </div>
            <div class="lgoods-price">
              <div class="lgoods-price-old">₹{{ inr(p.marketValue) }}</div>
              <div class="lgoods-price-new">₹{{ p.price }}</div>
            </div>
          </div>
          <div class="lgoods-btn">Join<img src="/static/image/home/icon_join.png" alt="" /></div>
        </div>
      </div>
    </template>

    <!-- floating prize entry -->
    <div class="home-prize" @click="router.push('/prize')"><img src="/static/image/home/img_lottery.png" alt="" /></div>
  </div>
</template>

<style scoped>
.home { position: relative; min-height: 100vh; padding-bottom: 49px; background-color: #f6f6f6; }
.home-background { height: 165px; width: 100%; position: absolute; top: 0; left: 0; background-size: 100% 100%; background-repeat: no-repeat; }
.pad { position: relative; z-index: 2; margin: 11px 12px 0; }
.nav-logo { position: relative; display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 7px; width: 100%; height: 44px; z-index: 2; }
.logo-badge { width: 26px; height: 26px; border-radius: 7px; background: #ee5016; color: #fff; font-weight: 800; font-size: 17px; display: flex; align-items: center; justify-content: center; }
.logo-word { font-size: 19px; font-weight: 800; color: #fff; letter-spacing: 0.5px; }
.home-lang { position: absolute; right: 15px; background: rgba(255,255,255,0.25); color: #fff; border-radius: 12px; padding: 3px 10px; font-size: 12px; }
.loading { position: relative; z-index: 2; text-align: center; color: #fff; padding: 40px; }

/* download top bar */
.home-download { position: fixed; top: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: var(--maxw); z-index: 999; display: flex; align-items: center; justify-content: space-between; background: linear-gradient(115deg, #ffe44b, #fea326); height: 50px; padding: 0 5px 0 12px; }
.home-download-main { max-width: 235px; color: #ad6701; padding: 0 10px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
.home-download-main-cont { font-size: 12px; }
.home-download-down { display: flex; align-items: center; justify-content: flex-start; }
.home-download-down .down { width: 30px; height: 30px; margin-right: 5px; }
.home-download-down .close { width: 20px; height: 20px; }
.home-download-down img { width: 100%; height: 100%; object-fit: contain; }

.banner { position: relative; z-index: 2; width: 100%; padding: 4px 12px 0; }
.banner img { width: 100%; height: 139px; object-fit: cover; border-radius: 8px; }

.tab { position: relative; z-index: 2; display: flex; flex-direction: row; align-items: flex-start; padding: 13px 10px; margin: 11px 12px 0; background-color: #fff; border-radius: 8px; }
.tab-item { flex: 1; text-align: center; }
.tab-item img { width: 44px; height: 44px; border-radius: 50%; object-fit: contain; }
.tab-item-text { margin-top: 2px; font-size: 12px; font-family: 'PingFang SC', 'PingFang SC-Bold'; font-weight: 700; color: #4f4f4f; }

.toast { position: relative; z-index: 2; margin: 11px 12px 0; border-radius: 8px; padding: 11px 12px; background-color: #fff; overflow: hidden; }
.toast-swiper-item { display: flex; align-items: center; }
.toast-swiper-item-img { width: 30px; height: 30px; border-radius: 50%; overflow: hidden; }
.toast-swiper-item-img img { width: 100%; height: 100%; object-fit: cover; }
.toast-swiper-item-main { flex: 1; margin-left: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 13px; color: #686868; }
.toast-swiper-item-main .name { color: #ee5016; }

/* invite banner */
.invite { height: 50px; background: #ffe9e1; border-radius: 5px; display: flex; align-items: center; justify-content: flex-start; }
.invite .invite-icon { width: 35px; height: 30px; margin-left: 19px; }
.invite .invite-icon img { width: 100%; height: 100%; object-fit: contain; }
.invite .invite-main { flex: 1; margin-left: 20px; font-size: 16px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #ee5016; }
.invite .invite-btn { width: 65px; height: 27px; background: #ee5016; border-radius: 99.5px; line-height: 27px; color: #fff; text-align: center; margin: 0 14px 0 10px; }

.newbie { position: relative; z-index: 2; margin: 11px 12px 0; padding: 2px 0 12px; background: #fff; box-shadow: 0 4px 14px 0 rgba(0,0,0,.05); border-radius: 8px; overflow: hidden; }
.newbie .nshop + .nshop { margin-top: 16px; padding-top: 16px; border-top: 1px solid #f4f4f4; }
.newbie-title { display: flex; flex-direction: row; align-items: center; margin: 18px 16px 4px; }
.newbie-title-text { font-size: 18px; font-family: Roboto, Roboto-Bold; font-weight: 700; color: #17273a; }
.newbie-title-help { flex: 1; font-size: 14px; font-weight: 400; text-align: right; color: #b9b9b9; }
.nshop { position: relative; display: flex; flex-direction: row; align-items: flex-start; margin-top: 12px; padding: 0 14px; }
.nshop-img { flex-shrink: 0; width: 82px; height: 82px; margin-right: 12px; border-radius: 4px; object-fit: cover; }
.nshop-detail { flex: 1; min-width: 0; }
.nshop-title { font-size: 14px; font-family: 'PingFang SC', 'PingFang SC-Bold'; font-weight: 700; color: #000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nshop-countdown { font-size: 13px; color: #b9b9b9; margin-top: 2px; }
.nshop-precent { display: flex; flex-direction: row; align-items: center; margin-top: 6px; }
.nshop-progress { flex: 1; padding-right: 12px; }
.nshop-progress .bar { height: 8px; border-radius: 6px; background: #f0e3dc; overflow: hidden; }
.nshop-progress .bar span { display: block; height: 100%; background: linear-gradient(115deg, #ffe44b, #fea326); }
.nshop-progress-text { font-size: 14px; font-weight: 700; color: #000; }
.nshop-price { display: flex; align-items: center; justify-content: space-between; margin-top: 6px; }
.nshop-price .np { font-size: 18px; font-weight: 700; color: #ff5c5c; }
.nshop-price .np i { font-size: 12px; font-weight: 400; color: #b9b9b9; font-style: normal; }
.nshop-price .nbtn { padding: 5px 16px; background: linear-gradient(115deg, #ffe44b, #fea326); border-radius: 14px; font-size: 13px; font-weight: 700; color: #ad6701; }

/* finance carousel */
.finance { height: 189px; border-radius: 5px; background: linear-gradient(180deg, #ffe9df, #fff); margin: 0; overflow: hidden; }
.finance-header { display: flex; align-items: center; justify-content: space-between; padding: 15px 13px 0 12px; }
.finance-header-item { display: flex; align-items: center; }
.finance-header-item .iconimg { width: 20px; height: 20px; object-fit: contain; }
.finance-header-item .title { margin-left: 10px; font-size: 16px; font-family: Roboto, Roboto-Bold; font-weight: 700; color: #883c20; }
.finance-header-item .more { font-size: 13px; color: #ee5016; margin-right: 4px; }
.finance-header-item .moreimg { width: 10px; height: 10px; object-fit: contain; }
.finance-main { width: 100%; margin-top: 32px; padding-left: 9px; overflow-x: auto; -webkit-overflow-scrolling: touch; display: flex; flex-wrap: nowrap; }
.finance-main-card { width: 290px; padding: 16px 10px 9px 11px; display: flex; justify-content: flex-start; background: #fff; border-radius: 5px; box-shadow: 0 0 11px 0 rgba(0,0,0,.05); margin-right: 8px; flex-shrink: 0; }
.finance-main-card-image { width: 81px; height: 82px; flex-shrink: 0; }
.finance-main-card-image img { width: 100%; height: 100%; object-fit: contain; }
.finance-main-card-content { margin-left: 8px; flex: 1; }
.finance-main-card-content .ctitle { max-width: 181px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 700; color: #17273a; }
.finance-main-card-content .linepro { margin: 9px 0 5px; width: 175px; height: 8px; }
.finance-main-card-content .linepro .bar { height: 8px; border-radius: 6px; background: #f0e3dc; overflow: hidden; }
.finance-main-card-content .linepro .bar span { display: block; height: 100%; background: linear-gradient(115deg, #ffe44b, #fea326); }
.finance-main-card-content .ditem { display: flex; align-items: center; }
.finance-main-card-content .ditem .ditem-title { font-size: 14px; font-weight: 500; color: #b9b9b9; }
.finance-main-card-content .ditem .ditem-cel { max-width: 110px; margin-left: 3px; font-size: 14px; color: #ff5c5c; overflow: hidden; text-overflow: ellipsis; }

/* glist horizontal (Hot Picks / High value) */
.glist { margin-bottom: 8px; background: #fff; border-radius: 8px; padding-bottom: 8px; }
.glist .header { display: flex; flex-direction: row; align-items: center; justify-content: space-between; height: 45px; padding: 0 14px; }
.glist .header .header-title { font-size: 18px; font-family: Roboto, Roboto-Bold; font-weight: 700; display: flex; align-items: center; color: #17273a; }
.glist .header .header-title img { width: 20px; height: 20px; margin-right: 8.5px; object-fit: contain; }
.glist .header .header-right { flex: 1; text-align: right; color: #b9b9b9; font-size: 14px; }
.glist .main { display: flex; flex-direction: row; flex-wrap: nowrap; align-items: center; justify-content: flex-start; width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; padding: 0 5px; }
.glist .item { background-color: #fff; width: 106px; flex-shrink: 0; margin-right: 12px; border-radius: 5px; padding-top: 17px; }
.glist .item .item-show { display: flex; align-items: center; justify-content: center; height: 74px; position: relative; }
.glist .item .item-show .item-show-prize { white-space: nowrap; width: 92px; height: 21px; background: #90b9ff; border-radius: 10px 10px 0 0; line-height: 21px; font-size: 12px; font-weight: 500; color: #fff; text-align: center; position: absolute; bottom: -1px; z-index: 970; }
.glist .item .item-show img { z-index: 99; max-width: 74px; max-height: 75px; border-radius: 4px; object-fit: cover; }
.glist .item .item-text { display: flex; flex-direction: column; align-items: center; justify-content: space-between; width: 100%; padding: 6px 5px; }
.glist .item .item-text .item-name { width: 100px; text-align: center; font-size: 14px; font-weight: 700; margin-top: 3px; color: #17273a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.glist .item .item-text .item-count { font-size: 16px; font-weight: 700; text-align: center; color: #ff5c5c; }

/* high value variant */
.glist.latest .header { background: url('/static/image/home/high.png'); background-size: 100% 100%; }
.glist.high .header .header-right { display: flex; align-items: center; justify-content: flex-end; }
.glist.high .header-right .hour, .glist.high .header-right .minute, .glist.high .header-right .seconds { width: 20px; height: 21px; text-align: center; line-height: 21px; background: #17273a; border-radius: 4px; font-size: 13px; font-weight: 700; color: #fff; }
.glist.high .header-right .colon { margin: 0 3px; font-size: 13px; font-weight: 700; color: #fff; }
.glist.high .item .item-show { background-color: #fff5f4; }

/* categorized bottom list */
.home-list { margin-top: 14px; }
.home-list .ltab { display: flex; flex-direction: row; align-items: center; justify-content: flex-start; width: 100%; padding: 11px 13px 5px 13px; background: #fff; }
.home-list .ltab .ltab-price { font-size: 16px; font-family: Roboto, Roboto-Medium; font-weight: 700; color: #17273a; display: flex; align-items: center; padding-right: 7px; border-right: 1px solid #e0e0e0; white-space: nowrap; }
.home-list .ltab .ltab-price-arrow { margin-left: 5px; font-size: 10px; color: #ee5016; }
.home-list .ltab .ltab-tab { display: flex; flex-direction: row; flex-wrap: nowrap; align-items: center; justify-content: flex-start; overflow-x: auto; -webkit-overflow-scrolling: touch; padding-left: 10px; }
.home-list .ltab .ltab-item { display: flex; flex-direction: column; align-items: center; justify-content: center; white-space: nowrap; margin-right: 25px; }
.home-list .ltab .ltab-item .ltab-item-text { font-size: 14px; font-family: Roboto, Roboto-Medium; font-weight: 700; color: #b9b9b9; }
.home-list .ltab .ltab-item-active .ltab-item-text { font-size: 16px; color: #17273a; }
.home-list .ltab .ltab-item img { width: 17px; height: 6px; margin-top: 2px; }
.home-list .litem { position: relative; display: flex; align-items: flex-start; justify-content: center; padding: 12px 13px; border-bottom: 0.5px dashed #e6e6e6; background-color: #fff; }
.home-list .litem.lgoods-noborder { border-bottom: none; }
.home-list .litem .litem-left { width: 92px; margin-right: 21px; position: relative; }
.home-list .litem .litem-left .litem-img { max-width: 92px; max-height: 92px; border-radius: 4px; object-fit: cover; }
.home-list .litem .litem-left .item-prize { white-space: nowrap; width: 92px; height: 21px; background: #90b9ff; border-radius: 10px 10px 0 0; line-height: 21px; font-size: 12px; font-weight: 500; color: #fff; text-align: center; position: absolute; top: 73px; left: 0; }
.home-list .litem .litem-right { flex: 1; min-width: 0; }
.home-list .litem .litem-right .lgoods-title { font-size: 16px; font-family: Roboto, Roboto-Medium; font-weight: 700; text-align: left; color: #000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.home-list .litem .litem-right .lgoods-end { margin-top: 7px; font-size: 13px; color: #b9b9b9; }
.home-list .litem .litem-right .draw-color { color: #ee5016; }
.home-list .litem .litem-right .lgoods-precent { display: flex; flex-direction: row; align-items: center; margin-top: 4px; margin-bottom: 1.5px; }
.home-list .litem .litem-right .lgoods-precent .lgoods-progress { flex: 1; padding-right: 12px; }
.home-list .litem .litem-right .lgoods-precent .lgoods-progress .bar { height: 8px; border-radius: 6px; background: #f0e3dc; overflow: hidden; }
.home-list .litem .litem-right .lgoods-precent .lgoods-progress .bar span { display: block; height: 100%; background: linear-gradient(115deg, #ffe44b, #fea326); }
.home-list .litem .litem-right .lgoods-precent .lgoods-progress-text { text-align: right; font-size: 14px; font-weight: 700; color: #b9b9b9; }
.home-list .litem .litem-right .lgoods-price { display: flex; flex-direction: row; align-items: center; justify-content: flex-start; }
.home-list .litem .litem-right .lgoods-price .lgoods-price-old { margin-right: 10px; font-size: 14px; font-weight: 700; color: #b9b9b9; text-decoration: line-through; }
.home-list .litem .litem-right .lgoods-price .lgoods-price-new { font-size: 16px; font-weight: 700; color: #ee5016; }
.home-list .litem .lgoods-btn { position: absolute; right: 16px; bottom: 9px; display: flex; flex-direction: row; align-items: center; justify-content: center; width: 75px; height: 30px; background: linear-gradient(115deg, #ffe44b, #fea326); border-radius: 4px; box-shadow: 0 -2px 4px 0 rgba(255,125,0,.5) inset; font-size: 14px; font-weight: 700; color: #ad6701; }
.home-list .litem .lgoods-btn img { width: 14px; height: 14px; margin-left: 2px; }

/* floating prize */
/* Anchor the floating entry to the centered 375 frame's right edge (not the browser window),
   so it stays inside the phone frame on viewports wider than --maxw. */
.home-prize { width: 78px; height: 69px; position: fixed; right: calc(50% - var(--maxw) / 2 + 7px); bottom: 95px; z-index: 999; }
.home-prize img { width: 100%; height: 100%; object-fit: contain; }
</style>
