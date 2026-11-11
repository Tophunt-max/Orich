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
const name = ref(auth.user?.nickname || '');
const busy = ref(false);
async function save() {
  busy.value = true;
  try { const d = await api.accountEdit(name.value); auth.user = d.user; toast('Saved'); router.back(); }
  catch (e) { toast(e.message); } finally { busy.value = false; }
}
</script>
<template>
  <div class="form-page">
    <NavBar title="Edit Name" />
    <div class="form-field"><label>Nickname</label><input v-model="name" maxlength="24" /></div>
    <button class="big-btn" :disabled="busy" @click="save">Save</button>
  </div>
</template>
