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
    navTitle: 'Add Address',
    name: 'Name',
    namePh: 'Receiver name',
    phone: 'Phone',
    phonePh: 'Phone number',
    pincode: 'Pincode',
    pincodePh: 'PIN code',
    address: 'Address',
    addressPh: 'House, street, city',
    save: 'Save address',
    errFill: 'Fill name and address',
    saved: 'Saved',
  },
  hi: {
    navTitle: 'पता जोड़ें',
    name: 'नाम',
    namePh: 'प्राप्तकर्ता का नाम',
    phone: 'फ़ोन',
    phonePh: 'फ़ोन नंबर',
    pincode: 'पिनकोड',
    pincodePh: 'पिन कोड',
    address: 'पता',
    addressPh: 'मकान, गली, शहर',
    save: 'पता सेव करें',
    errFill: 'नाम और पता भरें',
    saved: 'सेव हो गया',
  },
} });
const f = reactive({ name: '', phone: '', pincode: '', address: '' });
const busy = ref(false);

async function save() {
  if (!f.name || !f.address) return toast(t('errFill'));
  busy.value = true;
  const line = [f.address, f.pincode].filter(Boolean).join(', ');
  try {
    await api.addressAdd({ name: f.name, phone: f.phone, pincode: f.pincode, line });
    toast(t('saved'));
    router.back();
  } catch (e) { toast(e.message); } finally { busy.value = false; }
}
</script>

<!-- Faithful rebuild of the real pages/address/add (.add) + scoped CSS. -->
<template>
  <div class="add">
    <NavBar :title="t('navTitle')" />

    <div class="content">
      <div class="receiver">
        <span class="receiver_left reces">{{ t('name') }}</span>
        <input class="input" v-model="f.name" :placeholder="t('namePh')" />
      </div>
      <div class="receiver">
        <span class="receiver_left phone">{{ t('phone') }}</span>
        <input class="input" v-model="f.phone" inputmode="numeric" :placeholder="t('phonePh')" />
      </div>
      <div class="receiver">
        <span class="receiver_left city">{{ t('pincode') }}</span>
        <input class="input" v-model="f.pincode" inputmode="numeric" :placeholder="t('pincodePh')" />
      </div>
      <div class="bottom_address">
        <span class="receiver_left address">{{ t('address') }}</span>
        <input class="input" v-model="f.address" :placeholder="t('addressPh')" />
      </div>
    </div>

    <button class="addbtn" :disabled="busy" @click="save">{{ t('save') }}</button>
  </div>
</template>

<style scoped>
.add { min-height: 100vh; background-color: #f8f8f8; padding-bottom: 90px; }
.title { position: relative; padding-left: 19px; margin-top: 56px; background-color: #fff; }
.title img { position: absolute; top: 3px; right: 17px; width: 17px; height: 17.50px; }
.title_content { display: inline-block; margin-left: 100px; margin-bottom: 10px; vertical-align: middle; color: #000; font-family: Roboto, Roboto-Bold; font-weight: 700; font-size: 16px; }
.content { border-top: 0.50px solid #ececec; background: #fff; padding: 0 10px; margin-top: 10px; }
.receiver { margin: 0 15px; border-bottom: 0.50px solid #ececec; display: flex; align-items: center; height: 56px; }
.receiver .input { flex: 1; border: none; outline: none; font-size: 16px; font-family: Roboto, Roboto-Regular; font-weight: 400; background: transparent; }
.receiver_left { font-size: 16px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #444; }
.receiver_left_pla { font-size: 16px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #b9b9b9; }
.reces { margin-right: 27.50px; }
.phone { margin-right: 42.50px; }
.city { margin-right: 61px; }
.address { margin-right: 29.50px; }
.bottom_address { margin: 0 15px; display: flex; align-items: flex-start; padding: 16px 0; }
.bottom_address .input { flex: 1; border: none; outline: none; font-size: 16px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #7b7b7b; background: transparent; }
.addbtn { position: fixed; bottom: 18px; left: 50%; transform: translateX(-50%); width: 300px; height: 45px; z-index: 999; background: #ee5016; color: #fff; border-radius: 4px; font-size: 16px; font-weight: 700; }
.addbtn:disabled { opacity: 0.6; }
</style>
