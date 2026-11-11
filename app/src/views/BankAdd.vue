<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useToast } from '../components/useToast';

const router = useRouter();
const { toast } = useToast();
const f = reactive({ type: 'UPI', holder: '', number: '' });
const busy = ref(false);

async function save() {
  if (!f.number) return toast('Enter account / UPI id');
  busy.value = true;
  try { await api.bankAdd({ ...f }); toast('Saved'); router.back(); }
  catch (e) { toast(e.message); } finally { busy.value = false; }
}
</script>

<template>
  <div class="form-page">
    <NavBar title="Add Payment Method" />
    <div class="form-field"><label>Type</label><input v-model="f.type" placeholder="UPI / Bank" /></div>
    <div class="form-field"><label>Account holder</label><input v-model="f.holder" placeholder="Full name" /></div>
    <div class="form-field"><label>UPI id / Account number</label><input v-model="f.number" placeholder="name@upi" /></div>
    <button class="big-btn" :disabled="busy" @click="save">Save</button>
  </div>
</template>
