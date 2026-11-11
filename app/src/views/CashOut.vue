<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useAuth } from '../stores/auth';
import { useToast } from '../components/useToast';

const router = useRouter();
const auth = useAuth();
const { toast } = useToast();
const { t } = useI18n({ useScope: 'local', messages: {
  en: {
    navTitle: 'Withdraw',
    records: 'Records',
    method: 'Method',
    selectAccount: 'Select account',
    bankFallback: 'Bank',
    tapSwitch: 'Tap the method to switch · ',
    addAccount: '+ Add a bank / UPI account',
    wdAmount: 'Withdrawal amount',
    availBalance: 'Available balance',
    all: 'All',
    requestBtn: 'Request withdrawal',
    instructions: 'Instructions',
    minMsg: 'Minimum withdrawal is ₹{n}',
    exceed: 'Amount exceeds available balance',
    addFirst: 'Add a bank / UPI account first',
    requested: 'Withdrawal requested',
    tip1: '1. Minimum withdrawal amount is ₹{n} per request.',
    tip2: '2. Fee: {n}% is deducted from each withdrawal.',
    tip3: '3. Arrives in {v}.',
    tip4: '4. Make sure your bank / UPI details are correct before submitting.',
  },
  hi: {
    navTitle: 'निकासी',
    records: 'रिकॉर्ड',
    method: 'तरीका',
    selectAccount: 'खाता चुनें',
    bankFallback: 'बैंक',
    tapSwitch: 'तरीका बदलने के लिए टैप करें · ',
    addAccount: '+ बैंक / UPI खाता जोड़ें',
    wdAmount: 'निकासी राशि',
    availBalance: 'उपलब्ध बैलेंस',
    all: 'सभी',
    requestBtn: 'निकासी का अनुरोध करें',
    instructions: 'निर्देश',
    minMsg: 'न्यूनतम निकासी ₹{n} है',
    exceed: 'राशि उपलब्ध बैलेंस से अधिक है',
    addFirst: 'पहले बैंक / UPI खाता जोड़ें',
    requested: 'निकासी का अनुरोध भेजा गया',
    tip1: '1. हर अनुरोध पर न्यूनतम निकासी राशि ₹{n} है।',
    tip2: '2. शुल्क: हर निकासी से {n}% काटा जाता है।',
    tip3: '3. {v} में पहुँच जाएगा।',
    tip4: '4. सबमिट करने से पहले सुनिश्चित करें कि आपके बैंक / UPI विवरण सही हैं।',
  },
} });
const amount = ref('');
const banks = ref([]);
const picked = ref(0);
const busy = ref(false);
// Real withdrawal rules (fee / min / arrival) from api.balance().withdraw.
const withdraw = ref(null);

const balance = computed(() => auth.user?.balance ?? '0.00');
const selectedBank = computed(() => banks.value[picked.value] || null);
const minWithdraw = computed(() => Number(withdraw.value?.min ?? 100));

onMounted(async () => {
  await auth.refresh();
  try { withdraw.value = (await api.balance()).withdraw || null; } catch (e) { toast(e.message); }
  try { banks.value = (await api.bankList()).list || []; } catch (e) { toast(e.message); }
});

function bankLabel(b) {
  if (!b) return '';
  const tail = String(b.number || '').slice(-4);
  return (b.type || t('bankFallback')) + (tail ? ' ·· ' + tail : '');
}
function cycleBank() {
  if (banks.value.length > 1) picked.value = (picked.value + 1) % banks.value.length;
}
function all() { amount.value = String(balance.value); }

async function submit() {
  const v = Number(amount.value);
  if (!v || v < minWithdraw.value) return toast(t('minMsg', { n: minWithdraw.value }));
  if (v > Number(balance.value)) return toast(t('exceed'));
  if (!selectedBank.value) return toast(t('addFirst'));
  busy.value = true;
  try {
    const d = await api.withdraw(v);
    auth.user = { ...auth.user, balance: d.balance };
    toast(t('requested'));
    amount.value = '';
  } catch (e) { toast(e.message); }
  finally { busy.value = false; }
}
</script>

<!-- Faithful rebuild of the real pages/payment/cashOut (.cashout) + scoped CSS:
     method selection, amount input, available balance, withdraw button, fee/arrival tips. -->
