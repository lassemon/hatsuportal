import { afterAll, beforeAll, beforeEach } from 'vitest'
import { TestConnection } from '@hatsuportal/platform/test'
import { sampleUserId } from '@hatsuportal/shared-kernel/test'
import Connection from '../infrastructure/dataAccess/database/connection'
import { PersistenceHarness } from './support/persistence/PersistenceHarness'
import { insertUsersForeignKeyStub } from './support/fkStubs/users'
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
  await insertUsersForeignKeyStub(persistenceHarness, { id: sampleUserId })
  await insertDefaultThemeForeignKeyStub(persistenceHarness)
})

afterAll(async () => {
  await persistenceHarness.clearOwnedTables()
  await TestConnection.destroy()
  await Connection.destroy()
})

export { persistenceHarness }
