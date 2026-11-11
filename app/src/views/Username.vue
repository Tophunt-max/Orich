<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useAuth } from '../stores/auth';
import { useToast } from '../components/useToast';

const { t } = useI18n({
  useScope: 'local',
  messages: {
    en: {
      navTitle: 'Change Nickname',
      nickname: 'Nickname',
      placeholder: 'Enter your nickname',
      save: 'Save',
      pleaseEnter: 'Please enter a nickname',
      saved: 'Saved',
    },
    hi: {
      navTitle: 'उपनाम बदलें',
      nickname: 'उपनाम',
      placeholder: 'अपना उपनाम दर्ज करें',
      save: 'सहेजें',
      pleaseEnter: 'कृपया एक उपनाम दर्ज करें',
      saved: 'सहेजा गया',
    },
  },
});

const router = useRouter();
const auth = useAuth();
const { toast } = useToast();
const name = ref(auth.user?.nickname || '');
const busy = ref(false);

async function save() {
  const v = name.value.trim();
  if (!v) { toast(t('pleaseEnter')); return; }
  busy.value = true;
  try {
    const d = await api.accountEdit(v);
    if (d?.user) auth.user = d.user; else await auth.refresh();
    toast(t('saved'));
    router.back();
  } catch (e) { toast(e.message); }
  finally { busy.value = false; }
}
</script>

<!-- Faithful rebuild of the real pages/account/username layout + scoped CSS. -->
<template>
  <div class="username">
    <NavBar :title="t('navTitle')" />
    <div class="list">
      <div class="item">
        <div class="item-key">{{ t('nickname') }}</div>
        <input class="item-name" v-model="name" maxlength="24" :placeholder="t('placeholder')" />
      </div>
    </div>
    <button class="logout" :disabled="busy" @click="save">{{ t('save') }}</button>
  </div>
</template>

<style scoped>
.username { position: relative; min-height: 100vh; background: #f8f8f8; }
.username .list { width: 100%; padding: 7px 15px; background: #fff; }
.username .list .item { display: flex; flex-direction: row; align-items: center; justify-content: center; width: 100%; }
.username .list .item .item-key { width: 68px; text-align: left; font-size: 16px; font-family: Roboto, Roboto-Regular; font-weight: 400; color: #444; }
.username .list .item .item-name { flex: 1; height: 42px; padding: 0 10px; border: 0.5px solid #e0dfdf; border-radius: 3.5px; font-size: 16px; color: #444; }
.username .logout { position: fixed; bottom: 19px; left: 50%; transform: translateX(-50%); width: 300px; height: 45px; border-radius: 23px; background: #ee5016; color: #fff; font-size: 16px; font-weight: 700; border: none; }
.username .logout:disabled { opacity: 0.6; }
</style>