<template>
  <div class="cashout">
    <NavBar :title="t('navTitle')" :right="t('records')" @right="router.push('/cashrecord')" />

    <div class="cashout_main">
      <!-- bank / method selection -->
      <div class="cashout_main_title">
        <span>{{ t('method') }}</span>
        <div class="cashout_main_title_right" @click="cycleBank">
          <div class="cashout_main_title_right_item">
            <div class="cashout_main_title_img"><img src="/static/image/pay/icon_identification.png" alt="" /></div>
            <div class="cashout_main_title_name">{{ selectedBank ? bankLabel(selectedBank) : t('selectAccount') }}</div>
          </div>
        </div>
      </div>
      <div class="cashout_main_title_right_tips" @click="router.push('/payment/add')">
        {{ banks.length ? (banks.length > 1 ? t('tapSwitch') : '') + t('addAccount') : t('addAccount') }}
      </div>

      <!-- amount input -->
      <div class="cashout_main_amount">{{ t('wdAmount') }} <span>(₹)</span></div>
      <div class="cashout_main_money">
        ₹<input v-model="amount" type="number" :min="minWithdraw" placeholder="0" />
      </div>

      <!-- available balance -->
      <div class="cashout_main_balance">
        <span class="cashout_main_balance_left">{{ t('availBalance') }} ₹{{ balance }}</span>
        <span class="cashout_main_balance_right" @click="all">{{ t('all') }}</span>
      </div>
    </div>

    <button class="cashout_btn" :disabled="busy || !amount" @click="submit">{{ t('requestBtn') }}</button>

    <!-- fee / arrival info -->
    <div class="cashout_tip">
      <div class="cashout_tip_title">{{ t('instructions') }}</div>
      <div class="cashout_tip_item">{{ t('tip1', { n: minWithdraw }) }}</div>
      <div v-if="withdraw?.feePercent != null" class="cashout_tip_item">{{ t('tip2', { n: withdraw.feePercent }) }}</div>
      <div v-if="withdraw?.arrival" class="cashout_tip_item">{{ t('tip3', { v: withdraw.arrival }) }}</div>
      <div class="cashout_tip_item">{{ t('tip4') }}</div>
    </div>
  </div>
</template>

<style scoped>
.cashout { min-height: 100vh; background: #f8f8f8; padding-bottom: 15px; }
.cashout_main { margin: 12px 15px 0 15px; padding: 19px 9px 19px 13px; background: #fff; border-radius: 8px; }
.cashout_main_title { font-size: 16px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #17273a; display: flex; align-items: center; position: relative; white-space: nowrap; }
.cashout_main_title_right { margin-left: 20px; width: 160px; text-align: left; }
.cashout_main_title_right_item { display: flex; align-items: center; justify-content: flex-end; overflow: hidden; }
.cashout_main_title_img { height: 20px; width: 20px; flex-shrink: 0; border-radius: 50%; overflow: hidden; }
.cashout_main_title_img img { width: 100%; height: 100%; object-fit: cover; }
.cashout_main_title_name { margin-left: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cashout_main_title_right_tips { margin-top: 17px; font-size: 14px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #ee5016; text-align: right; padding-right: 9px; padding-bottom: 14px; border-bottom: 0.5px solid #ececec; }
.cashout_main_amount { font-size: 16px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #17273a; margin-top: 14px; margin-bottom: 10px; }
.cashout_main_amount span { font-size: 12px; color: #b9b9b9; }
.cashout_main_money { font-size: 32px; font-family: Roboto, Roboto-Bold; font-weight: 700; color: #ee5016; padding-bottom: 14px; border-bottom: 0.5px solid #ececec; display: flex; align-items: flex-start; }
.cashout_main_money input { font-size: 32px; margin-left: 5px; flex: 1; width: 100%; border: none; outline: none; color: #ee5016; background: transparent; font-weight: 700; }
.cashout_main_balance { margin-top: 17px; display: flex; align-items: center; justify-content: space-between; }
.cashout_main_balance_left { font-family: Roboto, Roboto-Regular; font-weight: 400; color: #b9b9b9; font-size: 14px; }
.cashout_main_balance_right { margin-right: 2px; font-size: 14px; font-family: Roboto, Roboto-Regular; font-weight: 400; text-align: left; color: #ee5016; }
.cashout_btn { display: block; width: 300px; height: 45px; margin: 50px auto 0; border-radius: 4px; background: #ee5016; color: #fff; font-size: 16px; font-weight: 700; }
.cashout_btn:disabled { opacity: 0.6; }
.cashout_tip { margin: 25px 15px 0 15px; padding: 0 10px; color: #17273a; }
.cashout_tip .cashout_tip_title { font-size: 16px; margin-bottom: 10px; font-weight: 700; }
.cashout_tip .cashout_tip_item { margin: 5px 0; font-size: 13px; color: #8f8f8f; }
</style>
