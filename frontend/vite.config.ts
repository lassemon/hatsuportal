/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'

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
    open: false, // Disable automatic opening of the browser
    port: 3000,
    host: true, // Ensure it listens on all network interfaces
    proxy: {
      '/api/v1': {
        target: 'http://localhost:8080', // Proxy requests to the backend server running on port 8080
        changeOrigin: true // Needed for virtual hosted sites
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__test__/setup.unit.ts', './src/setupTests.ts'],
    include: ['./src/**/*.test.{ts,tsx}'],
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: process.env.LOG_LEVEL ?? 'SILENT'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/__test__/**/*.ts',
        '**/index.ts',
        '**/**Enum.ts',
        '**/**Error.ts',
        '**/**DTO.ts',
        'src/setupTests.ts',
        'src/index.tsx'
      ]
    }
  }
})
