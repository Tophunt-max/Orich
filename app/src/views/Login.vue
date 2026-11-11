<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { api } from '../api/client';
import { useAuth } from '../stores/auth';
import { useToast } from '../components/useToast';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const auth = useAuth();
const { toast } = useToast();

const phone = ref('');
const code = ref('');
const countdown = ref(0);
const busy = ref(false);

async function sendCode() {
  if (!phone.value) return toast(t('login.phone'));
  try {
    const data = await api.sendVerify(phone.value);
    countdown.value = 60;
    const timer = setInterval(() => { if (--countdown.value <= 0) clearInterval(timer); }, 1000);
    if (data.demoCode) { code.value = data.demoCode; toast('Demo code: ' + data.demoCode); }
  } catch (e) { toast(e.message); }
}

async function submit() {
  if (!phone.value || !code.value) return toast(t('login.code'));
  busy.value = true;
  try {
    await auth.signIn(phone.value, code.value);
    router.replace(route.query.redirect || '/account');
  } catch (e) { toast(e.message); }
  finally { busy.value = false; }
}
</script>

<!-- Faithful rebuild of the real ORich 2.1.4 pages/login/login (real classes + scoped CSS). -->
<template>
  <div class="login">
    <div class="backicon" @click="router.back()">
      <span class="back-arrow">‹</span>
    </div>

    <div class="title">{{ t('login.title') }}</div>
    <div class="tips">{{ t('login.tips') }}</div>

    <div class="input-title">{{ t('login.phone') }}</div>
    <div class="inputview">
      <img class="inputview-flag" src="/static/image/login/icon_iphone.png" alt="" />
      <span class="inputview-num">+91</span>
      <span class="inputview-op"></span>
      <input class="inputview-input" v-model="phone" type="tel" inputmode="numeric" :placeholder="t('login.phonePh')" />
    </div>

    <div class="input-title">{{ t('login.code') }}</div>
    <div class="send">
      <input class="send-input" v-model="code" inputmode="numeric" :placeholder="t('login.codePh')" />
      <div class="wrap" @click="countdown === 0 && sendCode()">
        {{ countdown > 0 ? countdown + 's' : t('login.send') }}
      </div>
    </div>

    <button class="nextbtn" :disabled="busy" @click="submit">{{ t('login.action') }}</button>

    <div class="user-rule">
      <span class="user-rule-item">{{ t('login.terms') }} </span>
      <span class="user-rule-item link">{{ t('login.rules') }}</span>
    </div>
  </div>
</template>

<style scoped>
/* Verbatim from the app's compiled stylesheet (rpx→px at 0.5); uni-* tags mapped to html. */
.login { width: 100%; min-height: 100vh; padding: 0 15px; background: url('/static/image/login/bg.png'); background-size: 100% auto; }
.login .backicon { display: flex; align-items: center; width: 100%; height: 49px; margin: 0 -7px; }
.login .backicon .back-arrow { font-size: 30px; color: #17273a; line-height: 1; }
.login .title { margin-top: 60px; padding: 0 10px; font-size: 24px; font-family: Roboto, Roboto-Medium; font-weight: 700; text-align: left; color: #17273a; }
.login .tips { padding: 0 10px; font-size: 18px; font-family: Roboto, Roboto-Regular; font-weight: 400; text-align: left; color: #b9b9b9; }
.login .input-title { padding: 0 10px; margin-top: 52px; margin-bottom: 8px; font-size: 16px; font-family: Roboto, Roboto-Regular; font-weight: 400; text-align: left; color: #17273a; }
.login .inputview { display: flex; flex-direction: row; align-items: center; justify-content: center; padding: 10px 0; margin: 0 10px; border-bottom: 1px solid #ececec; }
.login .inputview .inputview-flag { width: 20px; margin-right: 5px; margin-left: -2px; object-fit: contain; }
.login .inputview .inputview-num { font-size: 16px; font-family: 'PingFang SC', 'PingFang SC-Medium'; text-align: left; color: #17273a; }
.login .inputview .inputview-op { width: 1px; height: 13px; margin: 0 8px; background-color: #b9b9b9; }
.login .inputview .inputview-input { flex: 1; padding-left: 2px; font-size: 16px; font-family: 'PingFang SC', 'PingFang SC-Regular'; font-weight: 400; text-align: left; color: #17273a; border: none; outline: none; background: transparent; }
.login .inputview .inputview-input::placeholder { color: silver; }
.login .send { display: flex; flex-direction: row; align-items: flex-start; justify-content: center; width: 100%; padding: 0 10px; }
.login .send .send-input { flex: 1; padding: 5px 0 9px 0; font-size: 16px; border: none; border-bottom: 1px solid #ececec; font-family: 'PingFang SC', 'PingFang SC-Regular'; font-weight: 400; text-align: left; color: #17273a; outline: none; background: transparent; }
.login .send .send-input::placeholder { color: silver; }
.login .send .wrap { min-width: 70px; padding: 4px 0 10px 0; color: #ee5016; font-size: 18px; font-family: 'PingFang SC', 'PingFang SC-Bold'; font-weight: 700; text-align: right; }
.login .nextbtn { width: 100%; height: 46px; margin-top: 67px; border-radius: 6px; background: #ee5016; color: #fff; font-size: 17px; font-weight: 700; }
.login .nextbtn:disabled { opacity: 0.6; }
.login .user-rule { font-size: 13px; margin-top: 130px; padding: 0 10px; }
.login .user-rule .user-rule-item { font-family: Roboto, Roboto-Regular; font-weight: 400; color: #b9b9b9; }
.login .user-rule .user-rule-item.link { color: #ee5016; }
</style>
