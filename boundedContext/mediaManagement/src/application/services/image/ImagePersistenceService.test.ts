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
})
