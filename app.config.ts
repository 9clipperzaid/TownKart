import { defineConfig } from '@tanstack/start/config'

export default defineConfig({
  server: {
    preset: 'vercel', // ← this is critical
  },
})