import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConcurrencyError } from '@hatsuportal/common-bounded-context'
import { EntityTypeEnum } from '@hatsuportal/common'
import { UpdateImageScenario } from '../../../../__test__/support/image/UpdateImageScenario'

describe('UpdateImageUseCase', () => {
  afterEach(() => vi.restoreAllMocks())

  const baseInput = (loggedId: string, imageId: string): any => ({
    loggedInUserId: loggedId,
    updateImageData: {
      id: imageId,
      fileName: 'new.png',
      mimeType: 'image/png',
      size: 200,
      base64: 'data:image/png;base64,BBB',
      ownerEntityId: 'owner-123-asdfghjkl-zxcvbnm-qwerasdf-1234567890-asdfghjkl-zxcvbnm',
      ownerEntityType: EntityTypeEnum.Story
    }
  })

  it('should update image successfully', async ({ unitFixture }) => {
    const scenario = await UpdateImageScenario.given()
      .withExistingImage()
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, unitFixture.imageDTOMock().id))

    scenario.thenOutputBoundaryCalled('imageUpdated', expect.any(Object))
  })

  it('should call updateConflict output boundary and not throw when ConcurrencyError occurs', async ({ unitFixture }) => {
    const scenario = await UpdateImageScenario.given()
      .withExistingImage()
      .repositoryWillReject('update', new ConcurrencyError('conflict', unitFixture.imageDTOMock()))
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, unitFixture.imageDTOMock().id))

    scenario
      .thenOutputBoundaryNotCalled('imageUpdated')
      .thenOutputBoundaryCalled('updateConflict', expect.any(Object))
      .thenDomainEventsNotEmitted('ImageUpdatedEvent')
      .thenTransactionRolledBack()
  })
})
