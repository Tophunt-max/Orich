<script setup>
import { useRouter } from 'vue-router';
defineProps({ title: String, back: { type: Boolean, default: true }, right: String });
const emit = defineEmits(['right']);
const router = useRouter();
</script>

<template>
  <header class="navbar">
    <span v-if="back" class="back" @click="router.back()">‹</span>
    <span>{{ title }}</span>
    <span v-if="right" class="right" @click="emit('right')">{{ right }}</span>
  </header>
</template>
