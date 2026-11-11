<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import TabBar from './components/TabBar.vue';
import { useToast } from './components/useToast';
import { useAuth } from './stores/auth';

const route = useRoute();
const { message } = useToast();
const auth = useAuth();
const showTab = computed(() => !!route.meta.tab);

onMounted(() => auth.refresh());
</script>

<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
  <TabBar v-if="showTab" />
  <transition name="fade">
    <div v-if="message" class="toast">{{ message }}</div>
  </transition>
</template>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
