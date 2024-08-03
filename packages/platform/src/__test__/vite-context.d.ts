import * as unit from './testFactory'

declare module 'vitest' {
  export interface TestContext {
    unitFixture: typeof unit
  }
}
