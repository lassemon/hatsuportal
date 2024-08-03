import { defineVitestProject } from './vitest.shared.mts'

export default defineVitestProject({
  name: 'unit',
  include: ['./src/**/*.test.ts'],
  exclude: ['./src/__test__/integration/**', './src/__test__/system/**'],
  setupFiles: ['./src/__test__/setup.unit.ts']
})
