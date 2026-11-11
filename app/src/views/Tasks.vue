<script setup>
import { onMounted, ref, computed } from 'vue';
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

// Split the backend task list into the simple daily-welfare list (check-in style) and
// the richer "missions" group that the real page renders with progress + an image card.
const welfare = computed(() => list.value.filter((x) => x.type === 'checkin'));
const missions = computed(() => list.value.filter((x) => x.type !== 'checkin'));

// Progress is not returned by the backend, so derive a simple target per mission type.
const PROGRESS = { join: { cur: 0, total: 1 }, invite: { cur: 0, total: 3 }, recharge: { cur: 0, total: 1 } };
function prog(task) {
  const p = PROGRESS[task.type] || { cur: 0, total: 1 };
  return done.value[task.id] ? { cur: p.total, total: p.total } : p;
}

async function receive(task) {
  try {
    const data = await api.taskReceive(task.id);
    done.value[task.id] = true;
    auth.user = { ...auth.user, balance: data.balance };
    toast('+₹' + task.reward);
  } catch (e) { toast(e.message); }
}
</script>

<!-- Faithful rebuild of the real pages/task/task: header notice, daily welfare list and the
     mission group (task_main_order) with image cards, progress and claim buttons. -->
<template>
  <div class="task">
    <div class="task_bj">
      <header class="tnav">{{ t('task.title') }}</header>
      <div class="task_bj_toast">
        <div class="task_bj_toast_notice">Complete tasks every day to earn free balance</div>
      </div>
      <div class="task_bj_bal">{{ t('common.balance') }} ₹{{ auth.user?.balance ?? '0.00' }}</div>
    </div>

    <div class="task_main">
      <!-- daily welfare -->
      <div class="task_main_welfare">
        <div class="task_main_welfare_item title">{{ t('task.daily') }}</div>
        <div class="title_stp"></div>
        <div class="task_border"></div>
        <div v-for="task in welfare" :key="task.id" class="task_main_welfare_item">
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
        <div v-if="!welfare.length" class="empty">No welfare tasks today</div>
      </div>

      <!-- mission group -->
      <div class="task_main_order">
        <div class="task_main_order_item title">Welfare missions</div>
        <div class="title_stp"></div>
        <div class="task_border"></div>
        <div v-for="task in missions" :key="task.id" class="task_main_order_item">
          <div class="task_main_order_strip">
            <div class="timg">
              <img :src="task.icon" alt="" />
              <img class="timg_icon" src="/static/image/task/icon_thisday.png" alt="" />
            </div>
            <div class="content">
              <div class="content_title">
                <div class="name">{{ task.title }}</div>
              </div>
              <div class="content_title_bal">
                <div class="content_img"><img src="/static/image/task/icon_Goldcoins.png" alt="" /></div>
                <div class="content_balances">+₹{{ task.reward }}</div>
              </div>
              <div class="content_detail colorpro">
                <span v-for="n in prog(task).total" :key="n" class="iconpro" :class="{ finish: n <= prog(task).cur }"></span>
                <span>{{ prog(task).cur }}/{{ prog(task).total }} completed</span>
              </div>
            </div>
            <button
              class="taskbtn"
              :class="done[task.id] ? 'btn_gray' : 'btnbj_receive'"
              :disabled="done[task.id]"
              @click="receive(task)"
            >{{ done[task.id] ? t('task.claimed') : t('task.claim') }}</button>
          </div>
        </div>
        <div v-if="!missions.length" class="empty">No missions available</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.task { min-height: 100vh; background: #f9f9f9; padding-bottom: 60px; }
.task_bj { height: 240px; background-image: url('/static/image/task/task_bj.png'); background-size: 100% 100%; background-repeat: no-repeat; background-color: #ee5016; padding-top: 0; }
.tnav { height: 44px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; font-weight: 700; }
.task_bj_toast { display: flex; align-items: center; justify-content: center; padding-top: 6px; }
.task_bj_toast_notice { max-width: 284px; font-size: 13px; color: #ffe3d8; text-align: center; }
.task_bj_bal { text-align: center; color: #fff; font-size: 24px; font-weight: 700; margin-top: 10px; }
.task_main { padding: 0 8px 0 7px; margin-top: -100px; }
.task_main_welfare { background: #fff; border-radius: 5px; padding-bottom: 6px; }
.task_main_welfare_item { padding: 13px 7px 13px 13px; }
.task_main_welfare_item.title { height: 25px; line-height: 25px; text-align: center; font-size: 16.5px; font-weight: 500; color: #17273a; padding: 0; }
.title_stp { width: 78px; height: 11.5px; background: #ffcb00; margin: -13px auto 0; }
.task_border { border-bottom: 1px solid #f9f9f9; margin-top: 10px; }
.task_main_welfare_strip { display: flex; align-items: center; justify-content: space-between; margin: 0 3px; }
.tw-icon { width: 38px; height: 38px; object-fit: contain; margin-right: 10px; }
.task_main_welfare_strip_content { flex: 1; max-width: 250px; }
.task_main_welfare_strip_content .name { font-size: 16.5px; font-weight: 500; color: #17273a; }
.task_main_welfare_strip_content .tip { margin-top: 7px; font-size: 14.5px; color: #ee5016; }
.task_main_welfare_strip_btn { width: 82px; height: 31px; line-height: 31px; text-align: center; background: #fff; color: #ee5016; border-radius: 102px; border: 1px solid #ee5016; font-size: 14px; flex-shrink: 0; }
.task_main_welfare_strip_btn.done { color: #b9b9b9; border-color: #b9b9b9; }

/* mission group */
.task_main_order { margin-top: 8px; background: #fff; border-radius: 5px; padding-bottom: 6px; }
.task_main_order_item { padding: 15px 7px 15px 13px; }
.task_main_order_item.title { height: 25px; line-height: 25px; text-align: center; font-size: 16.5px; font-weight: 500; color: #17273a; padding: 0; }
.task_main_order_strip { display: flex; justify-content: flex-start; position: relative; margin: 0 3px; }
.task_main_order_strip .timg { flex-shrink: 0; width: 74px; height: 74px; position: relative; }
.task_main_order_strip .timg img { width: 100%; height: 100%; border-radius: 5px; object-fit: contain; background: #f7f8f9; }
.task_main_order_strip .timg .timg_icon { width: 48.5px; height: 20.5px; position: absolute; top: -5px; left: -4px; background: none; }
.task_main_order_strip .content { margin-left: 12px; flex: 1; }
.task_main_order_strip .content .content_title { display: flex; align-items: center; flex-wrap: wrap; }
.task_main_order_strip .content .content_title .name { font-size: 16.5px; font-weight: 500; color: #17273a; }
.task_main_order_strip .content .content_title_bal { display: flex; align-items: center; margin-top: 6px; }
.task_main_order_strip .content .content_img { flex-shrink: 0; width: 17px; height: 17px; margin-right: 3px; }
.task_main_order_strip .content .content_img img { width: 100%; height: 100%; object-fit: contain; }
.task_main_order_strip .content .content_balances { font-size: 16.5px; font-weight: 500; color: #ff5c5c; }
.task_main_order_strip .content .content_detail { margin-top: 9px; max-width: 200px; font-size: 13.5px; color: #b9b9b9; }
.task_main_order_strip .content .colorpro { color: #ee5016; display: flex; align-items: center; flex-wrap: wrap; }
.task_main_order_strip .content .iconpro { width: 14.5px; height: 14.5px; border: 1px solid #b9b9b9; border-radius: 50%; margin-right: 4px; display: inline-block; }
.task_main_order_strip .content .iconpro.finish { border: none; background: #ee5016; }
.task_main_order_strip .taskbtn { width: 82px; height: 31px; line-height: 31px; border-radius: 102px; text-align: center; position: absolute; bottom: 10px; right: 10px; font-size: 14px; }
.task_main_order_strip .btnbj_receive { background: linear-gradient(290deg, #ee5016, #ffd71d); color: #fff; }
.task_main_order_strip .btn_gray { background: #fff; color: #b9b9b9; border: 1px solid #b9b9b9; }
.empty { text-align: center; color: #b9b9b9; font-size: 13px; padding: 16px 0; }
</style>
