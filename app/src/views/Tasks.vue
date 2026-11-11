<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from '../api/client';
import { useAuth } from '../stores/auth';
import { useToast } from '../components/useToast';

const { t } = useI18n();
const auth = useAuth();
const { toast } = useToast();
const list = ref([]);
const done = ref({});

onMounted(async () => { list.value = (await api.tasks()).list; await auth.refresh(); });

async function receive(task) {
  try {
    const data = await api.taskReceive(task.id);
    done.value[task.id] = true;
    auth.user = { ...auth.user, balance: data.balance };
    toast('+₹' + task.reward);
  } catch (e) { toast(e.message); }
}
</script>

<!-- Faithful rebuild of the real pages/task/task (.task / task_main_welfare) + scoped CSS. -->
<template>
  <div class="task">
    <div class="task_bj">
      <header class="tnav">{{ t('task.title') }}</header>
      <div class="task_bj_bal">{{ t('common.balance') }} ₹{{ auth.user?.balance ?? '0.00' }}</div>
    </div>

    <div class="task_main">
      <div class="task_main_welfare">
        <div class="task_main_welfare_item title">{{ t('task.daily') }}</div>
        <div class="task_border"></div>
        <div v-for="task in list" :key="task.id" class="task_main_welfare_item">
          <div class="task_main_welfare_strip">
            <img class="tw-icon" :src="task.icon" alt="" />
            <div class="task_main_welfare_strip_content">
              <div class="name">{{ task.title }}</div>
              <div class="tip">+₹{{ task.reward }}</div>
            </div>
            <button class="task_main_welfare_strip_btn" :class="{ done: done[task.id] }" :disabled="done[task.id]" @click="receive(task)">
              {{ done[task.id] ? t('task.claimed') : t('task.claim') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.task { min-height: 100vh; background: #f9f9f9; padding-bottom: 60px; }
.task_bj { height: 150px; background: linear-gradient(160deg, #ee5016, #ff8a3d); padding-top: 0; }
.tnav { height: 44px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; font-weight: 700; }
.task_bj_bal { text-align: center; color: #fff; font-size: 24px; font-weight: 700; margin-top: 10px; }
.task_main { padding: 0 8px; margin-top: -40px; }
.task_main_welfare { background: #fff; border-radius: 5px; padding-bottom: 6px; }
.task_main_welfare_item { padding: 13px 7px 13px 13px; }
.task_main_welfare_item.title { text-align: center; font-size: 16.5px; font-weight: 500; color: #17273a; }
.task_border { border-bottom: 1px solid #f3f3f3; }
.task_main_welfare_strip { display: flex; align-items: center; justify-content: space-between; margin: 0 3px; }
.tw-icon { width: 38px; height: 38px; object-fit: contain; margin-right: 10px; }
.task_main_welfare_strip_content { flex: 1; }
.task_main_welfare_strip_content .name { font-size: 16.5px; font-weight: 500; color: #17273a; }
.task_main_welfare_strip_content .tip { margin-top: 6px; font-size: 14.5px; color: #ee5016; }
.task_main_welfare_strip_btn { width: 82px; height: 31px; line-height: 31px; text-align: center; background: #fff; color: #ee5016; border-radius: 102px; border: 1px solid #ee5016; font-size: 14px; }
.task_main_welfare_strip_btn.done { color: #b9b9b9; border-color: #e0e0e0; }
</style>
