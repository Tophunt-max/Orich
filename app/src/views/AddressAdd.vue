<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useToast } from '../components/useToast';
const router = useRouter();
const { toast } = useToast();
const f = reactive({ name: '', phone: '', line: '' });
const busy = ref(false);
async function save() {
  if (!f.name || !f.line) return toast('Fill name and address');
  busy.value = true;
  try { await api.addressAdd({ ...f }); toast('Saved'); router.back(); }
  catch (e) { toast(e.message); } finally { busy.value = false; }
}
</script>
<template>
  <div class="form-page">
    <NavBar title="Add Address" />
    <div class="form-field"><label>Name</label><input v-model="f.name" /></div>
    <div class="form-field"><label>Phone</label><input v-model="f.phone" inputmode="numeric" /></div>
    <div class="form-field"><label>Address</label><input v-model="f.line" placeholder="House, street, city, PIN" /></div>
    <button class="big-btn" :disabled="busy" @click="save">Save address</button>
  </div>
</template>
