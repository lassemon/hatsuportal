import { afterEach, describe, expect, it, vi } from 'vitest'
import { UpdateImageScenario } from '../../../__test__/support/UpdateImageScenario'
import { IUpdateImageUseCaseOptions } from './UpdateImageUseCase'
import { ConcurrencyError } from '@hatsuportal/platform'

describe('UpdateImageUseCase', () => {
  afterEach(() => vi.restoreAllMocks())

  const baseInput = (loggedId: string, imageId: string): IUpdateImageUseCaseOptions => ({
    updatedById: loggedId,
    updateImageInput: {
      id: imageId,
      mimeType: 'image/png',
      size: 200,
      base64: 'data:image/png;base64,BBB'
    },
    imageUpdated: vi.fn(),
    updateConflict: vi.fn()
  })

  it('should update image successfully', async ({ unitFixture }) => {
    const scenario = await UpdateImageScenario.given()
      .withExistingImage()
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.imageDTOMock().id))

    scenario.thenOutputBoundaryCalled('imageUpdated', expect.any(Object))
  })

  it('should call updateConflict output boundary and not throw when ConcurrencyError occurs', async ({ unitFixture }) => {
    const scenario = await UpdateImageScenario.given()
      .withExistingImage()
      .repositoryWillReject(['update'], new ConcurrencyError('conflict', unitFixture.imageDTOMock()))
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.imageDTOMock().id))

    scenario
      .thenOutputBoundaryNotCalled('imageUpdated')
      .thenOutputBoundaryCalled('updateConflict', expect.any(Object))
      .thenDomainEventsNotEmitted('ImageUpdatedEvent')
  })
})
