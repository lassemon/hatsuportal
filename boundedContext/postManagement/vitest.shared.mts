import { defineProject, type UserWorkspaceConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

type TestProjectConfig = NonNullable<UserWorkspaceConfig['test']>

export function defineVitestProject(test: TestProjectConfig): UserWorkspaceConfig {
  return defineProject({
    plugins: [tsconfigPaths()],
    test: {
      environment: 'node',
      env: { NODE_ENV: 'test', LOG_LEVEL: process.env.LOG_LEVEL ?? 'SILENT' },
      ...test
    }
  })
}

/**
 * Vitest runner settings for integration/system tests that share one Postgres
 * database and module-level singletons (`persistenceHarness`, `systemWiring`).
 * Without serial execution, concurrent files or tests race on the database and
 * produce intermittent failures.
 */
const serialDbTestOptions = {
  /**
   * Run one test file at a time.
   * Prevents two files from interleaving writes while another file's `beforeEach`
   * cleanup (`setup.db.ts`) is in progress.
   *
   * Vitest types list this as a workspace-level option only; cast below when merging
   * into integration/system projects where runtime accepts it.
   */
  fileParallelism: false,

  sequence: {
    /**
     * Do not run concurrent tests (`it.concurrent`, `describe.concurrent`) in
     * parallel within a file.
     */
    concurrent: false as const
  },

  /**
   * Use child processes instead of worker threads (Vitest's default).
   * Setup-file singletons then live in one Node process with a single module graph.
   */
  pool: 'forks' as const,

  poolOptions: {
    forks: {
      /**
       * Run all test files in a single fork process.
       * Ensures one shared `beforeAll` wiring instance instead of one per file.
       */
      singleFork: true
    }
  }
}

/** Vitest project for integration/system suites that share Postgres and setup singletons. */
export function defineDbVitestProject(test: TestProjectConfig): UserWorkspaceConfig {
  return defineVitestProject({
    ...(serialDbTestOptions as TestProjectConfig),
    ...test
  })
}
