<script setup>
import { onMounted, ref } from 'vue';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';

const staticParagraphs = [
  '1. Each product round requires a fixed number of shares to sell out before a draw takes place.',
  '2. You may buy one or more shares in a round; every share you hold is assigned its own lucky code.',
  '3. Once all shares in a round are sold, a winning code is drawn transparently from every issued code.',
  '4. The holder of the winning code receives the product. Other participants may keep joining new rounds.',
  '5. Wallet balance can be topped up by recharge and withdrawn to a verified bank account or address.',
  '6. VIP members receive a daily bonus and a higher referral rebate on invited friends.',
  '7. Invite friends with your referral code to build a team and earn commission on their activity.',
  '8. ORich reserves the right to adjust rules and reward rates; the latest version always applies.',
];

const title = ref('Rules');
const paragraphs = ref(staticParagraphs);

onMounted(async () => {
  try {
    const r = await api.ruleText();
    if (r?.title) title.value = r.title;
    const parts = String(r?.content || '')
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length) paragraphs.value = parts;
  } catch {
    // Keep the static fallback text if the call fails.
  }
});
</script>

<!-- Faithful rebuild of the real pages/richtext/rule layout + scoped CSS. -->
<template>
  <div>
    <NavBar :title="title" />
    <div class="detail">
      <div class="text">
        <p v-for="(p, i) in paragraphs" :key="i">{{ p }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail { width: 100%; min-height: 100vh; padding: 8px 15px; background: #f8f8f8; }
.detail .text { background: #fff; padding: 20px 29px; font-size: 14px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #17273a; word-break: keep-all; }
.detail .text p { margin: 0 0 14px; line-height: 1.7; }
.detail .text p:last-child { margin-bottom: 0; }
.loading { display: flex; justify-content: center; }
</style>
