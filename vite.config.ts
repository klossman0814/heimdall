import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      // Icon lookup must happen server-side (CORS), so in dev forward just that
      // endpoint to a locally running API: `node server/index.js`. Only this
      // path is proxied so the dev server never reads or writes the persisted
      // dashboard data of a running production container.
      '/api/fetch-icon': {
        target: process.env.HEIMDALL_API_URL || 'http://localhost:8086',
        changeOrigin: true,
      },
    },
  },
})
