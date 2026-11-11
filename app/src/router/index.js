import { createRouter, createWebHashHistory } from 'vue-router';

// Mirrors the original uni-app route roles (home, winner, account, goods, order,
// payment/recharge, finance, invitation, login, help) at a sensible subset.
const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', component: () => import('../views/Home.vue'), meta: { tab: true } },
  { path: '/winner', component: () => import('../views/Winner.vue'), meta: { tab: true } },
  { path: '/account', component: () => import('../views/Account.vue'), meta: { tab: true, auth: true } },
  { path: '/login', component: () => import('../views/Login.vue') },
  { path: '/goods/:id', component: () => import('../views/GoodsDetail.vue') },
  { path: '/recharge', component: () => import('../views/Recharge.vue'), meta: { auth: true } },
  { path: '/orders', component: () => import('../views/OrderRecord.vue'), meta: { auth: true } },
  { path: '/finance', component: () => import('../views/Finance.vue') },
  { path: '/tasks', component: () => import('../views/Tasks.vue'), meta: { auth: true } },
  { path: '/vip', component: () => import('../views/Vip.vue'), meta: { auth: true } },
  { path: '/finance/:id', component: () => import('../views/FinanceDetail.vue'), meta: { auth: true } },
  { path: '/invitation', component: () => import('../views/Invitation.vue'), meta: { auth: true } },
  { path: '/help', component: () => import('../views/Help.vue') },
];

const router = createRouter({ history: createWebHashHistory(), routes });

router.beforeEach((to) => {
  if (to.meta.auth && !localStorage.getItem('orich_token')) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }
  return true;
});

export default router;
