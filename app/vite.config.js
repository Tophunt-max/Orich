import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// Dev server proxies /api to the mock backend so the app uses same-origin requests.
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5188,
    proxy: {
      '/api': { target: 'http://localhost:8788', changeOrigin: true },
    },
  },
});
