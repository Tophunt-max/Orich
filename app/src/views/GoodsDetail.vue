<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useAuth } from '../stores/auth';
import { useToast } from '../components/useToast';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const auth = useAuth();
const { toast } = useToast();

const item = ref(null);
const prices = ref([]);
const shares = ref(1);
const busy = ref(false);

const cost = computed(() => (item.value ? (shares.value * item.value.price).toFixed(2) : '0'));

onMounted(async () => {
  const data = await api.product(route.params.id);
  item.value = data.item;
  prices.value = data.joinPrices;
});

async function join() {
  if (!auth.isLoggedIn) return router.push({ path: '/login', query: { redirect: route.fullPath } });
  busy.value = true;
  try {
    const data = await api.join(item.value.id, shares.value);
    toast(t('common.join') + ' ✓ · ₹' + data.balance);
    item.value = (await api.product(route.params.id)).item;
    auth.refresh();
  } catch (e) { toast(e.message); }
  finally { busy.value = false; }
}
</script>

<template>
  <div class="page" v-if="item">
    <NavBar :title="item.title" />
    <img class="cover" :src="item.cover" :alt="item.title" />

    <div class="head card">
      <div class="ptitle">{{ item.title }}</div>
      <div class="muted">{{ item.subtitle }}</div>
      <div class="meta">
        <span class="price big">₹{{ item.price }}<small>/{{ t('product.shares') }}</small></span>
        <span class="badge">{{ t('product.' + item.status) }}</span>
      </div>
      <div class="muted mv">{{ t('product.marketValue') }}: ₹{{ item.marketValue.toLocaleString() }}</div>
    </div>

    <div class="card prog">
      <div class="prow">
        <span>{{ t('product.progress') }}</span>
        <span class="price">{{ item.percent }}%</span>
      </div>
      <div class="progress"><span :style="{ width: item.percent + '%' }"></span></div>
      <div class="prow muted">
        <span>{{ item.joined }} / {{ item.total }} {{ t('product.shares') }}</span>
        <span>{{ item.remaining }} {{ t('home.remaining') }}</span>
      </div>
    </div>

    <div class="card buy">
      <div class="label">{{ t('product.shares') }}</div>
      <div class="chips">
        <button v-for="n in prices" :key="n" class="chip" :class="{ on: shares === n }" @click="shares = n">{{ n }}</button>
      </div>
      <div class="stepper">
        <button @click="shares = Math.max(1, shares - 1)">−</button>
        <input v-model.number="shares" type="number" min="1" />
        <button @click="shares++">+</button>
      </div>
    </div>

    <div class="footer">
      <div class="total">
        <span class="muted">{{ t('product.total') }}</span>
        <span class="price big">₹{{ cost }}</span>
      </div>
      <button class="btn join" :disabled="busy || item.status !== 'ongoing'" @click="join">
        {{ item.status === 'ongoing' ? t('product.joinNow') : t('product.' + item.status) }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.cover { width: 100%; height: 240px; object-fit: cover; }
.head { margin: -24px 12px 12px; padding: 16px; position: relative; }
.ptitle { font-size: 18px; font-weight: 700; }
.meta { display: flex; align-items: center; justify-content: space-between; margin: 12px 0 6px; }
.price.big { font-size: 24px; }
.price.big small { font-size: 13px; font-weight: 400; }
.mv { font-size: 13px; }
.prog, .buy { margin: 0 12px 12px; padding: 14px 16px; }
.prow { display: flex; justify-content: space-between; align-items: center; font-size: 13px; margin: 8px 0; }
.label { font-size: 14px; font-weight: 600; margin-bottom: 10px; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { padding: 8px 16px; border-radius: 18px; background: #f2f3f5; color: var(--ink); font-weight: 600; }
.chip.on { background: var(--brand); color: #fff; }
.stepper { display: flex; align-items: center; gap: 10px; margin-top: 14px; }
.stepper button { width: 36px; height: 36px; border-radius: 8px; background: #f2f3f5; font-size: 20px; color: var(--ink); }
.stepper input { width: 64px; text-align: center; padding: 8px; border: 1px solid var(--line); border-radius: 8px; }
.footer { position: fixed; left: 50%; transform: translateX(-50%); bottom: 0; width: 100%; max-width: var(--maxw); background: #fff; border-top: 1px solid var(--line); display: flex; align-items: center; gap: 12px; padding: 10px 14px; }
.total { display: flex; flex-direction: column; }
.join { flex: 1; }
</style>
