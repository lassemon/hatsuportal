/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__test__/setup.unit.ts'],
    include: ['./src/**/*.test.ts'],
    env: {
      NODE_ENV: 'test'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/__test__/**/*.ts', '**/index.ts', '**/**Enum.ts', '**/**Error.ts', '**/**DTO.ts']
    }
  }
})
