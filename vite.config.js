import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ['postal-mime'], // Explicitly include if needed
  },
  plugins: [vue()],
})
