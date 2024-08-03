import { afterAll, beforeAll, beforeEach, afterEach } from 'vitest'
import { persistenceHarness } from './setup.db'
import { createSystemWiring } from './support/system/SystemWiring'
import { TestImageStorageService } from './support/system/TestImageStorageService'

let systemWiring: ReturnType<typeof createSystemWiring>
let imageStorageService: TestImageStorageService

beforeAll(() => {
  imageStorageService = new TestImageStorageService()
  systemWiring = createSystemWiring(persistenceHarness, imageStorageService)
})

beforeEach(() => {
  systemWiring.clearRepositoryCache()
})

afterEach(() => {
  systemWiring.clearRepositoryCache()
})

afterAll(() => {
  imageStorageService.destroy()
})

export { systemWiring, imageStorageService }
