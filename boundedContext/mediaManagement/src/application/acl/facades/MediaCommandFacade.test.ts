import { describe, expect, it, vi } from 'vitest'
import { EntityTypeEnum, ImageRoleEnum } from '@hatsuportal/common'
import { MediaCommandFacade } from './MediaCommandFacade'
import { MediaCommandMapper } from './mappers/MediaCommandMapper'
import { StagedImageFactory } from '../../factories/StagedImageFactory'
import { StorageKeyGenerator } from '../../../infrastructure'
import * as Fixture from '../../../__test__/testFactory'

describe('MediaCommandFacade', () => {
  const setup = () => {
    const imagePersistenceService = Fixture.imagePersistenceServiceMock()
    const stagedImageFactory = new StagedImageFactory(new StorageKeyGenerator())
    const createStagedImageVersionUseCase = { execute: vi.fn() }
    const promoteImageVersionUseCase = { execute: vi.fn() }
    const deleteImageUseCase = { execute: vi.fn() }
    const mediaCommandMapper = new MediaCommandMapper()
    const facade = new MediaCommandFacade(
      imagePersistenceService,
      stagedImageFactory,
      createStagedImageVersionUseCase,
      promoteImageVersionUseCase,
      deleteImageUseCase,
      mediaCommandMapper
    )
    return {
      imagePersistenceService,
      stagedImageFactory,
      createStagedImageVersionUseCase,
      promoteImageVersionUseCase,
      deleteImageUseCase,
      facade
    }
  }

  it('resolves createStagedImageVersion via success callback', async () => {
    const { createStagedImageVersionUseCase, facade } = setup()
    createStagedImageVersionUseCase.execute.mockImplementation(async (input) => {
      input.imageCreated(Fixture.sampleImageId, Fixture.sampleImageVersionId)
    })

    await expect(
      facade.createStagedImageVersion({
        createdById: Fixture.sampleUserId,
        ownerEntityType: EntityTypeEnum.Story,
        ownerEntityId: Fixture.sampleImageId,
        role: ImageRoleEnum.Cover,
        mimeType: 'image/png',
        size: 100,
        base64: 'data:image/png;base64,AAA'
      })
    ).resolves.toMatchObject({
      imageId: Fixture.sampleImageId,
      stagedVersionId: Fixture.sampleImageVersionId
    })
  })

  it('propagates createStagedImageVersion use case rejection', async () => {
    const { createStagedImageVersionUseCase, facade } = setup()
    createStagedImageVersionUseCase.execute.mockRejectedValue(new Error('create failed'))

    await expect(
      facade.createStagedImageVersion({
        createdById: Fixture.sampleUserId,
        ownerEntityType: EntityTypeEnum.Story,
        ownerEntityId: Fixture.sampleImageId,
        role: ImageRoleEnum.Cover,
        mimeType: 'image/png',
        size: 100,
        base64: 'data:image/png;base64,AAA'
      })
    ).rejects.toThrow('create failed')
  })

  it('resolves promoteImageVersion via success callback', async () => {
    const { promoteImageVersionUseCase, facade } = setup()
    promoteImageVersionUseCase.execute.mockImplementation(async (input) => {
      input.imagePromoted()
    })

    await expect(
      facade.promoteImageVersion({
        promotedById: Fixture.sampleUserId,
        imageId: Fixture.sampleImageId,
        stagedVersionId: Fixture.sampleImageVersionId
      })
    ).resolves.toBeUndefined()
  })

  it('propagates promoteImageVersion use case rejection', async () => {
    const { promoteImageVersionUseCase, facade } = setup()
    promoteImageVersionUseCase.execute.mockRejectedValue(new Error('promote failed'))

    await expect(
      facade.promoteImageVersion({
        promotedById: Fixture.sampleUserId,
        imageId: Fixture.sampleImageId,
        stagedVersionId: Fixture.sampleImageVersionId
      })
    ).rejects.toThrow('promote failed')
  })

  it('resolves deleteImage via success callback', async () => {
    const { deleteImageUseCase, facade } = setup()
    deleteImageUseCase.execute.mockImplementation(async (input) => {
      input.imageDeleted()
    })

    await expect(
      facade.deleteImage({
        deletedById: Fixture.sampleUserId,
        imageId: Fixture.sampleImageId
      })
    ).resolves.toBeUndefined()
  })
})
