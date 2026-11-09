import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Proxies /api -> your local music API (no CORS issues)
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'https://jiosaavn-api.nowfa143.workers.dev/' } },
})
