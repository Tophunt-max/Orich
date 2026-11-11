<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useAuth } from '../stores/auth';
import { useToast } from '../components/useToast';

const { t } = useI18n();
const auth = useAuth();
const { toast } = useToast();
const list = ref([]);
const done = ref({});

onMounted(async () => { list.value = (await api.tasks()).list; });

async function receive(task) {
  try {
    const data = await api.taskReceive(task.id);
    done.value[task.id] = true;
    auth.user = { ...auth.user, balance: data.balance };
    toast('+₹' + task.reward);
  } catch (e) { toast(e.message); }
}
</script>

<template>
  <div class="page">
    <NavBar :title="t('task.title')" />
    <div class="banner card">
      <div class="muted">{{ t('common.balance') }}</div>
      <div class="price big">₹{{ auth.user?.balance ?? '0.00' }}</div>
    </div>
    <div class="list">
      <div v-for="task in list" :key="task.id" class="trow card">
        <img :src="task.icon" alt="" />
        <div class="tbody">
          <div class="ttitle">{{ task.title }}</div>
          <div class="price">+₹{{ task.reward }}</div>
        </div>
        <button class="claim" :disabled="done[task.id]" @click="receive(task)">
          {{ done[task.id] ? t('task.claimed') : t('task.claim') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.banner { margin: 12px; padding: 16px; display: flex; flex-direction: column; gap: 4px; align-items: center; }
.price.big { font-size: 26px; }
.list { padding: 0 12px; display: flex; flex-direction: column; gap: 10px; }
.trow { display: flex; align-items: center; gap: 12px; padding: 14px; }
.trow img { width: 38px; height: 38px; object-fit: contain; }
.tbody { flex: 1; }
.ttitle { font-weight: 600; font-size: 15px; }
.claim { background: var(--brand); color: #fff; padding: 8px 18px; border-radius: 18px; font-weight: 600; }
.claim:disabled { background: #d6dae0; }
</style>
