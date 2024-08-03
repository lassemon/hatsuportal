import { ScenarioBase } from './ScenarioBase'
import * as Fixture from '../testFactory'
import { vi, expect } from 'vitest'
import { EntityLoadResult } from '@hatsuportal/platform'
import { UserLoadError } from '../../application/acl/userManagement/errors/UserLoadError'
import { CurrentImage, StagedImage, ImageCreatedEvent, ImageDeletedEvent, ImageUpdatedEvent, ImageVersionId } from '../../domain'
import { IImageRepository } from '../../application/repositories/IImageRepository'
import { ImageApplicationMapper } from '../../application/mappers/ImageApplicationMapper'
import { StorageKeyGenerator } from '../../infrastructure'
import { IImagePersistenceService } from '../../application/services/image/ImagePersistenceService'
import { IImageLookupService } from '../../application/services/image/ImageLookupService'
import { StagedImageFactory } from '../../application/factories/StagedImageFactory'

export const ImageDomainEvents = {
  ImageCreatedEvent,
  ImageUpdatedEvent,
  ImageDeletedEvent
}

export abstract class ImageScenarioBase<INPUT, CALLBACKS extends string> extends ScenarioBase<INPUT, CALLBACKS, typeof ImageDomainEvents> {
  protected readonly imageRepository = Fixture.imageRepositoryMock()
  protected readonly imageLookupService = Fixture.imageLookupServiceMock()
  protected readonly imagePersistenceService = Fixture.imagePersistenceServiceMock()
  protected readonly imageMapper = new ImageApplicationMapper()
  protected readonly storageKeyGenerator = new StorageKeyGenerator()
  protected readonly stagedImageFactory = new StagedImageFactory(new StorageKeyGenerator())

  protected constructor(callbackNames: CALLBACKS[]) {
    super(callbackNames, ImageDomainEvents)
    const toPreparedStagedImage = (image: StagedImage) => ({
      imageId: image.imageId.value,
      stagedVersionId: image.id.value,
      storageKey: image.storageKey.value,
      mimeType: image.mimeType.value,
      size: image.size.value,
      createdById: image.createdById.value
    })

    this.imageRepository.findById = vi.fn().mockResolvedValue(Fixture.imageMock())
    this.imageLookupService.findById = vi.fn().mockResolvedValue(Fixture.imageMock())
    this.imageRepository.findByIdAndVersionId = vi.fn().mockResolvedValue(Fixture.imageMetadataDTO())
    this.imageLookupService.findByIdAndVersionId = vi.fn().mockResolvedValue(Fixture.imageMock())
    this.imageRepository.insertStaged = vi
      .fn()
      .mockImplementation((image: StagedImage) => ({ imageId: image.imageId, stagedVersionId: image.id }))
    this.imageRepository.insertCurrent = vi.fn().mockImplementation((image: CurrentImage) => {
      const imageMock = Fixture.imageMock({
        id: image.id,
        createdAt: image.createdAt,
        createdById: image.createdById,
        updatedAt: image.updatedAt
      })
      imageMock.addDomainEvent(
        new ImageCreatedEvent({
          id: imageMock.id.value,
          createdById: imageMock.createdById.value,
          createdAt: imageMock.createdAt.value
        })
      )
      return imageMock
    })
    this.imagePersistenceService.prepareStagedImageFile = vi.fn().mockImplementation((image: StagedImage) => toPreparedStagedImage(image))
    this.imagePersistenceService.registerPreparedStagedImageFileRollbackCleanup = vi.fn()
    this.imagePersistenceService.saveStagedImageMetadata = vi
      .fn()
      .mockImplementation((stagedImage: StagedImage) => ({
        imageId: stagedImage.imageId,
        stagedVersionId: stagedImage.id
      }))
    this.imagePersistenceService.promoteStagedVersion = vi.fn().mockResolvedValue('promoted')
    this.imagePersistenceService.deleteImageMetadata = vi.fn().mockResolvedValue([Fixture.sampleImageStorageKey])
    this.imagePersistenceService.deleteImageFiles = vi.fn().mockResolvedValue(undefined)
    this.imagePersistenceService.pruneOldVersionMetadata = vi.fn().mockResolvedValue([])
    this.imagePersistenceService.deletePrunedVersionFiles = vi.fn().mockResolvedValue(undefined)
    this.imageRepository.delete = vi.fn().mockResolvedValue([Fixture.sampleImageStorageKey])
  }

