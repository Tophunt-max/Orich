<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';

const props = defineProps({
  // Accepts either `items` or `list`; each entry is a display string.
  items: { type: Array, default: null },
  list: { type: Array, default: null },
  // Milliseconds between line advances.
  interval: { type: Number, default: 2500 },
  // Visible line height in px.
  height: { type: Number, default: 20 },
});

const lines = computed(() => {
  const src = props.items || props.list || [];
  return Array.isArray(src) ? src.filter((x) => x != null && x !== '') : [];
});

const index = ref(0);
let timer = null;

function start() {
  stop();
  if (lines.value.length > 1) {
    timer = setInterval(() => {
      index.value = (index.value + 1) % lines.value.length;
    }, Math.max(600, props.interval));
  }
}
function stop() {
  if (timer) { clearInterval(timer); timer = null; }
}

onMounted(start);
onBeforeUnmount(stop);
</script>

<template>
  <div class="marquee" :style="{ height: height + 'px' }">
    <div
      v-if="lines.length"
      class="marquee_track"
      :style="{ transform: 'translateY(-' + index * height + 'px)' }"
    >
      <div v-for="(line, i) in lines" :key="i" class="marquee_line" :style="{ height: height + 'px', lineHeight: height + 'px' }">
        {{ line }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.marquee { width: 100%; overflow: hidden; position: relative; }
.marquee_track { display: flex; flex-direction: column; transition: transform 0.45s ease; }
.marquee_line { width: 100%; font-size: 13px; color: #8f5601; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
