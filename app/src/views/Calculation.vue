<script setup>
import NavBar from '../components/NavBar.vue';

const example = [
  { time: '2026-11-08 20:00:01', code: '8829301' },
  { time: '2026-11-08 20:00:02', code: '1920233' },
  { time: '2026-11-08 20:00:03', code: '4471920' },
  { time: '2026-11-08 20:00:05', code: '6628104' },
  { time: '2026-11-08 20:00:06', code: '3390517' },
];
const ranks = [
  { title: '1st prize', num: 'Last 7 digits' },
  { title: '2nd prize', num: 'Last 5 digits' },
  { title: '3rd prize', num: 'Last 3 digits' },
];
</script>

<!-- Faithful rebuild of the real pages/goods/calculation (.calculation) + scoped CSS. -->
<template>
  <div class="calculation">
    <NavBar title="Winning Calculation" />

    <div class="alg">
      <div class="alg-title">Winning algorithm</div>
      <div class="alg-text">(Sum of all participation numbers + value of the last participation) ÷ total shares</div>
      <div class="alg-text">The remainder decides the lucky winning number.</div>
    </div>

    <div class="intro">
      When a group buy is fully subscribed, every share is assigned a unique participation number. The system adds up all
      numbers and applies the formula above<span>to pick the winner fairly and transparently.</span>
    </div>

    <div class="list">
      <div class="header">
        <div class="header-left">Participation time</div>
        <div class="header-right">Lucky number</div>
      </div>
      <div class="main">
        <div v-for="(r, i) in example" :key="i" class="item">
          <div class="item-left">{{ r.time }}</div>
          <div class="item-right"><span>{{ r.code }}</span></div>
        </div>
      </div>
    </div>

    <div class="result">
      <div class="result-title">Final lucky number</div>
      <div class="result-main">The last <span>7 digits</span> of the calculated value</div>
    </div>

    <div class="discount">
      <div>Prize tiers</div>
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
