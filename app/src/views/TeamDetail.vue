<script setup>
import { useRoute } from 'vue-router';
import NavBar from '../components/NavBar.vue';
const route = useRoute();
</script>
<template>
  <div class="scr">
    <NavBar :title="'Level ' + route.params.level" />
    <div class="empty2"><img src="/static/image/nodata.png" alt="" /><div>No members at this level yet</div></div>
  </div>
</template>
