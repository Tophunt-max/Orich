<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useToast } from '../components/useToast';

const router = useRouter();
const { toast } = useToast();
const { t } = useI18n({ useScope: 'local', messages: {
  en: {
    navTitle: 'Add Payment Method',
    bank: 'Bank',
    bankPh: 'Bank name',
    account: 'Account',
    accountPh: 'Account number',
    ifsc: 'IFSC',
    ifscPh: 'IFSC code',
    holder: 'Holder',
    holderPh: 'Account holder name',
    save: 'Save',
    errFill: 'Enter bank name and account',
    saved: 'Saved',
  },
  hi: {
    navTitle: 'भुगतान तरीका जोड़ें',
    bank: 'बैंक',
    bankPh: 'बैंक का नाम',
    account: 'खाता',
    accountPh: 'खाता नंबर',
    ifsc: 'IFSC',
    ifscPh: 'IFSC कोड',
    holder: 'धारक',
    holderPh: 'खाताधारक का नाम',
    save: 'सेव करें',
    errFill: 'बैंक का नाम और खाता नंबर डालें',
    saved: 'सेव हो गया',
  },
} });
const f = reactive({ bankName: '', account: '', ifsc: '', holder: '' });
const busy = ref(false);

async function save() {
  if (!f.bankName || !f.account) return toast(t('errFill'));
  busy.value = true;
  try {
    await api.bankAdd({ type: f.bankName, number: f.account, ifsc: f.ifsc, holder: f.holder });
    toast(t('saved'));
    router.back();
  } catch (e) { toast(e.message); } finally { busy.value = false; }
}
</script>

<!-- Faithful rebuild of the real pages/payment/add (.add) + scoped CSS. -->
<template>
  <div class="add">
    <NavBar :title="t('navTitle')" />

    <div class="add_form">
      <div class="add_form_item border_bottom">
        <div class="add_form_item_left">{{ t('bank') }}</div>
        <input class="add_form_item_right" v-model="f.bankName" :placeholder="t('bankPh')" />
      </div>
      <div class="add_form_item border_bottom">
        <div class="add_form_item_left">{{ t('account') }}</div>
        <input class="add_form_item_right" v-model="f.account" inputmode="numeric" :placeholder="t('accountPh')" />
      </div>
      <div class="add_form_item border_bottom">
        <div class="add_form_item_left">{{ t('ifsc') }}</div>
        <input class="add_form_item_right" v-model="f.ifsc" :placeholder="t('ifscPh')" />
      </div>
      <div class="add_form_item">
        <div class="add_form_item_left">{{ t('holder') }}</div>
        <input class="add_form_item_right" v-model="f.holder" :placeholder="t('holderPh')" />
      </div>
    </div>

    <button class="add_submin" :disabled="busy" @click="save">{{ t('save') }}</button>
  </div>
</template>

<style scoped>
.add { min-height: 100vh; background: #f8f8f8; padding-bottom: 100px; }
.add .img { width: 100%; }
.add .nav_right { width: 14.50px; height: 15.50px; display: inline-block; position: absolute; right: 30px; }
.add .add_top { padding-bottom: 10px; padding-left: 19px; height: 44px; line-height: 44px; background: #fff; border-bottom: 0.50px solid #ececec; }
.add .add_top .add_top_title { display: inline-block; margin-left: 107px; font-weight: 700; }
.add .add_top .add_top_del { width: 14.50px; height: 15.50px; display: inline-block; margin-left: 104px; }
.add .add_form { background-color: #fff; margin-left: 1px; padding-left: 15px; padding-right: 14px; margin-top: 10px; }
.add .add_form .border_bottom { border-bottom: 0.50px solid #ececec; }
.add .add_form .add_form_item { height: 61px; line-height: 61px; display: flex; align-items: center; }
.add .add_form .add_form_item .add_form_item_left { width: 61px; color: #17273a; font-weight: 500; }
.add .add_form .add_form_item .add_form_item_right { margin-left: 25px; height: 35px; width: 75%; border: none; outline: none; font-size: 16px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #444; background: transparent; }
.add .add_submin { width: 300px; height: 45px; position: fixed; left: 50%; transform: translateX(-50%); bottom: 19px; z-index: 999; background: #ee5016; color: #fff; border-radius: 4px; font-size: 16px; font-weight: 700; }
.add .add_submin:disabled { opacity: 0.6; }
</style>
