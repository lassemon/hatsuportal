import { initForSystemTests } from '../../../compositionRoot'
import { createTestApp } from './createTestApp'
import { clearRepositoryCaches } from './repositoryCacheRegistry'

export async function createSystemWiring() {
  const { container, repositoryCaches } = initForSystemTests()
  const app = await createTestApp(container)

  return {
    app,
    container,
    clearRepositoryCache: () => clearRepositoryCaches(repositoryCaches)
  }
}
