import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // Bind mount do Windows para o container Linux: inotify não enxerga as
    // mudanças do host, então o HMR fica preso em versões antigas sem polling.
    watch: {
      usePolling: true,
    },
  },
  test: {
    environment: 'jsdom',
  },
})
