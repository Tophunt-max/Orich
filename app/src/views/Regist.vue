<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { api } from '../api/client';
import { useAuth } from '../stores/auth';
import { useToast } from '../components/useToast';

const { t } = useI18n({
  useScope: 'local',
  messages: {
    en: {
      enterPhone: 'Enter phone number',
      demoCode: 'Demo code: {code}',
      enterPhoneCode: 'Enter phone and code',
      register: 'Register',
      createAccount: 'Create your ORich account',
      phoneNumber: 'Phone Number',
      phonePlaceholder: 'Enter phone number',
      verificationCode: 'Verification Code',
      codePlaceholder: 'Enter code',
      sendOtp: 'Send OTP',
      invitationCode: 'Invitation code',
      optional: 'Optional',
      registerSuccess: 'Registration successful! Welcome to ORich.',
    },
    hi: {
      enterPhone: 'फ़ोन नंबर दर्ज करें',
      demoCode: 'डेमो कोड: {code}',
      enterPhoneCode: 'फ़ोन नंबर और कोड दर्ज करें',
      register: 'रजिस्टर करें',
      createAccount: 'अपना ORich खाता बनाएं',
      phoneNumber: 'फ़ोन नंबर',
      phonePlaceholder: 'फ़ोन नंबर दर्ज करें',
      verificationCode: 'सत्यापन कोड',
      codePlaceholder: 'कोड दर्ज करें',
      sendOtp: 'OTP भेजें',
      invitationCode: 'आमंत्रण कोड',
      optional: 'वैकल्पिक',
      registerSuccess: 'पंजीकरण सफल! ORich में आपका स्वागत है।',
    },
  },
});

const router = useRouter();
const auth = useAuth();
const { toast } = useToast();

const phone = ref('');
const code = ref('');
const invite = ref('');
const cd = ref(0);
const busy = ref(false);
const showSuccess = ref(false);

async function send() {
  if (!phone.value) return toast(t('enterPhone'));
  try {
    const d = await api.sendVerify(phone.value);
    cd.value = 60;
    const t = setInterval(() => { if (--cd.value <= 0) clearInterval(t); }, 1000);
    if (d.demoCode) { code.value = d.demoCode; toast(t('demoCode', { code: d.demoCode })); }
  } catch (e) { toast(e.message); }
}

async function submit() {
  if (!phone.value || !code.value) return toast(t('enterPhoneCode'));
  busy.value = true;
  try {
    await auth.signIn(phone.value, code.value, invite.value);
    showSuccess.value = true;
    setTimeout(() => router.replace('/home'), 1500);
  } catch (e) { toast(e.message); }
  finally { busy.value = false; }
}
</script>

<!-- Faithful rebuild of the real ORich 2.1.4 pages/login/regist (real classes + scoped CSS):
     phone input, verify-code, invitation code block, and the success popup. -->
<template>
  <div class="login">
    <div class="backicon" @click="router.back()"><span class="back-arrow">‹</span></div>

    <div class="title">{{ t('register') }}</div>
    <div class="tips">{{ t('createAccount') }}</div>

    <div class="input-title">{{ t('phoneNumber') }}</div>
    <div class="inputview">
      <img class="inputview-flag" src="/static/image/login/icon_iphone.png" alt="" />
      <span class="inputview-num">+91</span>
      <span class="inputview-op"></span>
      <input class="inputview-input" v-model="phone" type="tel" inputmode="numeric" :placeholder="t('phonePlaceholder')" />
    </div>

    <div class="input-title">{{ t('verificationCode') }}</div>
    <div class="send">
      <input class="send-input" v-model="code" inputmode="numeric" :placeholder="t('codePlaceholder')" />
      <div class="wrap" @click="cd === 0 && send()">{{ cd > 0 ? cd + 's' : t('sendOtp') }}</div>
    </div>

    <div class="invitation">
      <div class="code_people">{{ t('invitationCode') }}</div>
      <div class="code_ipu">
        <img src="/static/image/login/icon_invitation.png" alt="" />
        <input class="inputview-input ipu" v-model="invite" :placeholder="t('optional')" />
      </div>
    </div>

    <button class="nextbtn" :disabled="busy" @click="submit">{{ t('register') }}</button>

    <!-- success popup -->
    <template v-if="showSuccess">
      <div class="popup"></div>
      <div class="pop_suc">
        <div class="content_suc">{{ t('registerSuccess') }}</div>
      </div>
      <div class="round_suc"><img src="/static/image/home/sus.png" alt="" /></div>
    </template>
  </div>
