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
    { k: 'joined', t: 'number' }, { k: 'status', t: 'select', opts: ['ongoing', 'drawing', 'done'] },
    { k: 'category', t: 'select', opts: ['Electronics', 'Vehicle', 'Gold', 'Home'] }, { k: 'endAt', t: 'number' }, { k: 'hot', t: 'bool' },
  ] },
  winners: { label: 'Winners', fields: [
    { k: 'name', t: 'text' }, { k: 'product', t: 'text' }, { k: 'avatar', t: 'text' },
    { k: 'code', t: 'text' }, { k: 'shares', t: 'number' }, { k: 'date', t: 'text' }, { k: 'images', t: 'list' },
  ] },
  finances: { label: 'Finance', fields: [
    { k: 'name', t: 'text' }, { k: 'rate', t: 'number' }, { k: 'days', t: 'number' },
    { k: 'min', t: 'number' }, { k: 'max', t: 'number' }, { k: 'desc', t: 'text' },
  ] },
  tasks: { label: 'Tasks', fields: [
    { k: 'title', t: 'text' }, { k: 'reward', t: 'number' }, { k: 'type', t: 'text' },
    { k: 'target', t: 'number' }, { k: 'group', t: 'select', opts: ['daily', 'mission'] }, { k: 'icon', t: 'text' },
  ] },
  vipTiers: { label: 'VIP Tiers', fields: [
    { k: 'name', t: 'text' }, { k: 'price', t: 'number' }, { k: 'days', t: 'number' },
    { k: 'dailyBonus', t: 'number' }, { k: 'rebate', t: 'number' }, { k: 'color', t: 'text' },
  ] },
  luckyDraws: { label: 'Lucky Draws', fields: [
    { k: 'title', t: 'text' }, { k: 'ticket', t: 'number' }, { k: 'pool', t: 'number' },
    { k: 'sold', t: 'number' }, { k: 'prize', t: 'text' }, { k: 'cover', t: 'text' },
  ] },
  prizes: { label: 'Prize Pool', fields: [
    { k: 'name', t: 'text' }, { k: 'cost', t: 'number' }, { k: 'cover', t: 'text' },
  ] },
  games: { label: 'Games', fields: [
    { k: 'name', t: 'text' }, { k: 'ticket', t: 'number' }, { k: 'cover', t: 'text' },
  ] },
  helpItems: { label: 'FAQ', fields: [
    { k: 'category', t: 'text' }, { k: 'q', t: 'text' }, { k: 'a', t: 'text' }, { k: 'icon', t: 'text' },
  ] },
  notifications: { label: 'Notifications', fields: [
    { k: 'type', t: 'select', opts: ['winner', 'promo', 'order', 'system'] }, { k: 'title', t: 'text' }, { k: 'body', t: 'text' }, { k: 'date', t: 'text' },
  ] },
};

const nav = [
  { id: 'dashboard', label: 'Dashboard' },
  ...Object.entries(COLLECTIONS).map(([id, c]) => ({ id, label: c.label })),
  { id: 'users', label: 'Users' },
  { id: 'orders', label: 'Orders' },
  { id: 'events', label: 'Analytics' },
  { id: 'settings', label: 'Settings' },
];

const section = ref('dashboard');
const stats = ref(null);
const rows = ref([]);
const users = ref([]);
const orders = ref([]);
const settings = reactive({ name: '', notice: '', service: '', tabBarColor: '', tabBarActive: '' });
const orderType = ref('');
const events = ref(null);

const colDef = computed(() => COLLECTIONS[section.value]);

async function loadSection() {
  const s = section.value;
  if (s === 'dashboard') { stats.value = await api.stats(); Object.assign(settings, stats.value.settings); }
  else if (s === 'users') users.value = (await api.users()).list;
  else if (s === 'orders') orders.value = (await api.orders(orderType.value)).list;
  else if (s === 'events') events.value = await api.events();
  else if (s === 'settings') { if (!stats.value) stats.value = await api.stats(); Object.assign(settings, stats.value.settings); }
  else if (COLLECTIONS[s]) rows.value = (await api.collection(s)).list;
}
function goto(id) { section.value = id; loadSection(); }

