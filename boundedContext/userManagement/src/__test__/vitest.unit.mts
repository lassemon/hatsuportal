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
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/__test__/**/*.ts',
        '**/index.ts',
        '**/**Enum.ts',
        '**/**Error.ts',
        '**/**DTO.ts',
        // Type-only ports / schemas (I[A-Z]* avoids matching Invalid*.ts which *Error already excludes)
        '**/I[A-Z]*.ts',
        '**/schemas/**',
        '**/JwtPayload.ts',
        // Knex persistence — out of scope until a DB integration harness exists
        '**/repositories/UserRepository.ts'
      ]
    }
  }
})
