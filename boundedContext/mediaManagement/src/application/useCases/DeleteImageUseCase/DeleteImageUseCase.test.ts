import { afterEach, describe, expect, it, vi } from 'vitest'
import { DeleteImageScenario } from '../../../__test__/support/DeleteImageScenario'
import { IDeleteImageUseCaseOptions } from './DeleteImageUseCase'
import { DataPersistenceError } from '@hatsuportal/platform'

describe('DeleteImageUseCase', () => {
  afterEach(() => vi.restoreAllMocks())

  const baseInput = (userId: string, imageId: string): IDeleteImageUseCaseOptions => ({
    deletedById: userId,
    deleteImageInput: { imageId },
    imageDeleted: vi.fn()
  })

  it('should delete image successfully and call imageDeleted with ImageDTO', async ({ unitFixture }) => {
    const scenario = await DeleteImageScenario.given()
      .withExistingImage()
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId))

    scenario.thenOutputBoundaryCalled('imageDeleted', expect.any(Object))
  })

  it('should throw when image not found', async ({ unitFixture }) => {
    const scenario = await DeleteImageScenario.given()
      .withoutExistingImage()
      .expectErrorOfType(Error)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId))

    scenario.thenOutputBoundaryNotCalled('imageDeleted')
  })

  it('should not call output boundary when repository fails', async ({ unitFixture }) => {
    const scenario = await DeleteImageScenario.given()
      .withExistingImage()
      .persistenceServiceWillReject(['delete'], new DataPersistenceError('DB fail'))
      .expectErrorOfType(DataPersistenceError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId))

    scenario.thenOutputBoundaryNotCalled('imageDeleted')
  })

  it('should not call output boundary when domain event service fails', async ({ unitFixture }) => {
    const scenario = await DeleteImageScenario.given()
      .withExistingImage()
      .domainEventServiceWillReject(new Error('Domain event service failure'))
      .expectErrorOfType(Error)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId))

    scenario.thenOutputBoundaryNotCalled('imageDeleted')
  })
})
