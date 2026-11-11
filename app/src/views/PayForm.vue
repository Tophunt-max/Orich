<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import { useToast } from '../components/useToast';

const route = useRoute();
const router = useRouter();
const { toast } = useToast();
const amount = ref(route.query.amount || '');
function pay() { toast('Payment simulated'); router.replace('/success'); }
</script>
<template>
  <div class="form-page">
    <NavBar title="Payment" />
    <div class="amt">₹{{ amount || '0.00' }}</div>
    <div class="form-field"><label>Pay with</label><input value="Wallet balance" readonly /></div>
    <button class="big-btn" @click="pay">Confirm payment</button>
  </div>
</template>
<style scoped>.amt { text-align: center; font-size: 32px; font-weight: 800; color: #ee5016; padding: 24px 0; }</style>
