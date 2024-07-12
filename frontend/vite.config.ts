import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  // depending on your application, base can also be "/"
  base: '/',
  build: {
    outDir: './build'
  },
  plugins: [react(), viteTsconfigPaths()],
  optimizeDeps: {
    include: ['@mui/material/Tooltip']
  },
  server: {
    open: false, // Disable automatic opening of the browser
    port: 3000,
    host: true, // Ensure it listens on all network interfaces
    proxy: {
      '/api/v1': {
        target: 'http://localhost:80', // Proxy requests to the backend server running on port 80
        changeOrigin: true, // Needed for virtual hosted sites
        secure: false // If you're proxying to a server with a self-signed certificate
      }
    }
  }
})
