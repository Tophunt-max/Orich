<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';

const { t } = useI18n({
  useScope: 'local',
  messages: {
    en: {
      rulesTitle: 'Rules',
      rule1: '1. Each product round requires a fixed number of shares to sell out before a draw takes place.',
      rule2: '2. You may buy one or more shares in a round; every share you hold is assigned its own lucky code.',
      rule3: '3. Once all shares in a round are sold, a winning code is drawn transparently from every issued code.',
      rule4: '4. The holder of the winning code receives the product. Other participants may keep joining new rounds.',
      rule5: '5. Wallet balance can be topped up by recharge and withdrawn to a verified bank account or address.',
      rule6: '6. VIP members receive a daily bonus and a higher referral rebate on invited friends.',
      rule7: '7. Invite friends with your referral code to build a team and earn commission on their activity.',
      rule8: '8. ORich reserves the right to adjust rules and reward rates; the latest version always applies.',
    },
    hi: {
      rulesTitle: 'नियम',
      rule1: '1. किसी भी प्रोडक्ट राउंड में ड्रॉ होने से पहले एक निश्चित संख्या में शेयर बिकने चाहिए।',
      rule2: '2. आप एक राउंड में एक या अधिक शेयर खरीद सकते हैं; आपके पास मौजूद हर शेयर को उसका अपना लकी कोड मिलता है।',
      rule3: '3. जब राउंड के सभी शेयर बिक जाते हैं, तो जारी किए गए सभी कोड में से पारदर्शी तरीके से एक विजेता कोड निकाला जाता है।',
      rule4: '4. विजेता कोड रखने वाले को प्रोडक्ट मिलता है। अन्य प्रतिभागी नए राउंड में शामिल होते रह सकते हैं।',
      rule5: '5. वॉलेट बैलेंस को रिचार्ज से बढ़ाया जा सकता है और सत्यापित बैंक खाते या पते पर निकाला जा सकता है।',
      rule6: '6. VIP सदस्यों को रोज़ाना बोनस और आमंत्रित दोस्तों पर अधिक रेफ़रल रिबेट मिलता है।',
      rule7: '7. टीम बनाने और उनकी गतिविधि पर कमीशन कमाने के लिए अपने रेफ़रल कोड से दोस्तों को आमंत्रित करें।',
      rule8: '8. ORich के पास नियम और इनाम दरें बदलने का अधिकार सुरक्षित है; हमेशा नवीनतम संस्करण लागू होता है।',
    },
  },
});

const staticParagraphs = computed(() => [
  t('rule1'), t('rule2'), t('rule3'), t('rule4'),
  t('rule5'), t('rule6'), t('rule7'), t('rule8'),
]);

const apiTitle = ref('');
const apiParagraphs = ref([]);
const title = computed(() => apiTitle.value || t('rulesTitle'));
const paragraphs = computed(() => (apiParagraphs.value.length ? apiParagraphs.value : staticParagraphs.value));

onMounted(async () => {
  try {
    const r = await api.ruleText();
    if (r?.title) apiTitle.value = r.title;
    const parts = String(r?.content || '')
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length) apiParagraphs.value = parts;
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
