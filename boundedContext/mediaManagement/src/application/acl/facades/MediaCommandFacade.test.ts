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

  it('propagates deleteImage use case rejection', async () => {
    const { deleteImageUseCase, facade } = setup()
    deleteImageUseCase.execute.mockRejectedValue(new Error('delete failed'))

    await expect(
      facade.deleteImage({
        deletedById: Fixture.sampleUserId,
        imageId: Fixture.sampleImageId
      })
    ).rejects.toThrow('delete failed')
  })

  it('prepareStagedImageFile maps command through factory and persistence to contract', async () => {
    const { imagePersistenceService, facade } = setup()
    const command = {
      createdById: Fixture.sampleUserId,
      ownerEntityType: EntityTypeEnum.Story,
      ownerEntityId: Fixture.sampleImageId,
      role: ImageRoleEnum.Cover,
      mimeType: 'image/png',
      size: 100,
      base64: 'data:image/png;base64,AAA'
    }

    const result = await facade.prepareStagedImageFile(command)

    expect(imagePersistenceService.prepareStagedImageFile).toHaveBeenCalledTimes(1)
    expect(result).toStrictEqual({
      imageId: Fixture.sampleImageId,
      stagedVersionId: Fixture.sampleImageVersionId,
      storageKey: Fixture.sampleStagedImageStorageKey,
      mimeType: 'image/png',
      size: 100,
      createdById: Fixture.sampleUserId
    })
  })

  it('registerPreparedStagedImageFileRollbackCleanup delegates to persistence service', async () => {
    const { imagePersistenceService, facade } = setup()
    const prepared = {
      imageId: Fixture.sampleImageId,
      stagedVersionId: Fixture.sampleImageVersionId,
      storageKey: Fixture.sampleStagedImageStorageKey,
      mimeType: 'image/png',
      size: 100,
      createdById: Fixture.sampleUserId
    }

    await facade.registerPreparedStagedImageFileRollbackCleanup(prepared)

    expect(imagePersistenceService.registerPreparedStagedImageFileRollbackCleanup).toHaveBeenCalledWith(prepared)
  })

  it('saveStagedImageMetadata maps prepared contract and persists staged metadata', async () => {
    const { imagePersistenceService, facade } = setup()
    const prepared = {
      imageId: Fixture.sampleImageId,
      stagedVersionId: Fixture.sampleImageVersionId,
      storageKey: Fixture.sampleStagedImageStorageKey,
      mimeType: 'image/png',
      size: 100,
      createdById: Fixture.sampleUserId
    }

    await facade.saveStagedImageMetadata(prepared)

    expect(imagePersistenceService.saveStagedImageMetadata).toHaveBeenCalledTimes(1)
  })
})
