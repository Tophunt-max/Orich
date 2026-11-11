<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { api, setToken, hasToken } from './api';

const authed = ref(hasToken());
const loginForm = reactive({ username: 'admin', password: 'admin123' });
const loginErr = ref('');
const toastMsg = ref('');
let toastTimer;
function toast(m) { toastMsg.value = m; clearTimeout(toastTimer); toastTimer = setTimeout(() => (toastMsg.value = ''), 2000); }

async function doLogin() {
  loginErr.value = '';
  try {
    const d = await api.login(loginForm.username, loginForm.password);
    setToken(d.token); authed.value = true; loadSection();
  } catch (e) { loginErr.value = e.message; }
}
async function logout() { try { await api.logout(); } catch {} setToken(''); authed.value = false; }

// Collections managed by the generic editor. `fields` drives the form + table columns.
const COLLECTIONS = {
  products: { label: 'Products', fields: [
    { k: 'title', t: 'text' }, { k: 'subtitle', t: 'text' }, { k: 'cover', t: 'text' },
    { k: 'price', t: 'number' }, { k: 'marketValue', t: 'number' }, { k: 'total', t: 'number' },
    { k: 'joined', t: 'number' }, { k: 'status', t: 'select', opts: ['ongoing', 'drawing', 'done'] }, { k: 'hot', t: 'bool' },
  ] },
  winners: { label: 'Winners', fields: [
    { k: 'name', t: 'text' }, { k: 'product', t: 'text' }, { k: 'avatar', t: 'text' },
    { k: 'code', t: 'text' }, { k: 'shares', t: 'number' }, { k: 'date', t: 'text' },
  ] },
  finances: { label: 'Finance', fields: [
    { k: 'name', t: 'text' }, { k: 'rate', t: 'number' }, { k: 'days', t: 'number' },
    { k: 'min', t: 'number' }, { k: 'max', t: 'number' }, { k: 'desc', t: 'text' },
  ] },
  tasks: { label: 'Tasks', fields: [
    { k: 'title', t: 'text' }, { k: 'reward', t: 'number' }, { k: 'type', t: 'text' }, { k: 'icon', t: 'text' },
  ] },
  vipTiers: { label: 'VIP Tiers', fields: [
    { k: 'name', t: 'text' }, { k: 'price', t: 'number' }, { k: 'days', t: 'number' },
    { k: 'dailyBonus', t: 'number' }, { k: 'rebate', t: 'number' }, { k: 'color', t: 'text' },
  ] },
  luckyDraws: { label: 'Lucky Draws', fields: [
    { k: 'title', t: 'text' }, { k: 'ticket', t: 'number' }, { k: 'pool', t: 'number' },
    { k: 'sold', t: 'number' }, { k: 'prize', t: 'text' }, { k: 'cover', t: 'text' },
  ] },
};

const nav = [
  { id: 'dashboard', label: 'Dashboard' },
  ...Object.entries(COLLECTIONS).map(([id, c]) => ({ id, label: c.label })),
  { id: 'users', label: 'Users' },
  { id: 'orders', label: 'Orders' },
  { id: 'settings', label: 'Settings' },
];

const section = ref('dashboard');
const stats = ref(null);
const rows = ref([]);
const users = ref([]);
const orders = ref([]);
const settings = reactive({ name: '', notice: '', service: '', tabBarColor: '', tabBarActive: '' });
const orderType = ref('');

const colDef = computed(() => COLLECTIONS[section.value]);

async function loadSection() {
  const s = section.value;
  if (s === 'dashboard') { stats.value = await api.stats(); Object.assign(settings, stats.value.settings); }
  else if (s === 'users') users.value = (await api.users()).list;
  else if (s === 'orders') orders.value = (await api.orders(orderType.value)).list;
  else if (s === 'settings') { if (!stats.value) stats.value = await api.stats(); Object.assign(settings, stats.value.settings); }
  else if (COLLECTIONS[s]) rows.value = (await api.collection(s)).list;
}
function goto(id) { section.value = id; loadSection(); }

