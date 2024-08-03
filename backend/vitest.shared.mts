import { defineProject, type UserWorkspaceConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

type TestProjectConfig = NonNullable<UserWorkspaceConfig['test']>

export function defineVitestProject(test: TestProjectConfig): UserWorkspaceConfig {
  return defineProject({
    plugins: [tsconfigPaths()],
    test: {
      environment: 'node',
      env: { NODE_ENV: 'test' },
      ...test
    }
  })
}

const serialDbTestOptions = {
  fileParallelism: false,
  sequence: {
    concurrent: false as const
  },
  pool: 'forks' as const,
  poolOptions: {
    forks: {
      singleFork: true
    }
  }
}

export function defineDbVitestProject(test: TestProjectConfig): UserWorkspaceConfig {
  return defineVitestProject({
    ...(serialDbTestOptions as TestProjectConfig),
    ...test
  })
}
