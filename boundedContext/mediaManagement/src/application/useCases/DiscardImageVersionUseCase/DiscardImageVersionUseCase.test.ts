import { afterEach, describe, it, vi } from 'vitest'
import { DiscardImageVersionScenario } from '../../../__test__/support/DiscardImageVersionScenario'
import { IDiscardImageVersionUseCaseOptions } from './DiscardImageVersionUseCase'
import { DataPersistenceError, NotFoundError } from '@hatsuportal/platform'

describe('DiscardImageVersionUseCase', () => {
  afterEach(() => vi.restoreAllMocks())

  const baseInput = (userId: string, imageId: string, stagedVersionId: string): IDiscardImageVersionUseCaseOptions => ({
    discardedById: userId,
    imageId,
    stagedVersionId,
    imageDiscarded: vi.fn()
  })

  it('should discard staged image successfully and call imageDiscarded', async ({ unitFixture }) => {
    const scenario = await DiscardImageVersionScenario.given()
      .withStagedImage()
      .whenExecutedWithInput(
        baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId, unitFixture.sampleImageVersionId)
      )

    scenario.thenOutputBoundaryCalled('imageDiscarded')
  })

  it('should call imageDiscarded when version is not staged (idempotent no-op)', async ({ unitFixture }) => {
    const scenario = await DiscardImageVersionScenario.given()
      .withExistingImage()
      .whenExecutedWithInput(
        baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId, unitFixture.sampleImageVersionId)
      )

    scenario.thenOutputBoundaryCalled('imageDiscarded')
  })

  it('should throw NotFoundError when image not found', async ({ unitFixture }) => {
    const scenario = await DiscardImageVersionScenario.given()
      .withoutExistingImage()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput(
        baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId, unitFixture.sampleImageVersionId)
      )

    scenario.thenOutputBoundaryNotCalled('imageDiscarded')
  })

  it('should not call output boundary when repository fails', async ({ unitFixture }) => {
    const scenario = await DiscardImageVersionScenario.given()
      .withStagedImageOnly()
      .repositoryWillReject(['discardStagedVersion'], new DataPersistenceError('DB fail'))
      .expectErrorOfType(DataPersistenceError)
      .whenExecutedWithInput(
        baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId, unitFixture.sampleImageVersionId)
      )

    scenario.thenOutputBoundaryNotCalled('imageDiscarded')
  })

  it('should not call output boundary when transaction manager fails', async ({ unitFixture }) => {
    const scenario = await DiscardImageVersionScenario.given()
      .withStagedImage()
      .transactionWillReject(new Error('tx fail'))
      .expectErrorOfType(Error)
      .whenExecutedWithInput(
        baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId, unitFixture.sampleImageVersionId)
      )

    scenario.thenOutputBoundaryNotCalled('imageDiscarded')
  })
})