</template>

<style scoped>
.login { width: 100%; min-height: 100vh; padding: 0 15px; background: url('/static/image/login/bg.png'); background-size: 100% auto; }
.login .backicon { display: flex; align-items: center; width: 100%; height: 49px; margin: 0 -7px; }
.login .backicon .back-arrow { font-size: 30px; color: #17273a; line-height: 1; }
.login .title { margin-top: 80px; padding: 0 10px; font-size: 24px; font-family: Roboto, Roboto-Medium; font-weight: 700; text-align: left; color: #17273a; }
.login .tips { padding: 0 10px; font-size: 18px; font-family: Roboto, Roboto-Regular; font-weight: 400; text-align: left; color: #b9b9b9; }
.login .input-title { padding: 0 10px; margin-top: 47px; margin-bottom: 8px; font-size: 16px; font-family: Roboto, Roboto-Regular; font-weight: 400; text-align: left; color: #17273a; }
.login .inputview { display: flex; flex-direction: row; align-items: center; justify-content: center; padding: 10px 0; margin: 0 10px; border-bottom: 1px solid #ececec; }
.login .inputview .inputview-flag { width: 20px; margin-right: 5px; margin-left: -2px; object-fit: contain; }
.login .inputview .inputview-num { font-size: 16px; font-family: 'PingFang SC', 'PingFang SC-Medium'; text-align: left; color: silver; }
.login .inputview .inputview-op { width: 1px; height: 13px; margin: 0 8px; background-color: #b9b9b9; }
.login .inputview .inputview-input { flex: 1; padding-left: 2px; font-size: 16px; font-family: 'PingFang SC', 'PingFang SC-Regular'; font-weight: 400; text-align: left; color: #17273a; border: none; outline: none; background: transparent; }
.login .inputview .inputview-input::placeholder { color: silver; }
.login .send { display: flex; flex-direction: row; align-items: flex-start; justify-content: center; width: 100%; padding: 0 10px; }
.login .send .send-input { flex: 1; padding: 5px 0 9px 0; font-size: 16px; border: none; border-bottom: 1px solid #ececec; font-family: 'PingFang SC', 'PingFang SC-Regular'; font-weight: 400; text-align: left; color: #17273a; outline: none; background: transparent; }
.login .send .send-input::placeholder { color: silver; }
.login .send .wrap { min-width: 70px; padding: 4px 0 10px 0; color: #ff5c5c; font-size: 18px; font-family: 'PingFang SC', 'PingFang SC-Bold'; font-weight: 700; text-align: right; }

.invitation { margin-top: 23px; padding: 0 10px; }
.invitation .code_people { font-size: 16px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #17273a; }
.code_ipu { display: flex; align-items: center; margin-top: 20px; padding-bottom: 11px; border-bottom: 1px solid #ececec; }
.code_ipu img { margin-right: 16px; width: 20px; height: 20px; object-fit: contain; }
.ipu { color: #17273a !important; font-weight: 500 !important; }

.login .nextbtn { width: 100%; height: 46px; margin-top: 67px; border-radius: 6px; background: #ee5016; color: #fff; font-size: 17px; font-weight: 700; }
.login .nextbtn:disabled { opacity: 0.6; }

.popup { position: fixed; top: 0; left: 0; z-index: 1; width: 100%; height: 100%; opacity: .6; background: #000; }
.pop_suc { position: fixed; top: 222px; left: 50%; transform: translateX(-50%); padding: 62px 24px 35px 24px; width: 276px; min-height: 163px; z-index: 2; background: #fff; border-radius: 16px; box-sizing: border-box; }
.content_suc { font-size: 16px; font-family: 'PingFang SC', 'PingFang SC-Medium'; font-weight: 500; text-align: center; color: #17273a; }
.round_suc { position: fixed; top: 160px; left: 50%; transform: translateX(-50%); display: flex; justify-content: center; align-items: center; width: 135px; height: 110px; z-index: 3; }
.round_suc img { width: 100%; object-fit: contain; }
</style>
