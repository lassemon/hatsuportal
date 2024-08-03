import { afterEach, describe, expect, it, vi } from 'vitest'
import { NotFoundError } from '@hatsuportal/platform'
import { FindImageScenario } from '../../../__test__/support/FindImageScenario'

describe('FindImageUseCase', () => {
  afterEach(() => vi.restoreAllMocks())

  const imageId = 'img-1234-abcd-1234-efgh-lkjdglfhayk-asdksge-234234234'

  it('should find image and call output boundary', async () => {
    const scenario = await FindImageScenario.given().withExistingImage().whenExecutedWithInput(imageId)

    scenario.thenOutputBoundaryCalled('imageFound', expect.any(Object))
  })

  it('should throw NotFoundError when image metadata missing', async () => {
    const scenario = await FindImageScenario.given().withoutExistingImage().expectErrorOfType(NotFoundError).whenExecutedWithInput(imageId)

    scenario.thenOutputBoundaryNotCalled('imageFound')
  })
})
