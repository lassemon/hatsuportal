import { describe, expect, it, vi } from 'vitest'
import { mediaV1 } from '@hatsuportal/bounded-context-service-contracts'
import { EntityTypeEnum, ImageRoleEnum } from '@hatsuportal/common'
import { MediaGateway } from './MediaGateway'
import { MediaGatewayMapper } from '../mappers/MediaGatewayMapper'
import * as Fixture from '../../../../__test__/testFactory'

describe('MediaGateway', () => {
  const setup = () => {
    const mediaQueryFacade: mediaV1.IMediaQueryFacade = {
      getImageById: vi.fn()
    }
    const mediaCommandFacade: mediaV1.IMediaCommandFacade = {
      prepareStagedImageFile: vi.fn(),
      registerPreparedStagedImageFileRollbackCleanup: vi.fn(),
      saveStagedImageMetadata: vi.fn(),
      createStagedImageVersion: vi.fn(),
      promoteImageVersion: vi.fn(),
      deleteImage: vi.fn()
    }
    const mediaGatewayMapper = new MediaGatewayMapper()
    const gateway = new MediaGateway(mediaQueryFacade, mediaCommandFacade, mediaGatewayMapper)
    return { mediaQueryFacade, mediaCommandFacade, gateway }
  }

  const imageContract = (): mediaV1.ImageContract => ({
    id: Fixture.sampleImageId,
    kind: mediaV1.MediaKindContract.Image,
    storageKey: 'filename.png',
    mimeType: 'image/png',
    size: 1537565,
    base64: 'data:image/png;base64,iVBORw0KGgo',
    createdById: Fixture.sampleUserId,
    createdAt: Fixture.imageAttacmentMock().createdAt,
    updatedAt: Fixture.imageAttacmentMock().updatedAt
  })

  it('maps successful facade result to attachment read model', async () => {
    const { mediaQueryFacade, gateway } = setup()
    vi.mocked(mediaQueryFacade.getImageById).mockResolvedValue(imageContract())

    const result = await gateway.getImageById({ imageId: Fixture.sampleImageId })

    expect(result.isSuccess()).toBe(true)
    expect(result.value).toEqual({
      id: Fixture.sampleImageId,
      storageKey: 'filename.png',
      mimeType: 'image/png',
      size: 1537565,
      base64: 'data:image/png;base64,iVBORw0KGgo',
      createdById: Fixture.sampleUserId,
      createdAt: Fixture.imageAttacmentMock().createdAt,
      updatedAt: Fixture.imageAttacmentMock().updatedAt
    })
  })

  it('returns failed load when facade throws an Error', async () => {
    const { mediaQueryFacade, gateway } = setup()
    vi.mocked(mediaQueryFacade.getImageById).mockRejectedValue(new Error('boom'))

    const result = await gateway.getImageById({ imageId: Fixture.sampleImageId })

    expect(result.isFailed()).toBe(true)
    expect(result.error.error.message).toBe('boom')
  })

  it('returns failed load when facade throws a non-Error value', async () => {
    const { mediaQueryFacade, gateway } = setup()
    vi.mocked(mediaQueryFacade.getImageById).mockRejectedValue('unexpected')

    const result = await gateway.getImageById({ imageId: Fixture.sampleImageId })

    expect(result.isFailed()).toBe(true)
    expect(result.error.error.message).toBe('Unknown error occurred')
  })

  it('delegates command operations to media command facade', async () => {
    const { mediaCommandFacade, gateway } = setup()
    const stagedResult: mediaV1.CreateStagedImageVersionResult = {
      createdById: Fixture.sampleUserId,
      imageId: Fixture.sampleImageId,
      stagedVersionId: 'staged-version-id'
    }
    vi.mocked(mediaCommandFacade.createStagedImageVersion).mockResolvedValue(stagedResult)

    const createCommand: mediaV1.CreateStagedImageCommand = {
      ownerEntityType: EntityTypeEnum.Story,
      ownerEntityId: Fixture.sampleStoryId,
      role: ImageRoleEnum.Cover,
      mimeType: 'image/png',
      size: 1537565,
      base64: 'data:image/png;base64,iVBORw0KGgo',
      createdById: Fixture.sampleUserId
    }
    const promoteCommand: mediaV1.PromoteImageVersionCommand = {
      promotedById: Fixture.sampleUserId,
      imageId: Fixture.sampleImageId,
      stagedVersionId: 'staged-version-id'
    }
    const deleteCommand: mediaV1.DeleteImageCommand = {
      deletedById: Fixture.sampleUserId,
      imageId: Fixture.sampleImageId
    }

    await expect(gateway.createStagedImageVersion(createCommand)).resolves.toEqual(stagedResult)
    await expect(gateway.promoteImageVersion(promoteCommand)).resolves.toBeUndefined()
    await expect(gateway.deleteImage(deleteCommand)).resolves.toBeUndefined()

    expect(mediaCommandFacade.createStagedImageVersion).toHaveBeenCalledWith(createCommand)
    expect(mediaCommandFacade.promoteImageVersion).toHaveBeenCalledWith(promoteCommand)
    expect(mediaCommandFacade.deleteImage).toHaveBeenCalledWith(deleteCommand)
  })
})