// Editor modal
const editing = ref(null);
function newItem() { const o = {}; colDef.value.fields.forEach((f) => (o[f.k] = f.t === 'bool' ? false : f.t === 'number' ? 0 : '')); editing.value = o; }
function editItem(row) { editing.value = { ...row }; }
async function saveItem() {
  const item = { ...editing.value };
  colDef.value.fields.forEach((f) => { if (f.t === 'number') item[f.k] = Number(item[f.k]) || 0; });
  try { await api.save(section.value, item); editing.value = null; toast('Saved'); loadSection(); }
  catch (e) { toast(e.message); }
}
async function delItem(row) {
  if (!confirm('Delete this item?')) return;
  try { await api.remove(section.value, row.id); toast('Deleted'); loadSection(); }
  catch (e) { toast(e.message); }
}
async function adjust(u) {
  const delta = Number(prompt('Adjust balance by (₹, negative to deduct):', '0'));
  if (!delta) return;
  try { await api.adjust(u.id, delta); toast('Balance updated'); loadSection(); }
  catch (e) { toast(e.message); }
}
async function draw(row) {
  const name = prompt('Winner name prefix:', 'lucky');
  if (name === null) return;
  try { await api.drawWinner(row.id, name, 1); toast('Winner drawn'); loadSection(); }
  catch (e) { toast(e.message); }
}
async function saveSettings() {
  try { await api.settings({ ...settings }); toast('Settings saved'); stats.value = null; }
  catch (e) { toast(e.message); }
}

onMounted(() => { if (authed.value) loadSection(); });
</script>

