import { afterAll, beforeAll, beforeEach } from 'vitest'
import { TestConnection } from '@hatsuportal/platform/test'
import { PersistenceHarness } from './support/persistence/PersistenceHarness'
import { insertDefaultThemeForeignKeyStub } from './support/fkStubs/themes'

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ?? 'postgres://test:test@localhost:5433/hatsuportal_test'

let persistenceHarness: PersistenceHarness

beforeAll(async () => {
  process.env.DATABASE_URL = TEST_DATABASE_URL
  await PersistenceHarness.assertReachable(TEST_DATABASE_URL)
  persistenceHarness = PersistenceHarness.connect()
})

beforeEach(async () => {
  await persistenceHarness.clearOwnedTables()
  await insertDefaultThemeForeignKeyStub(persistenceHarness)
})

afterAll(async () => {
  await TestConnection.destroy()
})

export { persistenceHarness }
