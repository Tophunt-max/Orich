<script setup>
import { ref, computed } from 'vue';
import NavBar from '../components/NavBar.vue';
const price = ref(10), shares = ref(10);
const total = computed(() => (price.value * shares.value).toFixed(2));
</script>
<template>
  <div class="form-page">
    <NavBar title="Calculator" />
    <div class="form-field"><label>Price per share (₹)</label><input v-model.number="price" type="number" /></div>
    <div class="form-field"><label>Number of shares</label><input v-model.number="shares" type="number" /></div>
    <div class="total">Total: <b>₹{{ total }}</b></div>
  </div>
</template>
<style scoped>.total { padding: 24px 16px; font-size: 18px; } .total b { color: #ee5016; font-size: 24px; }</style>
