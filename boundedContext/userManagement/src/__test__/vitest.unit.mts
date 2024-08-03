/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    setupFiles: ['./src/__test__/setup.unit.ts'],
    include: ['./src/**/*.test.ts'],
    env: {
      NODE_ENV: 'test'
    }
  }
})