  // ───────────────────────────────────────────────────────────────────
  // GIVEN helpers (all fluent, return `this`)
  // ───────────────────────────────────────────────────────────────────
  withExistingImage(image = Fixture.imageMock()) {
    this.imageRepository.findById = vi.fn().mockResolvedValue(image)
    this.imageRepository.findByIdAndVersionId = vi.fn().mockResolvedValue(Fixture.imageMetadataDTO())
    this.imageRepository.insertStaged = vi.fn().mockResolvedValue(image)
    this.imageRepository.insertCurrent = vi.fn().mockResolvedValue(image)
    this.imageRepository.delete = vi.fn().mockResolvedValue([Fixture.sampleImageStorageKey])

    this.imageLookupService.findById = vi.fn().mockResolvedValue(image)
    this.imageLookupService.findByIdAndVersionId = vi.fn().mockResolvedValue(image)
    this.imagePersistenceService.prepareStagedImageFile = vi.fn().mockImplementation((stagedImage: StagedImage) => ({
      imageId: stagedImage.imageId.value,
      stagedVersionId: stagedImage.id.value,
      storageKey: stagedImage.storageKey.value,
      mimeType: stagedImage.mimeType.value,
      size: stagedImage.size.value,
      createdById: stagedImage.createdById.value
    }))
    this.imagePersistenceService.registerPreparedStagedImageFileRollbackCleanup = vi.fn()
    this.imagePersistenceService.saveStagedImageMetadata = vi.fn().mockResolvedValue({
      imageId: image.id,
      stagedVersionId: new ImageVersionId(Fixture.sampleImageVersionId)
    })
    this.imagePersistenceService.promoteStagedVersion = vi.fn().mockResolvedValue('promoted')
    this.imagePersistenceService.deleteImageMetadata = vi.fn().mockResolvedValue([Fixture.sampleImageStorageKey])
    this.imagePersistenceService.deleteImageFiles = vi.fn().mockResolvedValue(undefined)
    this.imagePersistenceService.pruneOldVersionMetadata = vi.fn().mockResolvedValue([])
    this.imagePersistenceService.deletePrunedVersionFiles = vi.fn().mockResolvedValue(undefined)
    return this
  }

  withoutExistingImage() {
    this.imageRepository.findById = vi.fn().mockResolvedValue(null)
    this.imageRepository.findByIdAndVersionId = vi.fn().mockResolvedValue(null)
    this.imageRepository.insertStaged = vi.fn().mockResolvedValue(null)
    this.imageRepository.insertCurrent = vi.fn().mockResolvedValue(null)
    this.imageRepository.delete = vi.fn().mockResolvedValue(null)

    this.imageLookupService.findById = vi.fn().mockResolvedValue(null)
    this.imageLookupService.findByIdAndVersionId = vi.fn().mockResolvedValue(null)
    this.imagePersistenceService.prepareStagedImageFile = vi.fn().mockResolvedValue(null)
    this.imagePersistenceService.registerPreparedStagedImageFileRollbackCleanup = vi.fn()
    this.imagePersistenceService.saveStagedImageMetadata = vi.fn().mockResolvedValue(null)
    this.imagePersistenceService.deleteImageMetadata = vi.fn().mockResolvedValue(null)
    this.imagePersistenceService.deleteImageFiles = vi.fn().mockResolvedValue(null)
    this.imagePersistenceService.pruneOldVersionMetadata = vi.fn().mockResolvedValue(null)
    this.imagePersistenceService.deletePrunedVersionFiles = vi.fn().mockResolvedValue(null)
    return this
  }

  repositoryWillReject(methods: (keyof IImageRepository)[], error: Error = new Error('Repository failure')) {
    methods.forEach((method) => {
      // @ts-expect-error – the mock infra object definitely has this key
      this.imageRepository[method] = vi.fn().mockRejectedValue(error)
    })
    return this
  }

  lookupServiceWillReject(methods: (keyof IImageLookupService)[], error: Error = new Error('Lookup service failure')) {
    methods.forEach((method) => {
      // @ts-expect-error – the mock infra object definitely has this key
      this.imageLookupService[method] = vi.fn().mockRejectedValue(error)
    })
    return this
  }

  persistenceServiceWillReject(methods: (keyof IImagePersistenceService)[], error: Error = new Error('Persistence service failure')) {
    methods.forEach((method) => {
      // @ts-expect-error – the mock infra object definitely has this key
      this.imagePersistenceService[method] = vi.fn().mockRejectedValue(error)
    })
    return this
  }

  creatorLoadWillFail(userId: string, error: Error = new Error('Creator not found')) {
    this.userGateway.getUserById = vi
      .fn()
      .mockResolvedValue(EntityLoadResult.failure(new UserLoadError({ userId, error })))
    return this
  }

  thenRepositoryCalledTimes(method: keyof IImageRepository, times: number) {
    this.ensureExecutionCompleted()
    this.ensureNoUnexpectedError()
    expect(this.imageRepository[method]).toHaveBeenCalledTimes(times)
    return this
  }
}
