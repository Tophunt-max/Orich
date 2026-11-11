// Admin API client. Bearer token in Authorization header; response { code, msg, data }.
const BASE = import.meta.env.VITE_ADMIN_API || '/admin/api';
let token = localStorage.getItem('orich_admin_token') || '';

export function setToken(t) {
  token = t || '';
  if (t) localStorage.setItem('orich_admin_token', t);
  else localStorage.removeItem('orich_admin_token');
}
export const hasToken = () => !!token;

async function req(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (json.code !== 1) {
    const e = new Error(json.msg || 'Request failed');
    e.code = json.code;
    throw e;
  }
  return json.data;
}

export const api = {
  login: (username, password) => req('POST', '/login', { username, password }),
  me: () => req('GET', '/me'),
  logout: () => req('POST', '/logout'),
  stats: () => req('GET', '/stats'),
  collection: (name) => req('GET', '/collection?name=' + name),
  save: (name, item) => req('POST', '/collection/save', { name, item }),
  remove: (name, id) => req('POST', '/collection/delete', { name, id }),
  users: () => req('GET', '/users'),
  adjust: (id, delta) => req('POST', '/users/adjust', { id, delta }),
  orders: (type) => req('GET', '/orders' + (type ? '?type=' + type : '')),
  settings: (settings) => req('POST', '/settings', { settings }),
  drawWinner: (productId, name, shares) => req('POST', '/drawWinner', { productId, name, shares }),
};
