import { afterEach, describe, expect, it, vi } from 'vitest'
import { PromoteImageVersionScenario } from '../../../__test__/support/PromoteImageVersionScenario'
import { IPromoteImageVersionUseCaseOptions } from './PromoteImageVersionUseCase'
import { DataPersistenceError, NotFoundError } from '@hatsuportal/platform'

describe('PromoteImageVersionUseCase', () => {
  afterEach(() => vi.restoreAllMocks())

  const baseInput = (userId: string, imageId: string, stagedVersionId: string): IPromoteImageVersionUseCaseOptions => ({
    promotedById: userId,
    imageId,
    stagedVersionId,
    imagePromoted: vi.fn()
  })

  it('should promote staged image successfully and call imagePromoted with ImageDTO', async ({ unitFixture }) => {
    const scenario = await PromoteImageVersionScenario.given()
      .withStagedImageOnly()
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId, unitFixture.sampleImageVersionId))

    scenario.thenOutputBoundaryCalled('imagePromoted', expect.any(Object))
  })

  it('should call imagePromoted when version is not staged (idempotent no-op)', async ({ unitFixture }) => {
    const scenario = await PromoteImageVersionScenario.given()
      .withExistingImage()
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId, unitFixture.sampleImageVersionId))

    scenario.thenOutputBoundaryCalled('imagePromoted', expect.any(Object))
  })

  it('should throw NotFoundError when image not found', async ({ unitFixture }) => {
    const scenario = await PromoteImageVersionScenario.given()
      .withoutExistingImage()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId, unitFixture.sampleImageVersionId))

    scenario.thenOutputBoundaryNotCalled('imagePromoted')
  })

  it('should not call output boundary when repository fails', async ({ unitFixture }) => {
    const scenario = await PromoteImageVersionScenario.given()
      .withStagedImageOnly()
      .persistenceServiceWillReject(['update'], new DataPersistenceError('DB fail'))
      .expectErrorOfType(DataPersistenceError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId, unitFixture.sampleImageVersionId))

    scenario.thenOutputBoundaryNotCalled('imagePromoted')
  })

  it('should not call output boundary when domain event service fails', async ({ unitFixture }) => {
    const scenario = await PromoteImageVersionScenario.given()
      .withStagedImageOnly()
      .domainEventServiceWillReject(new Error('Domain event service failure'))
      .expectErrorOfType(Error)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId, unitFixture.sampleImageVersionId))

    scenario.thenOutputBoundaryNotCalled('imagePromoted')
  })
})
