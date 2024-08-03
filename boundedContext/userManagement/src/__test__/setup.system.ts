import { beforeAll, beforeEach, afterEach } from 'vitest'
import { persistenceHarness } from './setup.db'
import { createSystemWiring } from './support/system/SystemWiring'

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
