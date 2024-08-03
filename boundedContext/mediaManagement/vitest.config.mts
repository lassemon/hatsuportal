import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: ['./vitest.unit.mts', './vitest.integration.mts', './vitest.system.mts'],
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
        '**/I[A-Z]*.ts',
        '**/schemas/**',
        '**/repositories/*Repository.ts',
        '**/ValueObject.ts',
        '**/webp-converter.d.ts'
      ]
    }
  }
})
