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
  <div class="app-body" :class="{ 'has-tab': showTab }">
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </div>
  <TabBar v-if="showTab" />
  <transition name="fade">
    <div v-if="message" class="toast">{{ message }}</div>
  </transition>
</template>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
/* Reserve space for the fixed 56px bottom tab bar on tab pages so content is never hidden. */
.app-body.has-tab { padding-bottom: 56px; }
</style>