<template>
  <div v-if="!authed" class="login-wrap">
    <div class="login-card">
      <h1>ORich Admin</h1>
      <p>Sign in to manage the app</p>
      <label>Username</label>
      <input v-model="loginForm.username" @keyup.enter="doLogin" />
      <label>Password</label>
      <input v-model="loginForm.password" type="password" @keyup.enter="doLogin" />
      <p v-if="loginErr" class="err">{{ loginErr }}</p>
      <button class="btn" style="width:100%;margin-top:16px" @click="doLogin">Sign in</button>
      <p class="muted" style="margin-top:12px;font-size:12px">Default: admin / admin123</p>
    </div>
  </div>

  <div v-else class="shell">
    <aside class="side">
      <div class="logo"><b>O</b> ORich</div>
      <nav>
        <a v-for="n in nav" :key="n.id" :class="{ on: section === n.id }" @click="goto(n.id)">{{ n.label }}</a>
      </nav>
    </aside>

    <main class="main">
      <div class="topbar">
        <h2>{{ nav.find((n) => n.id === section).label }}</h2>
        <button class="btn ghost sm" @click="logout">Sign out</button>
      </div>

      <!-- Dashboard -->
      <div v-if="section === 'dashboard' && stats" class="cards">
        <div class="stat"><div class="n">{{ stats.users }}</div><div class="l">Users</div></div>
        <div class="stat"><div class="n">{{ stats.products }}</div><div class="l">Products</div></div>
        <div class="stat"><div class="n">{{ stats.winners }}</div><div class="l">Winners</div></div>
        <div class="stat"><div class="n">{{ stats.orders }}</div><div class="l">Orders</div></div>
        <div class="stat"><div class="n">₹{{ stats.recharge }}</div><div class="l">Recharged</div></div>
        <div class="stat"><div class="n">₹{{ stats.joins }}</div><div class="l">Group-buy spend</div></div>
        <div class="stat"><div class="n">₹{{ stats.finance }}</div><div class="l">Finance</div></div>
        <div class="stat"><div class="n">₹{{ stats.vip }}</div><div class="l">VIP</div></div>
      </div>

      <!-- Collections -->
      <template v-else-if="colDef">
        <div style="margin-bottom:12px"><button class="btn" @click="newItem">+ New {{ colDef.label }}</button></div>
        <table>
          <thead><tr><th>ID</th><th v-for="f in colDef.fields.slice(0,4)" :key="f.k">{{ f.k }}</th><th>Actions</th></tr></thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td>{{ row.id }}</td>
              <td v-for="f in colDef.fields.slice(0,4)" :key="f.k">
                <img v-if="f.k === 'cover' || f.k === 'avatar' || f.k === 'icon'" :src="row[f.k]" alt="" />
                <span v-else>{{ row[f.k] }}</span>
              </td>
              <td class="row-actions">
                <button class="btn ghost sm" @click="editItem(row)">Edit</button>
                <button v-if="section === 'products'" class="btn sm" @click="draw(row)">Draw</button>
                <button class="btn danger sm" @click="delItem(row)">Del</button>
              </td>
            </tr>
          </tbody>
        </table>
      </template>

      <!-- Users -->
      <table v-else-if="section === 'users'">
        <thead><tr><th>ID</th><th>Phone</th><th>Nickname</th><th>Balance</th><th>VIP</th><th>Actions</th></tr></thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.id }}</td><td>{{ u.phone }}</td><td>{{ u.nickname }}</td>
            <td>₹{{ u.balance }}</td><td>{{ u.vip ? u.vip.name : '—' }}</td>
            <td><button class="btn ghost sm" @click="adjust(u)">Adjust ₹</button></td>
          </tr>
          <tr v-if="!users.length"><td colspan="6" class="muted">No users yet — sign in on the app first.</td></tr>
        </tbody>
      </table>

      <!-- Orders -->
      <template v-else-if="section === 'orders'">
        <div style="margin-bottom:12px">
          <select v-model="orderType" style="width:200px" @change="loadSection">
            <option value="">All types</option>
            <option v-for="t in ['recharge','join','finance','vip','lucky','task']" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <table>
          <thead><tr><th>ID</th><th>User</th><th>Type</th><th>Item</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            <tr v-for="o in orders" :key="o.id">
              <td>{{ o.id }}</td><td>{{ o.userId }}</td><td>{{ o.type }}</td>
              <td>{{ o.product || '—' }}</td><td>₹{{ o.amount }}</td><td>{{ o.status }}</td><td>{{ o.date }}</td>
            </tr>
            <tr v-if="!orders.length"><td colspan="7" class="muted">No orders yet.</td></tr>
          </tbody>
        </table>
      </template>

      <!-- Settings -->
      <div v-else-if="section === 'settings'" style="max-width:520px">
        <div class="field"><label>App name</label><input v-model="settings.name" /></div>
        <div class="field"><label>Home notice</label><input v-model="settings.notice" /></div>
        <div class="field"><label>Support URL</label><input v-model="settings.service" /></div>
        <div class="field"><label>Tab bar colour</label><input v-model="settings.tabBarColor" /></div>
        <div class="field"><label>Tab bar active colour</label><input v-model="settings.tabBarActive" /></div>
        <button class="btn" @click="saveSettings">Save settings</button>
      </div>
    </main>
  </div>

  <!-- Editor modal -->
  <div v-if="editing" class="modal" @click.self="editing = null">
    <div class="box">
      <h3>{{ editing.id ? 'Edit' : 'New' }} {{ colDef.label }}</h3>
      <div v-for="f in colDef.fields" :key="f.k" class="field">
        <label>{{ f.k }}</label>
        <select v-if="f.t === 'select'" v-model="editing[f.k]">
          <option v-for="o in f.opts" :key="o" :value="o">{{ o }}</option>
        </select>
        <label v-else-if="f.t === 'bool'" style="display:flex;gap:8px;align-items:center;color:var(--ink)">
          <input type="checkbox" v-model="editing[f.k]" style="width:auto" /> {{ f.k }}
        </label>
        <input v-else :type="f.t === 'number' ? 'number' : 'text'" v-model="editing[f.k]" />
      </div>
      <div class="modal-foot">
        <button class="btn ghost" @click="editing = null">Cancel</button>
        <button class="btn" @click="saveItem">Save</button>
      </div>
    </div>
  </div>

  <div v-if="toastMsg" class="toast">{{ toastMsg }}</div>
</template>
