import { createRouter, createWebHashHistory } from 'vue-router';

// Every real ORich 2.1.4 page has a route here.
const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', component: () => import('../views/Home.vue'), meta: { tab: true } },
  { path: '/winner', component: () => import('../views/Winner.vue'), meta: { tab: true } },
  { path: '/account', component: () => import('../views/Account.vue'), meta: { tab: true, auth: true } },
  { path: '/login', component: () => import('../views/Login.vue') },
  { path: '/regist', component: () => import('../views/Regist.vue') },
  { path: '/intro', component: () => import('../views/Intro.vue') },
  { path: '/index', component: () => import('../views/Launch.vue') },
  { path: '/goods/:id', component: () => import('../views/GoodsDetail.vue') },
  { path: '/goods/:id/confirm', component: () => import('../views/GoodsConfirm.vue'), meta: { auth: true } },
  { path: '/calculation', component: () => import('../views/Calculation.vue') },
  { path: '/recharge', component: () => import('../views/Recharge.vue'), meta: { auth: true } },
  { path: '/withdraw', component: () => import('../views/CashOut.vue'), meta: { auth: true } },
  { path: '/payment', component: () => import('../views/Payment.vue'), meta: { auth: true } },
  { path: '/payment/add', component: () => import('../views/BankAdd.vue'), meta: { auth: true } },
  { path: '/payrecord', component: () => import('../views/PayRecord.vue'), meta: { auth: true } },
  { path: '/cashrecord', component: () => import('../views/CashRecord.vue'), meta: { auth: true } },
  { path: '/payform', component: () => import('../views/PayForm.vue'), meta: { auth: true } },
  { path: '/orders', component: () => import('../views/OrderRecord.vue'), meta: { auth: true } },
  { path: '/orders/:id', component: () => import('../views/OrderDetail.vue'), meta: { auth: true } },
  { path: '/discount', component: () => import('../views/Discount.vue'), meta: { auth: true } },
  { path: '/finance', component: () => import('../views/Finance.vue') },
  { path: '/finance/:id', component: () => import('../views/FinanceDetail.vue'), meta: { auth: true } },
  { path: '/finance-order', component: () => import('../views/FinanceOrder.vue'), meta: { auth: true } },
  { path: '/tasks', component: () => import('../views/Tasks.vue'), meta: { auth: true } },
  { path: '/vip', component: () => import('../views/Vip.vue'), meta: { auth: true } },
  { path: '/invitation', component: () => import('../views/Invitation.vue'), meta: { auth: true } },
  { path: '/myshare', component: () => import('../views/MyShare.vue'), meta: { auth: true } },
  { path: '/prize', component: () => import('../views/Prize.vue') },
  { path: '/game', component: () => import('../views/Game.vue'), meta: { auth: true } },
  { path: '/address', component: () => import('../views/Address.vue'), meta: { auth: true } },
  { path: '/address/add', component: () => import('../views/AddressAdd.vue'), meta: { auth: true } },
  { path: '/team', component: () => import('../views/Team.vue'), meta: { auth: true } },
  { path: '/team/:level', component: () => import('../views/TeamDetail.vue'), meta: { auth: true } },
  { path: '/funding', component: () => import('../views/Funding.vue'), meta: { auth: true } },
  { path: '/setting', component: () => import('../views/Setting.vue'), meta: { auth: true } },
  { path: '/username', component: () => import('../views/Username.vue'), meta: { auth: true } },
  { path: '/aboutus', component: () => import('../views/AboutUs.vue') },
  { path: '/service', component: () => import('../views/Service.vue') },
  { path: '/help', component: () => import('../views/Help.vue') },
  { path: '/help/:id', component: () => import('../views/HelpDetail.vue') },
  { path: '/rule', component: () => import('../views/Rule.vue') },
  { path: '/success', component: () => import('../views/Success.vue') },
  { path: '/bask', component: () => import('../views/Bask.vue'), meta: { auth: true } },
];

const router = createRouter({ history: createWebHashHistory(), routes });

router.beforeEach((to) => {
  if (to.meta.auth && !localStorage.getItem('orich_token')) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }
  return true;
});

export default router;
