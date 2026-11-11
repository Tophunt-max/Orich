import { defineStore } from 'pinia';
import { api } from '../api/client';

export const useAuth = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('orich_token') || '',
    user: null,
  }),
  getters: {
    isLoggedIn: (s) => !!s.token,
  },
  actions: {
    setToken(token) {
      this.token = token;
      if (token) localStorage.setItem('orich_token', token);
      else localStorage.removeItem('orich_token');
    },
    async signIn(phone, code, invite) {
      const data = await api.login(phone, code, invite);
      this.setToken(data.token);
      this.user = data.user;
      api.track('login', { phone });
      return data.user;
    },
    async refresh() {
      if (!this.token) return null;
      try {
        const data = await api.account();
        this.user = data.user;
      } catch (e) {
        if (e.code === 401) this.signOut();
      }
      return this.user;
    },
    async signOut() {
      try { await api.logout(); } catch { /* ignore */ }
      this.setToken('');
      this.user = null;
    },
  },
});
