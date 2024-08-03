import { afterAll, beforeAll, beforeEach } from 'vitest'
import { TestConnection } from '@hatsuportal/platform/test'
import { PersistenceHarness } from './support/persistence/PersistenceHarness'
import { insertUsersForeignKeyStub } from './support/fkStubs/users'
import * as Fixture from './testFactory'

/*
 * Integration tier contract:
 * - Owns: SQL constraints, cursor pagination, optimistic locking, join tables
 *   (post_tag_links, post_image_links), CASCADE, repository access-control SQL.
 * - Does NOT own: full use-case wiring, HTTP, validation wrappers.
 *
 * Unit/domain tier owns entity invariants, mocked use-case orchestration, validation guards,
 * and ABAC rule matrix (CommentAuthorizationService / StoryAuthorizationService).
 */

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ?? 'postgres://test:test@localhost:5433/hatsuportal_test'

let persistenceHarness: PersistenceHarness

beforeAll(async () => {
  process.env.DATABASE_URL = TEST_DATABASE_URL
  await PersistenceHarness.assertReachable(TEST_DATABASE_URL)
  persistenceHarness = PersistenceHarness.connect()
  await insertUsersForeignKeyStub(persistenceHarness, { id: Fixture.sampleUserId })
  await insertUsersForeignKeyStub(persistenceHarness, {
    id: Fixture.sampleNonAuthorUserId,
    email: 'other-user@hatsuportal.test',
    name: 'Other User'
  })
})

beforeEach(async () => {
  await persistenceHarness.clearOwnedTables()
})

afterAll(async () => {
  await persistenceHarness.clearOwnedTables()
  await TestConnection.destroy()
})

export { persistenceHarness }
