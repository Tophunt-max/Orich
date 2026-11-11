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
const invite = ref('');
const countdown = ref(0);
const busy = ref(false);

async function sendCode() {
  if (!phone.value) return toast(t('login.phone'));
  try {
    const data = await api.sendVerify(phone.value);
    countdown.value = 60;
    const timer = setInterval(() => { if (--countdown.value <= 0) clearInterval(timer); }, 1000);
    // Demo backend returns the code so testers can proceed without SMS.
    if (data.demoCode) { code.value = data.demoCode; toast('Demo code: ' + data.demoCode); }
  } catch (e) { toast(e.message); }
}

async function submit() {
  if (!phone.value || !code.value) return toast(t('login.code'));
  busy.value = true;
  try {
    await auth.signIn(phone.value, code.value, invite.value);
    toast(t('login.title') + ' ✓');
    router.replace(route.query.redirect || '/account');
  } catch (e) { toast(e.message); }
  finally { busy.value = false; }
}
</script>

<template>
  <div class="login">
    <div class="top">
      <div class="logo">O</div>
      <h1>{{ t('app.name') }}</h1>
      <p>{{ t('login.title') }}</p>
    </div>

    <div class="form card">
      <label>{{ t('login.phone') }}</label>
      <input class="field" v-model="phone" type="tel" inputmode="numeric" placeholder="98765 43210" />

      <label>{{ t('login.code') }}</label>
      <div class="code-row">
        <input class="field" v-model="code" inputmode="numeric" placeholder="----" />
        <button class="send" :disabled="countdown > 0" @click="sendCode">
          {{ countdown > 0 ? countdown + 's' : t('login.send') }}
        </button>
      </div>

      <label>{{ t('login.invite') }}</label>
      <input class="field" v-model="invite" placeholder="ORICH1234" />

      <button class="btn" style="margin-top:18px" :disabled="busy" @click="submit">{{ t('login.action') }}</button>
      <p class="terms muted">{{ t('login.terms') }}</p>
    </div>
  </div>
</template>

<style scoped>
.login { min-height: 100vh; background: linear-gradient(160deg, var(--brand), #b84a26); padding: 48px 20px 20px; }
.top { text-align: center; color: #fff; margin-bottom: 24px; }
.top .logo { width: 64px; height: 64px; border-radius: 16px; margin: 0 auto 10px; background: #fff; color: var(--brand); font-weight: 800; font-size: 40px; display: flex; align-items: center; justify-content: center; }
.top h1 { margin: 0; font-size: 26px; letter-spacing: 1px; }
.top p { margin: 4px 0 0; opacity: 0.85; }
.form { padding: 18px; }
.form label { display: block; font-size: 13px; color: var(--muted); margin: 12px 0 6px; }
.code-row { display: flex; gap: 8px; }
.send { white-space: nowrap; padding: 0 14px; border-radius: 10px; background: #fdeee6; color: var(--brand); font-weight: 600; }
.send:disabled { opacity: 0.6; }
.terms { font-size: 11px; text-align: center; margin-top: 14px; line-height: 1.5; }
</style>
