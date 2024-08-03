import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import fs from 'fs'
import { createServer } from 'https'

export default defineConfig({
  base: '/',
  build: {
    outDir: './build'
  },
  plugins: [react(), viteTsconfigPaths()],
  optimizeDeps: {
    include: ['@mui/material/Tooltip']
  },
  server: {
    // https: createServer({
    //   key: fs.readFileSync('../backend/cert/server.key'),
    //   cert: fs.readFileSync('../backend/cert/server.cert')
    // }),
    open: false, // Disable automatic opening of the browser
    port: 3000,
    host: true, // Ensure it listens on all network interfaces
    proxy: {
      '/api/v1': {
        target: 'https://localhost:443', // Proxy requests to the backend server running on port 443
        changeOrigin: true, // Needed for virtual hosted sites
        secure: false,
        headers: {
          credentials: 'include'
        }
      }
    }
  }
})
