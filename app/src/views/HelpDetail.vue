<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
const route = useRoute();
const item = ref(null);
onMounted(async () => { const l = (await api.help()).list; item.value = l.find((x) => String(x.id) === String(route.params.id)) || l[0]; });
</script>
<template>
  <div class="scr">
    <NavBar title="Help" />
    <div v-if="item" class="info-page">
      <h3>{{ item.q }}</h3>
      <p>{{ item.a }}</p>
    </div>
  </div>
</template>
