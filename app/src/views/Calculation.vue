<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import NavBar from '../components/NavBar.vue';

const { t } = useI18n({ useScope: 'local', messages: {
  en: {
    navTitle: 'Winning Calculation',
    algTitle: 'Winning algorithm',
    algText1: '(Sum of all participation numbers + value of the last participation) ÷ total shares',
    algText2: 'The remainder decides the lucky winning number.',
    intro: 'When a group buy is fully subscribed, every share is assigned a unique participation number. The system adds up all numbers and applies the formula above',
    introSpan: 'to pick the winner fairly and transparently.',
    partTime: 'Participation time',
    luckyNum: 'Lucky number',
    finalTitle: 'Final lucky number',
    resultBefore: 'The last',
    resultDigits: '7 digits',
    resultAfter: 'of the calculated value',
    prizeTiers: 'Prize tiers',
    rank1: '1st prize',
    rank1Num: 'Last 7 digits',
    rank2: '2nd prize',
    rank2Num: 'Last 5 digits',
    rank3: '3rd prize',
    rank3Num: 'Last 3 digits',
  },
  hi: {
    navTitle: 'विजेता गणना',
    algTitle: 'विजेता चुनने का एल्गोरिदम',
    algText1: '(सभी भागीदारी नंबरों का योग + आखिरी भागीदारी का मान) ÷ कुल शेयर',
    algText2: 'शेष बचा मान लकी विजेता नंबर तय करता है।',
    intro: 'जब कोई ग्रुप बाय पूरी तरह भर जाता है, तो हर शेयर को एक अनोखा भागीदारी नंबर दिया जाता है। सिस्टम सभी नंबरों को जोड़ता है और ऊपर दिए फ़ॉर्मूले को लागू करता है',
    introSpan: 'ताकि विजेता निष्पक्ष और पारदर्शी तरीके से चुना जा सके।',
    partTime: 'भागीदारी का समय',
    luckyNum: 'लकी नंबर',
    finalTitle: 'अंतिम लकी नंबर',
    resultBefore: 'गणना किए गए मान के आखिरी',
    resultDigits: '7 अंक',
    resultAfter: '',
    prizeTiers: 'इनाम श्रेणियाँ',
    rank1: 'पहला इनाम',
    rank1Num: 'आखिरी 7 अंक',
    rank2: 'दूसरा इनाम',
    rank2Num: 'आखिरी 5 अंक',
    rank3: 'तीसरा इनाम',
    rank3Num: 'आखिरी 3 अंक',
  },
} });

const example = [
  { time: '2026-11-08 20:00:01', code: '8829301' },
  { time: '2026-11-08 20:00:02', code: '1920233' },
  { time: '2026-11-08 20:00:03', code: '4471920' },
  { time: '2026-11-08 20:00:05', code: '6628104' },
  { time: '2026-11-08 20:00:06', code: '3390517' },
];
const ranks = computed(() => [
  { title: t('rank1'), num: t('rank1Num') },
  { title: t('rank2'), num: t('rank2Num') },
  { title: t('rank3'), num: t('rank3Num') },
]);
</script>

