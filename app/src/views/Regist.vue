<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useAuth } from '../stores/auth';
import { useToast } from '../components/useToast';
const router = useRouter();
const auth = useAuth();
const { toast } = useToast();
const phone = ref(''), code = ref(''), invite = ref(''), cd = ref(0);
async function send() {
  if (!phone.value) return toast('Enter phone');
  const d = await api.sendVerify(phone.value); cd.value = 60;
  const t = setInterval(() => { if (--cd.value <= 0) clearInterval(t); }, 1000);
  if (d.demoCode) { code.value = d.demoCode; toast('Demo code: ' + d.demoCode); }
}
async function submit() {
  try { await auth.signIn(phone.value, code.value, invite.value); router.replace('/home'); }
  catch (e) { toast(e.message); }
}
</script>
<template>
  <div class="login">
    <div class="backicon" @click="router.back()"><span class="back-arrow">‹</span></div>
    <div class="title">Register</div>
    <div class="tips">Create your ORich account</div>
    <div class="input-title">Phone Number</div>
    <div class="inputview"><span class="inputview-num">+91</span><span class="inputview-op"></span><input class="inputview-input" v-model="phone" type="tel" placeholder="Enter phone number" /></div>
    <div class="input-title">Verification Code</div>
    <div class="send"><input class="send-input" v-model="code" placeholder="Enter code" /><div class="wrap" @click="cd === 0 && send()">{{ cd > 0 ? cd + 's' : 'Send OTP' }}</div></div>
    <div class="input-title">Invite Code</div>
    <div class="inputview"><input class="inputview-input" v-model="invite" placeholder="Optional" /></div>
    <button class="nextbtn" @click="submit">Register</button>
  </div>
</template>
<style scoped>
.login { width: 100%; min-height: 100vh; padding: 0 15px; background: url('/static/image/login/bg.png'); background-size: 100% auto; }
.backicon { display: flex; align-items: center; height: 49px; } .back-arrow { font-size: 30px; color: #17273a; }
.title { margin-top: 40px; padding: 0 10px; font-size: 24px; font-weight: 700; color: #17273a; }
.tips { padding: 0 10px; font-size: 18px; color: #b9b9b9; }
.input-title { padding: 0 10px; margin-top: 30px; margin-bottom: 8px; font-size: 16px; color: #17273a; }
.inputview { display: flex; align-items: center; padding: 10px 0; margin: 0 10px; border-bottom: 1px solid #ececec; }
.inputview-num { font-size: 16px; color: #17273a; } .inputview-op { width: 1px; height: 13px; margin: 0 8px; background: #b9b9b9; }
.inputview-input { flex: 1; font-size: 16px; color: #17273a; border: none; outline: none; background: transparent; }
.send { display: flex; width: 100%; padding: 0 10px; } .send-input { flex: 1; padding: 5px 0 9px; font-size: 16px; border: none; border-bottom: 1px solid #ececec; outline: none; background: transparent; }
.wrap { min-width: 70px; padding: 4px 0 10px; color: #ee5016; font-size: 18px; font-weight: 700; text-align: right; }
.nextbtn { width: 100%; height: 46px; margin-top: 40px; border-radius: 6px; background: #ee5016; color: #fff; font-size: 17px; font-weight: 700; }
</style>
