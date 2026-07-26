import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Ensure a single React instance (prevents "Invalid hook call" when libraries
  // like react-router are pre-bundled by Vite).
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 5173,
    proxy: {
      // In dev, the React app (5173) forwards /api/* to the Express server (5000)
      '/api': 'http://localhost:5000',
    },
  },
})
