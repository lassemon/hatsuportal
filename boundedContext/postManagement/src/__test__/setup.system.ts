import { beforeAll, beforeEach, afterEach } from 'vitest'
import { persistenceHarness } from './setup.db'
import { createSystemWiring } from './support/system/SystemWiring'

/*
 * BC application-integration ("system") tier contract:
 * - Owns: UoW + outbox on write paths; read paths requiring use-case orchestration over real DB
 *   (cursor pagination, auth-wrapped queries, lookup-service enrichment) where repository
 *   integration alone is insufficient.
 * - Does NOT own: simple read round-trips already covered by repository integration
 *   (FindAllTags).
 *
 * Backend HTTP system tests live in backend/src/__test__/system/ and own routes, middleware,
 * mappers, auth-dependent filtering, and status codes.
 */

let systemWiring: ReturnType<typeof createSystemWiring>

beforeAll(() => {
  systemWiring = createSystemWiring(persistenceHarness)
})

beforeEach(() => {
  systemWiring.clearRepositoryCache()
})

afterEach(() => {
  systemWiring.clearRepositoryCache()
})

export { systemWiring }