<!-- Faithful rebuild of the real pages/goods/calculation (.calculation) + scoped CSS. -->
<template>
  <div class="calculation">
    <NavBar :title="t('navTitle')" />

    <div class="alg">
      <div class="alg-title">{{ t('algTitle') }}</div>
      <div class="alg-text">{{ t('algText1') }}</div>
      <div class="alg-text">{{ t('algText2') }}</div>
    </div>

    <div class="intro">
      {{ t('intro') }}<span>{{ t('introSpan') }}</span>
    </div>

    <div class="list">
      <div class="header">
        <div class="header-left">{{ t('partTime') }}</div>
        <div class="header-right">{{ t('luckyNum') }}</div>
      </div>
      <div class="main">
        <div v-for="(r, i) in example" :key="i" class="item">
          <div class="item-left">{{ r.time }}</div>
          <div class="item-right"><span>{{ r.code }}</span></div>
        </div>
      </div>
    </div>

    <div class="result">
      <div class="result-title">{{ t('finalTitle') }}</div>
      <div class="result-main">{{ t('resultBefore') }} <span>{{ t('resultDigits') }}</span> {{ t('resultAfter') }}</div>
    </div>

    <div class="discount">
      <div>{{ t('prizeTiers') }}</div>
      <div class="discount_rank">
        <div v-for="(r, i) in ranks" :key="i" class="discount_rank_item">
          <div class="discount_rank_item_title">{{ r.title }}</div>
          <div class="discount_rank_item_num">{{ r.num }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calculation { position: relative; min-height: 100vh; padding: 0 15px 15px 15px; background: #f9f9f9; }
.calculation .alg { width: 100%; margin-top: 8px; padding: 15px 14px; background: linear-gradient(283deg, #ee5016, rgba(238, 80, 22, .65)); border-radius: 8px; }
.calculation .alg .alg-title { font-size: 16px; font-family: Roboto, Roboto-Bold; font-weight: 700; color: #fff; }
.calculation .alg .alg-text { margin-top: 5px; font-size: 14px; font-family: Roboto, Roboto-Medium; font-weight: 700; color: #fff; }
.calculation .intro { width: 100%; margin-top: 8px; padding: 14px 14px; background: #fff; font-size: 14px; font-family: Roboto, Roboto-Medium; font-weight: 700; text-align: left; color: #17273a; border-radius: 8px; }
.calculation .intro span { color: #ee5016; }
.calculation .intro span:before { content: " "; }
.calculation .list { width: 100%; padding: 0 14px; background: #fff; margin-top: 8px; border-radius: 8px; }
.calculation .list .header { display: flex; flex-direction: row; align-items: center; justify-content: space-between; width: 100%; height: 45px; }
.calculation .list .header .header-left { font-size: 14px; font-family: Roboto, Roboto-Medium; font-weight: 700; text-align: center; color: #b9b9b9; }
.calculation .list .header .header-right { font-size: 14px; font-family: Roboto, Roboto-Bold; font-weight: 700; text-align: center; color: #b9b9b9; }
.calculation .list .main { width: 100%; max-height: 200px; overflow-y: auto; }
.calculation .list .main .item { display: flex; flex-direction: row; align-items: center; justify-content: space-between; width: 100%; height: 46px; border-top: 0.50px solid #ececec; }
.calculation .list .main .item .item-left { font-size: 13px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #b9b9b9; }
.calculation .list .main .item .item-right { font-size: 13px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #b9b9b9; }
.calculation .list .main span { color: #ee5016; }
.calculation .result { width: 100%; margin-top: 8px; padding: 10px 11px; background: #fff; border-radius: 8px; }
.calculation .result .result-title { width: 100%; font-size: 14px; font-family: Roboto, Roboto-Medium; font-weight: 700; text-align: left; color: #17273a; }
.calculation .result .result-main { width: 100%; margin: 12px 0; font-size: 18px; font-family: Roboto, Roboto-Medium; font-weight: 700; text-align: center; color: #17273a; }
.calculation .result .result-main span { color: #ee5016; }
.calculation .discount { width: 100%; background: #fff; margin-top: 8px; font-size: 14px; font-family: Roboto, Roboto-Medium; color: #17273a; padding: 10px 0 10px 10px; border-radius: 8px; }
.calculation .discount .discount_rank { margin-top: 10px; padding-right: 10px; }
.calculation .discount .discount_rank .discount_rank_item { display: flex; font-size: 16px; margin-bottom: 10px; min-height: 32px; line-height: 32px; }
.calculation .discount .discount_rank .discount_rank_item .discount_rank_item_title { white-space: nowrap; text-align: right; width: 100px; }
.calculation .discount .discount_rank .discount_rank_item .discount_rank_item_num { color: #ee5016; margin-left: 5px; }
</style>
