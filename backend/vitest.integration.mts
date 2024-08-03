import { defineDbVitestProject } from './vitest.shared.mts'

export default defineDbVitestProject({
  name: 'integration',
  include: ['./src/__test__/integration/**/*.test.ts'],
  setupFiles: ['./src/__test__/setup.env.ts', './src/__test__/setup.db.ts', './src/__test__/setup.unit.ts']
})
