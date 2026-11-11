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
const { locale } = useI18n();

const langLabel = computed(() => (locale.value === 'hi' ? 'हिंदी' : 'English'));
function toggleLang() {
  locale.value = locale.value === 'en' ? 'hi' : 'en';
  localStorage.setItem('orich_lang', locale.value);
  toast(locale.value === 'hi' ? 'भाषा: हिंदी' : 'Language: English');
}

const arrow = '/static/image/icon_CaretRight.png';
const version = '2.1.4';
const cache = ref('2.3 MB');
const notice = ref('');

onMounted(async () => {
  await auth.refresh();
  try { notice.value = (await api.system()).notice || ''; } catch { /* ignore */ }
});

function clearCache() { cache.value = '0 B'; toast('Cache cleared'); }

async function checkUpdate() {
  try {
    const u = await api.checkUpdate();
    toast(u.hasUpdate ? ('Update available: v' + u.latest) : ('You are on the latest version (v' + u.version + ')'));
  } catch (e) { toast(e.message); }
}

async function signOut() {
  try { await api.logout(); } catch { /* ignore */ }
  auth.setToken('');
  auth.user = null;
  router.replace('/login');
}
</script>

<!-- Faithful rebuild of the real pages/account/setting layout + scoped CSS. -->
<template>
  <div class="setting">
    <NavBar title="Settings" />

    <div class="middle">
      <div class="avatar">
        <span class="avatar_title">Avatar</span>
        <span class="avatar_img"><img class="img" :src="auth.user?.avatar || '/static/image/home/icon_multiuser.png'" alt="" /></span>
        <img class="avatar_icon" :src="arrow" alt="" />
      </div>

      <div class="name" @click="router.push('/username')">
        <span class="name_title">Nickname</span>
        <span class="name_info">{{ auth.user?.nickname || 'ORich' }}</span>
        <img class="name_icon" :src="arrow" alt="" />
      </div>

      <div class="phone">
        <span class="phone_name">Phone</span>
        <span class="phone_number">{{ auth.user?.phone || '—' }}</span>
      </div>

      <div class="check">
        <span class="check_updates">Notice</span>
        <span class="name_info" style="float:right;margin-right:30px">{{ notice ? 'On' : 'Off' }}</span>
      </div>

      <div class="user" @click="clearCache">
        <span class="user_updates">Clear Cache</span>
        <span class="name_info" style="float:right;margin-right:30px">{{ cache }}</span>
      </div>

      <div class="user" @click="toggleLang">
        <span class="user_updates">Language</span>
        <span class="name_info" style="float:right;margin-right:30px">{{ langLabel }}</span>
      </div>

      <div class="check" @click="checkUpdate">
        <span class="check_updates">Version Update</span>
        <span class="name_info" style="float:right;margin-right:30px">{{ version }} ›</span>
      </div>

      <div class="about" @click="router.push('/aboutus')">
        <span class="about_updates">About Us</span>
        <img class="about_icon" :src="arrow" alt="" />
      </div>
    </div>

    <button class="logout" @click="signOut">Sign out</button>
  </div>
</template>

<style scoped>
.setting { position: relative; min-height: 100vh; background-color: #f8f8f8; padding-bottom: 80px; }
.img { width: 100%; height: 100%; }
.middle { border-top: 1px solid #f8f8f8; background-color: #fff; }
.avatar { display: flex; align-items: center; position: relative; padding: 10px 0 10px 15px; }
.avatar .avatar_title { font-size: 16px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #444; display: block; }
.avatar .avatar_img { margin-left: 226px; font-size: 16px; width: 45px; height: 45px; display: inline-block; border-radius: 50%; overflow: hidden; }
.avatar .avatar_icon { position: absolute; right: 16.5px; width: 7px; height: 12px; }
.name { position: relative; margin: 0 14px 0 15px; padding: 16.5px 0 17px 0; border-top: 1px solid #ececec; }
.name .name_title { font-size: 16px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #444; }
.name .name_info { float: right; margin-right: 30px; font-size: 16px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #b9b9b9; letter-spacing: 0px; }
.name .name_icon { position: absolute; top: 20px; right: 2.5px; width: 7px; height: 12px; }
.phone { position: relative; margin: 0 14px 0 15px; padding: 16.5px 0 17px 0; border-top: 1px solid #ececec; }
.phone .phone_name { font-size: 16px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #444; }
.phone .phone_number { position: absolute; top: 20px; right: 2.5px; font-size: 16px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #b9b9b9; letter-spacing: 0px; }
.check { position: relative; margin: 0 14px 0 15px; padding: 16.5px 0 17px 0; border-top: 1px solid #ececec; }
.check .check_updates { font-size: 16px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #444; letter-spacing: 0px; }
.user { position: relative; margin: 0 14px 0 15px; padding: 16.5px 0 17px 0; border-top: 1px solid #ececec; }
.user .user_updates { font-size: 16px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #444; letter-spacing: 0px; }
.about { position: relative; margin: 0 14px 0 15px; padding: 16.5px 0 17px 0; border-top: 1px solid #ececec; }
.about .about_updates { font-size: 16px; font-family: 'PingFang SC', 'PingFang SC-Medium'; font-weight: 700; color: #444; letter-spacing: 0px; }
.about .about_icon { position: absolute; top: 20px; right: 2.5px; width: 7px; height: 12px; }
.logout { position: fixed; bottom: 19px; left: 50%; transform: translateX(-50%); width: 300px; height: 45px; border-radius: 23px; background: #ee5016; color: #fff; font-size: 16px; font-weight: 700; border: none; }
</style>
