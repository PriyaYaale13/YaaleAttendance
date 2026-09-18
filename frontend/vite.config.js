import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    host: '0.0.0.0',
    port: 3029,
    allowedHosts: ['72-62-227-163.nip.io', '72.62.227.163', 'localhost']
  }
})
