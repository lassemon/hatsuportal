import { afterEach, describe, expect, it, vi } from 'vitest'
import { CreateStagedImageVersionScenario } from '../../../__test__/support/CreateStagedImageVersionScenario'
import { ICreateStagedImageVersionUseCaseOptions } from './CreateStagedImageVersionUseCase'
import { DataPersistenceError } from '@hatsuportal/platform'
import { EntityTypeEnum, ImageRoleEnum } from '@hatsuportal/common'

describe('CreateStagedImageVersionUseCase', () => {
  afterEach(() => vi.restoreAllMocks())

  const baseInput = (userId: string, ownerEntityId: string): ICreateStagedImageVersionUseCaseOptions => ({
    createdById: userId,
    createImageInput: {
      ownerEntityType: EntityTypeEnum.Story,
      ownerEntityId,
      role: ImageRoleEnum.Cover,
      mimeType: 'image/png',
      size: 100,
      base64: 'data:image/png;base64,AAA'
    },
    imageCreated: vi.fn()
  })

  it('should create staged image successfully and call imageCreated with imageId and stagedVersionId', async ({ unitFixture }) => {
    const scenario = await CreateStagedImageVersionScenario.given().whenExecutedWithInput(
      baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId)
    )

    scenario.thenOutputBoundaryCalled('imageCreated', expect.any(String), expect.any(String))
  })

  it('should not call output boundary when repository fails', async ({ unitFixture }) => {
    const scenario = await CreateStagedImageVersionScenario.given()
      .repositoryWillReject(['insertStaged'], new DataPersistenceError('DB fail'))
      .expectErrorOfType(DataPersistenceError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId))

    scenario.thenOutputBoundaryNotCalled('imageCreated')
  })

  it('should not call output boundary when transaction manager fails', async ({ unitFixture }) => {
    const scenario = await CreateStagedImageVersionScenario.given()
      .transactionWillReject(new Error('tx fail'))
      .expectErrorOfType(Error)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId))

    scenario.thenOutputBoundaryNotCalled('imageCreated')
  })
})