// Editor modal
const editing = ref(null);
function newItem() { const o = {}; colDef.value.fields.forEach((f) => (o[f.k] = f.t === 'bool' ? false : f.t === 'number' ? 0 : '')); editing.value = o; }
function editItem(row) { const o = { ...row }; colDef.value.fields.forEach((f) => { if (f.t === 'list') o[f.k] = Array.isArray(row[f.k]) ? row[f.k].join('\n') : (row[f.k] || ''); }); editing.value = o; }
async function saveItem() {
  const item = { ...editing.value };
  colDef.value.fields.forEach((f) => {
    if (f.t === 'number') item[f.k] = Number(item[f.k]) || 0;
    else if (f.t === 'list') item[f.k] = String(item[f.k] || '').split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
  });
  try { await api.save(section.value, item); editing.value = null; toast('Saved'); loadSection(); }
  catch (e) { toast(e.message); }
}

// User editor + actions
const vipOptions = ['', 'Silver', 'Gold', 'Platinum'];
const editingUser = ref(null);
const userDetail = ref(null);
function editUser(u) { editingUser.value = { id: u.id, nickname: u.nickname, balance: u.balance, frozen: u.frozen, vip: u.vip ? u.vip.name : '' }; }
async function saveUser() {
  try { await api.userSave({ ...editingUser.value }); editingUser.value = null; toast('User saved'); loadSection(); }
  catch (e) { toast(e.message); }
}
async function delUser(u) {
  if (!confirm('Delete user ' + (u.nickname || u.phone) + '?')) return;
  try { await api.userDelete(u.id); toast('User deleted'); loadSection(); }
  catch (e) { toast(e.message); }
}
async function viewUser(u) {
  try { userDetail.value = await api.userDetail(u.id); } catch (e) { toast(e.message); }
}

