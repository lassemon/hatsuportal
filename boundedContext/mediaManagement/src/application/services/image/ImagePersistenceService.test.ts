import { describe, expect, it, vi } from 'vitest'
import { EntityTypeEnum, ImageRoleEnum } from '@hatsuportal/common'
import { DataPersistenceError } from '@hatsuportal/platform'
import { NonEmptyString } from '@hatsuportal/shared-kernel'
import { StorageKeyGenerator } from '../../../infrastructure'
import { ImagePersistenceService } from './ImagePersistenceService'
import { suppressExpectedConsoleError } from '../../../__test__/support/suppressExpectedConsoleError'
import { ImageId, ImageVersionId, StagedImage } from '../../../domain'
import * as Fixture from '../../../__test__/testFactory'
import { StagedImageFactory } from '../../factories/StagedImageFactory'
import { ImageApplicationMapper } from '../../mappers/ImageApplicationMapper'

describe('ImagePersistenceService', () => {
  suppressExpectedConsoleError()
  const setup = () => {
    const imageRepository = Fixture.imageRepositoryMock()
    const imageFileService = Fixture.imageFileServiceMock()
    const imageStorageService = Fixture.imageStorageServiceMock()
    const storageKeyGenerator = new StorageKeyGenerator()
    const transactionContext = Fixture.transactionContextMock()
    const unitOfWork = Fixture.unitOfWorkMock(Fixture.domainEventServiceMock())
    const imageApplicationMapper = new ImageApplicationMapper()
    const service = new ImagePersistenceService(
      imageRepository,
      imageFileService,
      imageStorageService,
      storageKeyGenerator,
      transactionContext,
      3,
      unitOfWork,
      imageApplicationMapper
    )
    return { imageRepository, imageFileService, imageStorageService, transactionContext, unitOfWork, service }
  }

  it('prepares staged image successfully', async () => {
    const { imageStorageService, service } = setup()
    const staged = Fixture.stagedImageMock()

    await expect(service.prepareStagedImageFile(staged)).resolves.toEqual({
      imageId: staged.imageId.value,
      stagedVersionId: staged.id.value,
      storageKey: staged.storageKey.value,
      mimeType: staged.mimeType.value,
      size: staged.size.value,
      createdById: staged.createdById.value
    })
    expect(imageStorageService.storeImageBuffer).toHaveBeenCalledTimes(1)
  })

  it('wraps storage failures during prepare as DataPersistenceError', async () => {
    const { imageStorageService, service } = setup()
    imageStorageService.storeImageBuffer.mockRejectedValue(new Error('storage failed'))

    await expect(service.prepareStagedImageFile(Fixture.stagedImageMock())).rejects.toBeInstanceOf(DataPersistenceError)
    expect(imageStorageService.deleteImage).not.toHaveBeenCalled()
  })

  it('wraps validation failures before storage as DataPersistenceError', async () => {
    const { imageFileService, imageStorageService, service } = setup()
    imageFileService.validateMimeType = vi.fn().mockRejectedValue(new Error('invalid mime'))

    await expect(service.prepareStagedImageFile(Fixture.stagedImageMock())).rejects.toBeInstanceOf(DataPersistenceError)
    expect(imageStorageService.storeImageBuffer).not.toHaveBeenCalled()
  })

  it('inserts the passed StagedImage without reconstructing from DTO fields', async () => {
    const { imageRepository, service } = setup()
    const stagedImage = Fixture.stagedImageMock()
    imageRepository.insertStaged.mockResolvedValue({
      imageId: stagedImage.imageId,
      stagedVersionId: stagedImage.id
    })

    await expect(service.saveStagedImageMetadata(stagedImage)).resolves.toEqual({
      imageId: stagedImage.imageId,
      stagedVersionId: stagedImage.id
    })
    expect(imageRepository.insertStaged).toHaveBeenCalledWith(stagedImage)
  })

  it('promotes staged version through prepare, commit and finalize steps', async () => {
    const { imageRepository, imageStorageService, service } = setup()
    const imageId = new ImageId(Fixture.sampleImageId)
    const stagedVersionId = new ImageVersionId(Fixture.sampleImageVersionId)
    const stagedMetadata = {
      ...Fixture.imageMetadataDTO(),
      versionId: Fixture.sampleImageVersionId,
      currentVersionPointer: null,
      storageKey: Fixture.sampleStagedImageStorageKeyWithVersionId,
      isStaged: true,
      isCurrent: false
    }
    imageRepository.findByIdAndVersionId.mockResolvedValue(stagedMetadata)
    imageRepository.findPromotionLockForUpdate.mockResolvedValue({
      staged: stagedMetadata,
      publishedCurrent: null
    })

    await expect(service.promoteStagedVersion(imageId, stagedVersionId)).resolves.toBe('promoted')

    expect(imageStorageService.copyImage).toHaveBeenCalledTimes(1)
    expect(imageRepository.savePromotedImage).toHaveBeenCalledTimes(1)
    expect(imageStorageService.deleteImage).toHaveBeenCalledWith(new NonEmptyString(Fixture.sampleStagedImageStorageKeyWithVersionId))
  })

  it('promotes jpeg cover-replace through storage key round-trip without mime mismatch', async () => {
    const { imageRepository, imageStorageService, service } = setup()
    const imageId = new ImageId(Fixture.sampleImageId)
    const stagedVersionId = new ImageVersionId(Fixture.sampleImageVersionId)
    const stagedStorageKey = `staged_${EntityTypeEnum.Story}_${ImageRoleEnum.Cover}_${Fixture.sampleImageId}_${Fixture.sampleImageVersionId}_${Fixture.sampleUserId}.jpg`
    const stagedMetadata = {
      ...Fixture.imageMetadataDTO(),
      versionId: Fixture.sampleImageVersionId,
      currentVersionPointer: Fixture.sampleCurrentVersionId,
      mimeType: 'image/jpeg',
      storageKey: stagedStorageKey,
      isStaged: true,
      isCurrent: false
    }
    imageRepository.findByIdAndVersionId.mockResolvedValue(stagedMetadata)
    imageRepository.findPromotionLockForUpdate.mockResolvedValue({
      staged: stagedMetadata,
      publishedCurrent: {
        id: Fixture.sampleCurrentVersionId,
        imageId: Fixture.sampleImageId,
        storageKey: Fixture.sampleImageStorageKey,
        mimeType: 'image/png',
        size: 100,
        isCurrent: true,
        isStaged: false,
        createdAt: Fixture.imageMetadataDTO().updatedAt
      }
    })

    await expect(service.promoteStagedVersion(imageId, stagedVersionId)).resolves.toBe('promoted')

    expect(imageStorageService.copyImage).toHaveBeenCalledTimes(1)
    expect(imageRepository.savePromotedImage).toHaveBeenCalledTimes(1)
  })

  it('deleteImageMetadata does not delete files from storage', async () => {
    const { imageRepository, imageStorageService, service } = setup()
    const image = Fixture.imageMock()
    imageRepository.delete.mockResolvedValue([Fixture.sampleImageStorageKey])

    await expect(service.deleteImageMetadata(image)).resolves.toEqual([Fixture.sampleImageStorageKey])
    expect(imageStorageService.deleteImage).not.toHaveBeenCalled()
  })

  it('deleteImageFiles removes storage objects', async () => {
    const { imageStorageService, service } = setup()

    await service.deleteImageFiles([Fixture.sampleImageStorageKey])

    expect(imageStorageService.deleteImage).toHaveBeenCalledWith(new NonEmptyString(Fixture.sampleImageStorageKey))
  })

  it('pruneOldVersionMetadata and deletePrunedVersionFiles run as separate steps', async () => {
    const { imageRepository, imageStorageService, service } = setup()
    imageRepository.pruneOldVersions.mockResolvedValue(['pruned-key'])

    const prunedKeys = await service.pruneOldVersionMetadata(new ImageId(Fixture.sampleImageId))
    expect(prunedKeys).toEqual(['pruned-key'])
    expect(imageStorageService.deleteImage).not.toHaveBeenCalled()

    await service.deletePrunedVersionFiles(prunedKeys)
    expect(imageStorageService.deleteImage).toHaveBeenCalledWith(new NonEmptyString('pruned-key'))
  })

  it('fromPreparedDTO adapter produces external-storage StagedImage for metadata save', async () => {
    const factory = new StagedImageFactory(new StorageKeyGenerator())
    const prepared = await setup().service.prepareStagedImageFile(Fixture.stagedImageMock())
    const staged = factory.fromPreparedDTO(prepared)

    expect(staged).toBeInstanceOf(StagedImage)
    expect(staged.base64.isExternalStorageReference()).toBe(true)
  })

  it('cleans up storage when prepare fails after successful upload', async () => {
    const { imageStorageService, service } = setup()
    const staged = Fixture.stagedImageMock()
    let uploadComplete = false
    imageStorageService.storeImageBuffer.mockImplementation(async () => {
      uploadComplete = true
    })
    const originalSize = staged.size
    vi.spyOn(staged, 'size', 'get').mockImplementation(() => {
      if (uploadComplete) throw new Error('fail building return')
      return originalSize
    })

    await expect(service.prepareStagedImageFile(staged)).rejects.toBeInstanceOf(DataPersistenceError)
    expect(imageStorageService.deleteImage).toHaveBeenCalledWith(staged.storageKey)
  })

  it('registers rollback cleanup for prepared staged image file', async () => {
    const { imageStorageService, transactionContext, service } = setup()
    const prepared = {
      imageId: Fixture.sampleImageId,
      stagedVersionId: Fixture.sampleImageVersionId,
      storageKey: Fixture.sampleStagedImageStorageKeyWithVersionId,
      mimeType: 'image/png',
      size: 100,
      createdById: Fixture.sampleUserId
    }

    service.registerPreparedStagedImageFileRollbackCleanup(prepared)

    expect(transactionContext.requireActiveScope).toHaveBeenCalledTimes(1)
    expect(transactionContext.registerAfterRollback).toHaveBeenCalledTimes(1)

    const rollbackCallback = vi.mocked(transactionContext.registerAfterRollback).mock.calls[0][0]
    await rollbackCallback()
    expect(imageStorageService.deleteImage).toHaveBeenCalledWith(new NonEmptyString(prepared.storageKey))
  })

  it('throws when saveStagedImageMetadata is called outside an active transaction', async () => {
    const { transactionContext, service } = setup()
    vi.mocked(transactionContext.requireActiveScope).mockImplementation(() => {
      throw new Error('No active transaction scope')
    })

    await expect(service.saveStagedImageMetadata(Fixture.stagedImageMock())).rejects.toThrow('No active transaction scope')
  })

  it('returns already-current when version is already promoted at prepare time', async () => {
    const { imageRepository, imageStorageService, service } = setup()
    const imageId = new ImageId(Fixture.sampleImageId)
    const stagedVersionId = new ImageVersionId(Fixture.sampleImageVersionId)
    imageRepository.findByIdAndVersionId.mockResolvedValue({
      ...Fixture.imageMetadataDTO(),
      isStaged: false,
      isCurrent: true
    })

    await expect(service.promoteStagedVersion(imageId, stagedVersionId)).resolves.toBe('already-current')
    expect(imageStorageService.copyImage).not.toHaveBeenCalled()
    expect(imageRepository.savePromotedImage).not.toHaveBeenCalled()
  })

  it('throws when promoting a missing image version', async () => {
    const { imageRepository, service } = setup()
    imageRepository.findByIdAndVersionId.mockResolvedValue(null)

    await expect(
      service.promoteStagedVersion(new ImageId(Fixture.sampleImageId), new ImageVersionId(Fixture.sampleImageVersionId))
    ).rejects.toBeInstanceOf(DataPersistenceError)
  })

  it('throws when promoting a non-staged version', async () => {
    const { imageRepository, service } = setup()
    imageRepository.findByIdAndVersionId.mockResolvedValue({
      ...Fixture.imageMetadataDTO(),
      isStaged: false,
      isCurrent: false
    })

    await expect(
      service.promoteStagedVersion(new ImageId(Fixture.sampleImageId), new ImageVersionId(Fixture.sampleImageVersionId))
    ).rejects.toBeInstanceOf(DataPersistenceError)
  })

  it('returns already-current when copy fails but version was promoted concurrently', async () => {
    const { imageRepository, imageStorageService, service } = setup()
    const imageId = new ImageId(Fixture.sampleImageId)
    const stagedVersionId = new ImageVersionId(Fixture.sampleImageVersionId)
    const stagedMetadata = {
      ...Fixture.imageMetadataDTO(),
      versionId: Fixture.sampleImageVersionId,
      storageKey: Fixture.sampleStagedImageStorageKeyWithVersionId,
      isStaged: true,
      isCurrent: false
    }
    imageRepository.findByIdAndVersionId
      .mockResolvedValueOnce(stagedMetadata)
      .mockResolvedValueOnce({ ...stagedMetadata, isStaged: false, isCurrent: true })
    imageStorageService.copyImage.mockRejectedValue(new Error('copy failed'))

    await expect(service.promoteStagedVersion(imageId, stagedVersionId)).resolves.toBe('already-current')
    expect(imageRepository.savePromotedImage).not.toHaveBeenCalled()
  })

  it('throws when copy fails and version is still staged', async () => {
    const { imageRepository, imageStorageService, service } = setup()
    const stagedMetadata = {
      ...Fixture.imageMetadataDTO(),
      storageKey: Fixture.sampleStagedImageStorageKeyWithVersionId,
      isStaged: true,
      isCurrent: false
    }
    imageRepository.findByIdAndVersionId.mockResolvedValue(stagedMetadata)
    imageStorageService.copyImage.mockRejectedValue(new Error('copy failed'))

    await expect(
      service.promoteStagedVersion(new ImageId(Fixture.sampleImageId), new ImageVersionId(Fixture.sampleImageVersionId))
    ).rejects.toBeInstanceOf(DataPersistenceError)
  })

  it('returns already-current when promotion lock shows version is already current', async () => {
    const { imageRepository, imageStorageService, service } = setup()
    const imageId = new ImageId(Fixture.sampleImageId)
    const stagedVersionId = new ImageVersionId(Fixture.sampleImageVersionId)
    const stagedMetadata = {
      ...Fixture.imageMetadataDTO(),
      versionId: Fixture.sampleImageVersionId,
      storageKey: Fixture.sampleStagedImageStorageKeyWithVersionId,
      isStaged: true,
      isCurrent: false
    }
    imageRepository.findByIdAndVersionId.mockResolvedValue(stagedMetadata)
    imageRepository.findPromotionLockForUpdate.mockResolvedValue({
      staged: { ...stagedMetadata, isStaged: false, isCurrent: true },
      publishedCurrent: null
    })

    await expect(service.promoteStagedVersion(imageId, stagedVersionId)).resolves.toBe('already-current')
    expect(imageRepository.savePromotedImage).not.toHaveBeenCalled()
    expect(imageStorageService.deleteImage).toHaveBeenCalled()
  })

  it('throws when promotion lock is missing during commit', async () => {
    const { imageRepository, service } = setup()
    const stagedMetadata = {
      ...Fixture.imageMetadataDTO(),
      storageKey: Fixture.sampleStagedImageStorageKeyWithVersionId,
      isStaged: true,
      isCurrent: false
    }
    imageRepository.findByIdAndVersionId.mockResolvedValue(stagedMetadata)
    imageRepository.findPromotionLockForUpdate.mockResolvedValue(null)

    await expect(
      service.promoteStagedVersion(new ImageId(Fixture.sampleImageId), new ImageVersionId(Fixture.sampleImageVersionId))
    ).rejects.toBeInstanceOf(DataPersistenceError)
  })

  it('deleteImageFiles removes all storage keys', async () => {
    const { imageStorageService, service } = setup()

    await service.deleteImageFiles([Fixture.sampleImageStorageKey, 'other-key'])

    expect(imageStorageService.deleteImage).toHaveBeenCalledTimes(2)
    expect(imageStorageService.deleteImage).toHaveBeenCalledWith(new NonEmptyString(Fixture.sampleImageStorageKey))
    expect(imageStorageService.deleteImage).toHaveBeenCalledWith(new NonEmptyString('other-key'))
  })

  it('continues deleteImageFiles when individual deletions fail', async () => {
    const { imageStorageService, service } = setup()
    imageStorageService.deleteImage.mockRejectedValueOnce(new Error('delete failed'))

    await expect(service.deleteImageFiles([Fixture.sampleImageStorageKey, 'other-key'])).resolves.toBeUndefined()
    expect(imageStorageService.deleteImage).toHaveBeenCalledTimes(2)
  })
})
