import { defineDbVitestProject } from './vitest.shared.mts'

export default defineDbVitestProject({
  name: 'system',
  include: ['./src/__test__/system/**/*.test.ts'],
  setupFiles: ['./src/__test__/setup.db.ts', './src/__test__/setup.unit.ts', './src/__test__/setup.system.ts']
})