// Order actions
async function setOrderStatus(o, status) {
  try { await api.orderStatus(o.id, status); toast('Order ' + status); loadSection(); }
  catch (e) { toast(e.message); }
}
async function delOrder(o) {
  if (!confirm('Delete order #' + o.id + '?')) return;
  try { await api.orderDelete(o.id); toast('Order deleted'); loadSection(); }
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
        <div class="stat"><div class="n">₹{{ stats.withdraw }}</div><div class="l">Withdrawn</div></div>
        <div class="stat" :class="{ alert: stats.pendingWithdraw > 0 }"><div class="n">{{ stats.pendingWithdraw }}</div><div class="l">Pending withdrawals</div></div>
        <div class="stat" :class="{ alert: stats.pendingRecharge > 0 }"><div class="n">{{ stats.pendingRecharge }}</div><div class="l">Pending recharges</div></div>
        <div class="stat"><div class="n">{{ stats.notifications }}</div><div class="l">Notifications</div></div>
        <div class="stat"><div class="n">{{ stats.events }}</div><div class="l">Analytics events</div></div>
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
        <thead><tr><th>ID</th><th>Phone</th><th>Nickname</th><th>Balance</th><th>Frozen</th><th>VIP</th><th>Invite</th><th>Actions</th></tr></thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.id }}</td><td>{{ u.phone }}</td><td>{{ u.nickname }}</td>
            <td>₹{{ u.balance }}</td><td>₹{{ u.frozen }}</td><td>{{ u.vip ? u.vip.name : '—' }}</td><td>{{ u.inviteCode }}</td>
            <td class="row-actions">
              <button class="btn ghost sm" @click="viewUser(u)">View</button>
              <button class="btn ghost sm" @click="editUser(u)">Edit</button>
              <button class="btn sm" @click="adjust(u)">±₹</button>
              <button class="btn danger sm" @click="delUser(u)">Del</button>
            </td>
          </tr>
          <tr v-if="!users.length"><td colspan="8" class="muted">No users yet — sign in on the app first.</td></tr>
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
          <thead><tr><th>ID</th><th>User</th><th>Type</th><th>Item</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            <tr v-for="o in orders" :key="o.id">
              <td>{{ o.id }}</td><td>{{ o.userId }}</td><td>{{ o.type }}</td>
              <td>{{ o.product || '—' }}</td><td>₹{{ o.amount }}</td>
              <td><span class="pill" :class="'st-' + o.status">{{ o.status }}</span></td><td>{{ o.date }}</td>
              <td class="row-actions">
                <template v-if="(o.type === 'withdraw' || o.type === 'recharge') && o.status === 'pending'">
                  <button class="btn sm" @click="setOrderStatus(o, 'success')">Approve</button>
                  <button class="btn danger sm" @click="setOrderStatus(o, 'rejected')">Reject</button>
                </template>
                <template v-else-if="o.type === 'join' && o.status === 'ongoing'">
                  <button class="btn sm" @click="setOrderStatus(o, 'delivered')">Deliver</button>
                </template>
                <button class="btn ghost sm" @click="delOrder(o)">Del</button>
              </td>
            </tr>
            <tr v-if="!orders.length"><td colspan="8" class="muted">No orders yet.</td></tr>
          </tbody>
        </table>
      </template>

      <!-- Analytics / events -->
      <template v-else-if="section === 'events' && events">
        <div class="cards" style="margin-bottom:16px">
          <div class="stat"><div class="n">{{ events.total }}</div><div class="l">Total events</div></div>
          <div v-for="(c, name) in events.counts" :key="name" class="stat"><div class="n">{{ c }}</div><div class="l">{{ name }}</div></div>
        </div>
        <h3 style="margin:0 0 8px;font-size:15px;color:#17273a">Recent events</h3>
        <table>
          <thead><tr><th>Event</th><th>User</th><th>Props</th><th>Time</th></tr></thead>
          <tbody>
            <tr v-for="(e, i) in events.recent" :key="i">
              <td>{{ e.name }}</td><td>{{ e.userId || '—' }}</td>
              <td class="muted">{{ JSON.stringify(e.props) }}</td>
              <td>{{ new Date(e.ts).toLocaleString() }}</td>
            </tr>
            <tr v-if="!events.recent.length"><td colspan="4" class="muted">No events yet — use the app to generate events.</td></tr>
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
        <div class="field"><label>Withdrawal fee (%)</label><input type="number" v-model="settings.withdrawFee" /></div>
        <div class="field"><label>Minimum withdrawal (₹)</label><input type="number" v-model="settings.withdrawMin" /></div>
        <div class="field"><label>Withdrawal arrival time</label><input v-model="settings.withdrawArrival" /></div>
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
        <textarea v-else-if="f.t === 'list'" v-model="editing[f.k]" rows="3" placeholder="One per line (or comma-separated)"></textarea>
        <input v-else :type="f.t === 'number' ? 'number' : 'text'" v-model="editing[f.k]" />
      </div>
      <div class="modal-foot">
        <button class="btn ghost" @click="editing = null">Cancel</button>
        <button class="btn" @click="saveItem">Save</button>
      </div>
    </div>
  </div>

  <!-- User editor -->
  <div v-if="editingUser" class="modal" @click.self="editingUser = null">
    <div class="box">
      <h3>Edit user #{{ editingUser.id }}</h3>
      <div class="field"><label>Nickname</label><input v-model="editingUser.nickname" /></div>
      <div class="field"><label>Balance (₹)</label><input type="number" v-model="editingUser.balance" /></div>
      <div class="field"><label>Frozen (₹)</label><input type="number" v-model="editingUser.frozen" /></div>
      <div class="field"><label>VIP tier</label>
        <select v-model="editingUser.vip"><option v-for="o in vipOptions" :key="o" :value="o">{{ o || 'None' }}</option></select>
      </div>
      <div class="modal-foot">
        <button class="btn ghost" @click="editingUser = null">Cancel</button>
        <button class="btn" @click="saveUser">Save</button>
      </div>
    </div>
  </div>

  <!-- User detail -->
  <div v-if="userDetail" class="modal" @click.self="userDetail = null">
    <div class="box">
      <h3>{{ userDetail.user.nickname }} · {{ userDetail.user.phone }}</h3>
      <p class="muted" style="font-size:13px;margin:4px 0 12px">
        Balance ₹{{ userDetail.user.balance }} · Frozen ₹{{ userDetail.user.frozen }} · VIP {{ userDetail.user.vip ? userDetail.user.vip.name : '—' }}
        · Team {{ userDetail.team.direct.length }} direct / {{ userDetail.team.indirect.length }} indirect
      </p>
      <h4 style="margin:8px 0 4px">Orders ({{ userDetail.orders.length }})</h4>
      <table><thead><tr><th>Type</th><th>Item</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>
          <tr v-for="o in userDetail.orders.slice(0, 20)" :key="o.id"><td>{{ o.type }}</td><td>{{ o.product || '—' }}</td><td>₹{{ o.amount }}</td><td>{{ o.status }}</td><td>{{ o.date }}</td></tr>
          <tr v-if="!userDetail.orders.length"><td colspan="5" class="muted">No orders.</td></tr>
        </tbody>
      </table>
      <h4 style="margin:12px 0 4px">Banks ({{ userDetail.banks.length }}) · Addresses ({{ userDetail.addresses.length }})</h4>
      <div class="modal-foot"><button class="btn" @click="userDetail = null">Close</button></div>
    </div>
  </div>

  <div v-if="toastMsg" class="toast">{{ toastMsg }}</div>
</template>
