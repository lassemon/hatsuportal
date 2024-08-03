import { vi, Mocked } from 'vitest'
import { unixtimeNow, UserRoleEnum, EntityTypeEnum, ImageRoleEnum } from '@hatsuportal/common'
import { IDomainEventDispatcher, IDomainEventHolder } from '@hatsuportal/shared-kernel'
import { IUnitOfWork, IDomainEventService, ITransactionContext, ITransactionScope } from '@hatsuportal/platform'

import { ImageMetadataDatabaseSchema } from '../infrastructure/schemas/ImageMetadataDatabaseSchema'
import { IImageRepository } from '../application/repositories/IImageRepository'
import { EntityLoadResult } from '@hatsuportal/platform'
import { IUserGateway } from '../application/acl/userManagement/IUserGateway'
import { UserReadModelDTO } from '../application/dtos/UserReadModelDTO'
import { ImageDTO } from '../application/dtos/ImageDTO'
import { ImageWithRelationsDTO } from '../application/dtos/ImageWithRelationsDTO'
import {
  Base64Image,
  FileSize,
  ImageCreatorId,
  ImageId,
  ImageVersionId,
  MimeType,
  ImageStorageKey,
  ImageVersionProps,
  ImageVersion,
  Image,
  CurrentImage,
  StagedImage,
  ImageProps
} from '../domain'
import { IMediaAuthorizationService } from '../application/authorization/services/MediaAuthorizationService'
import { cloneDeep } from 'lodash'
import { CreatedAtTimestamp, UnixTimestamp } from '@hatsuportal/shared-kernel'

import { base64Payload } from './support/base64Payload'
import { ImageResponse } from '@hatsuportal/contracts'
import { IImageProcessingService } from '../application/services/IImageProcessingService'
import { IImageFileService } from '../application/services/IImageFileService'
import { IImageStorageService } from '../application/services/IImageStorageService'
import { IImageLookupService } from '../application/services/image/ImageLookupService'
import { IImagePersistenceService } from '../application/services/image/ImagePersistenceService'
import { ImageMetadataDTO } from '../application/dtos/ImageMetadataDTO'
import { ImageVersionMetadataDTO } from '../application/dtos/ImageVersionMetadataDTO'

const createdAt = unixtimeNow() - 3000
const updatedAt = createdAt + 1500

/** Lightweight data URL for default unit-test fixtures (avoids decoding the large sample PNG on every mock). */
export const sampleBase64DataUrl = 'data:image/png;base64,AAAA'

let cachedDefaultBase64Image: Base64Image | undefined

const defaultBase64Image = (): Base64Image => {
  if (!cachedDefaultBase64Image) {
    cachedDefaultBase64Image = Base64Image.create(sampleBase64DataUrl)
  }
  return cachedDefaultBase64Image
}

let cachedDefaultImageMock: Image | undefined

/** Shared default image for repository/service mocks that only need a placeholder aggregate. */
export const defaultImageMock = (): Image => {
  if (!cachedDefaultImageMock) {
    cachedDefaultImageMock = buildImageMock()
  }
  return cachedDefaultImageMock
}

export const sampleUserId = 'test1b19-user-4792-a2f0-f95ccab82d92'
export const sampleNonAuthorUserId = 'test2b19-user-4792-a2f0-f95ccab82d93'
export const sampleImageId = 'test1b19-entity-4792-a2f0-f95ccab82d92'
export const sampleImageVersionId = 'test1b19-version-4792-a2f0-f95ccab82d92'
export const sampleCurrentVersionId = 'test2b19-version-4792-a2f0-f95ccab82d91'
export const sampleImageStorageKey = `${EntityTypeEnum.Story}_${ImageRoleEnum.Cover}_${sampleImageId}_version-id_${sampleUserId}.png`
export const sampleStagedImageStorageKey = `staged_${EntityTypeEnum.Story}_${ImageRoleEnum.Cover}_${sampleImageId}_version-id_${sampleUserId}.png`
export const sampleStagedImageStorageKeyWithVersionId = `staged_${EntityTypeEnum.Story}_${ImageRoleEnum.Cover}_${sampleImageId}_${sampleImageVersionId}_${sampleUserId}.png`

export const imageDTOMock = (): ImageDTO => {
  return cloneDeep({
    id: sampleImageId,
    storageKey: sampleImageStorageKey,
    mimeType: 'image/png',
    size: 100,
    currentVersionId: sampleImageVersionId,
    isCurrent: true,
    isStaged: false,
    createdById: sampleUserId,
    base64: sampleBase64DataUrl,
    createdAt,
    updatedAt
  })
}

export const imageWithRelationsDTOMock = (): ImageWithRelationsDTO => {
  return {
    ...imageDTOMock(),
    createdByName: userReadModelDTOMock().name
  }
}

const imageVersionProps = (overrides: Partial<ImageVersionProps> = {}): ImageVersionProps => {
  return cloneDeep({
    id: new ImageVersionId(sampleImageVersionId),
    imageId: new ImageId(sampleImageId),
    mimeType: new MimeType('image/png'),
    size: new FileSize(100),
    base64: defaultBase64Image(),
    storageKey: ImageStorageKey.fromString(sampleImageStorageKey),
    isCurrent: true,
    isStaged: false,
    createdById: new ImageCreatorId(sampleUserId),
    createdAt: new CreatedAtTimestamp(updatedAt),
    ...overrides
  })
}

export const imageVersionMock = (overrides: Partial<ImageVersionProps> = {}): ImageVersion => {
  return ImageVersion.reconstruct({
    ...imageVersionProps(),
    ...overrides
  })
}

export const imageProps = (overrides: Partial<ImageProps> = {}, versionOverrides: Partial<ImageVersionProps> = {}): ImageProps => {
  return {
    id: new ImageId(sampleImageId),
    createdAt: new CreatedAtTimestamp(createdAt),
    createdById: new ImageCreatorId(sampleUserId),
    currentVersionId: new ImageVersionId(sampleImageVersionId),
    versions: [imageVersionProps(versionOverrides)],
    updatedAt: new UnixTimestamp(updatedAt),
    ...overrides
  }
}

const buildImageMock = (overrides: Partial<ImageProps> = {}, versionOverrides: Partial<ImageVersionProps> = {}): Image => {
  const versionMock = imageVersionMock({
    ...versionOverrides,
    ...(overrides.id || versionOverrides.imageId ? { imageId: overrides.id ? overrides.id : versionOverrides.imageId } : {})
  })

  return Image.reconstruct({
    id: overrides.id ?? new ImageId(sampleImageId),
    createdAt: overrides.createdAt ?? new CreatedAtTimestamp(createdAt),
    createdById: overrides.createdById ?? new ImageCreatorId(sampleUserId),
    currentVersionId: overrides.currentVersionId !== undefined ? overrides.currentVersionId : versionMock.id,
    versions: [versionMock],
    updatedAt: overrides.updatedAt ?? new UnixTimestamp(updatedAt)
  })
}

export const imageMock = (overrides: Partial<ImageProps> = {}, versionOverrides: Partial<ImageVersionProps> = {}): Image => {
  return buildImageMock(overrides, versionOverrides)
}

export const currentImageMock = (overrides: Partial<ImageProps> = {}): CurrentImage => {
  return CurrentImage.fromImageEnsuringCurrentVersion(imageMock(overrides, { isCurrent: true }))
}

export const stagedImageMock = (overrides: Partial<ImageProps> = {}): StagedImage => {
  return StagedImage.fromImageEnsuringStagedVersion(
    imageMock(
      { ...overrides, currentVersionId: ImageVersionId.NOT_SET, versions: [] },
      { isCurrent: false, isStaged: true, storageKey: ImageStorageKey.fromString(sampleStagedImageStorageKey) }
    ),
    new ImageVersionId(sampleImageVersionId)
  )
}

export const imageWithCurrentAndStagedVersionMock = (): Image => {
  const currentVersionProps: ImageVersionProps = {
    id: new ImageVersionId(sampleCurrentVersionId),
    imageId: new ImageId(sampleImageId),
    mimeType: new MimeType('image/png'),
    size: new FileSize(100),
    base64: defaultBase64Image(),
    storageKey: ImageStorageKey.fromString(sampleImageStorageKey),
    isCurrent: true,
    isStaged: false,
    createdById: new ImageCreatorId(sampleUserId),
    createdAt: new CreatedAtTimestamp(updatedAt)
  }
  const stagedVersionProps: ImageVersionProps = {
    id: new ImageVersionId(sampleImageVersionId),
    imageId: new ImageId(sampleImageId),
    mimeType: new MimeType('image/png'),
    size: new FileSize(100),
    base64: defaultBase64Image(),
    storageKey: ImageStorageKey.fromString(sampleStagedImageStorageKey),
    isCurrent: false,
    isStaged: true,
    createdById: new ImageCreatorId(sampleUserId),
    createdAt: new CreatedAtTimestamp(updatedAt)
  }
  return Image.reconstruct({
    id: new ImageId(sampleImageId),
    createdAt: new CreatedAtTimestamp(createdAt),
    createdById: new ImageCreatorId(sampleUserId),
    currentVersionId: new ImageVersionId(sampleCurrentVersionId),
    versions: [currentVersionProps, stagedVersionProps],
    updatedAt: new UnixTimestamp(updatedAt)
  })
}

export const imageMetadataDatabaseRecord = (): ImageMetadataDatabaseSchema => {
  return {
    id: sampleImageId,
    createdById: sampleUserId,
    createdAt: imageDTOMock().createdAt,
    currentVersionId: sampleImageVersionId, // link to image_versions table
    versionId: sampleImageVersionId, // image_versions table id
    storageKey: imageDTOMock().storageKey,
    mimeType: imageDTOMock().mimeType,
    size: imageDTOMock().size,
    isCurrent: imageDTOMock().isCurrent,
    isStaged: imageDTOMock().isStaged,
    updatedAt: imageDTOMock().updatedAt
  }
}

export const imageMetadataDTO = (): ImageMetadataDTO => {
  return {
    id: sampleImageId,
    versionId: sampleImageVersionId,
    currentVersionPointer: sampleImageVersionId,
    storageKey: imageDTOMock().storageKey,
    mimeType: imageDTOMock().mimeType,
    size: imageDTOMock().size,
    isCurrent: imageDTOMock().isCurrent,
    isStaged: imageDTOMock().isStaged,
    createdById: sampleUserId,
    createdAt: imageDTOMock().createdAt,
    updatedAt: imageDTOMock().updatedAt
  }
}

export const imageVersionMetadataDTO = (): ImageVersionMetadataDTO => ({
  id: sampleImageVersionId,
  imageId: sampleImageId,
  storageKey: sampleStagedImageStorageKey,
  mimeType: 'image/png',
  size: 100,
  isCurrent: false,
  isStaged: true,
  createdAt: imageMetadataDTO().createdAt
})

export const imageFileServiceMock = (): Mocked<IImageFileService> => ({
  convertBase64ImageToBuffer: vi.fn().mockReturnValue(Buffer.from('image')),
  convertBufferToBase64Image: vi.fn().mockReturnValue(sampleBase64DataUrl),
  resizeImageBuffer: vi.fn().mockResolvedValue(Buffer.from('resized')),
  getBufferMimeType: vi.fn().mockResolvedValue('image/png'),
  validateMimeType: vi.fn().mockResolvedValue(new MimeType('image/png'))
})

export const imageLookupServiceMock = (): Mocked<IImageLookupService> => {
  class ImageLookupServiceMock implements IImageLookupService {
    findById = vi.fn().mockResolvedValue(defaultImageMock())
    findByIdAndVersionId = vi.fn().mockResolvedValue(defaultImageMock())
  }
  return new ImageLookupServiceMock()
}

export const transactionContextMock = (): ITransactionContext => ({
  getScope: vi.fn().mockReturnValue(undefined),
  run: async <T>(_scope: ITransactionScope, work: () => Promise<T>) => work(),
  requireActiveScope: vi.fn().mockReturnValue({
    transaction: {},
    eventHolders: new Set(),
    rollbackCallbacks: [],
    expectedUpdatedAtByKey: new Map(),
    state: 'active' as const,
    rollbackOnly: false,
    rollbackError: null
  }),
  registerAfterRollback: vi.fn(),
  addEventHolders: vi.fn(),
  markRollbackOnly: vi.fn(),
  getExpectedUpdatedAt: vi.fn(),
  setExpectedUpdatedAt: vi.fn()
})

export const imagePersistenceServiceMock = (): Mocked<IImagePersistenceService> => {
  class ImagePersistenceServiceMock implements IImagePersistenceService {
    prepareStagedImageFile = vi.fn().mockResolvedValue({
      imageId: sampleImageId,
      stagedVersionId: sampleImageVersionId,
      storageKey: sampleStagedImageStorageKey,
      mimeType: 'image/png',
      size: 100,
      createdById: sampleUserId
    })
    registerPreparedStagedImageFileRollbackCleanup = vi.fn()
    saveStagedImageMetadata = vi.fn().mockResolvedValue({
      imageId: new ImageId(sampleImageId),
      stagedVersionId: new ImageVersionId(sampleImageVersionId)
    })
    promoteStagedVersion = vi.fn().mockResolvedValue('promoted')
    deleteImageMetadata = vi.fn().mockResolvedValue([sampleImageStorageKey])
    deleteImageFiles = vi.fn().mockResolvedValue(undefined)
    pruneOldVersionMetadata = vi.fn().mockResolvedValue([])
    deletePrunedVersionFiles = vi.fn().mockResolvedValue(undefined)
  }
  return new ImagePersistenceServiceMock()
}

export const imageRepositoryMock = (): Mocked<IImageRepository> => {
  class ImageRepositoryMock implements IImageRepository {
    findById = vi.fn().mockResolvedValue(imageMetadataDTO())
    findByIdAndVersionId = vi.fn().mockResolvedValue(imageMetadataDTO())
    findByIdAndVersionIdForUpdate = vi.fn().mockResolvedValue(imageMetadataDTO())
    findPromotionLockForUpdate = vi.fn().mockResolvedValue(null)
    findAllStorageKeys = vi.fn().mockResolvedValue([])
    findAllCleanupCandidates = vi.fn().mockResolvedValue([])
    findStagedStorageKeys = vi.fn().mockResolvedValue([])
    insertStaged = vi.fn().mockResolvedValue(defaultImageMock())
    insertCurrent = vi.fn().mockResolvedValue(defaultImageMock())
    savePromotedImage = vi.fn().mockResolvedValue(undefined)
    rollbackCurrentVersion = vi.fn()
    pruneOldVersions = vi.fn().mockResolvedValue([])
    delete = vi.fn().mockResolvedValue([])
  }
  return new ImageRepositoryMock()
}

export const userReadModelDTOMock = (overrides: Partial<UserReadModelDTO> = {}): UserReadModelDTO => {
  return {
    id: sampleUserId,
    name: 'Test User',
    email: 'test.user@example.com',
    roles: [UserRoleEnum.Admin],
    active: true,
    createdAt: createdAt,
    updatedAt: updatedAt,
    ...overrides
  }
}

export const userGatewayMock = (): Mocked<IUserGateway> => {
  class UserGatewayMock implements IUserGateway {
    getUserById = vi.fn().mockResolvedValue(EntityLoadResult.success(userReadModelDTOMock()))
  }
  return new UserGatewayMock()
}

export const domainEventDispatcherMock = (): Mocked<IDomainEventDispatcher> => {
  return {
    register: vi.fn(),
    dispatch: vi.fn()
  }
}

export const unitOfWorkMock = (domainEventServiceMock: Mocked<IDomainEventService>): IUnitOfWork<ImageId, UnixTimestamp> => {
  class UnitOfWorkMock implements IUnitOfWork<ImageId, UnixTimestamp> {
    execute = async <T extends Array<IDomainEventHolder<ImageId, UnixTimestamp> | null>>(
      work: () => Promise<[...T]>
    ): Promise<[...T]> => {
      const domainEventHolders = await work()

      for (const eventHolder of domainEventHolders) {
        if (eventHolder) {
          for (const event of eventHolder.domainEvents) {
            await domainEventServiceMock.persistToOutbox([event])
          }
        }
      }
      domainEventHolders.forEach((eventHolder) => eventHolder && eventHolder.clearEvents())

      return domainEventHolders
    }
  }

  return new UnitOfWorkMock()
}

export const mediaAuthorizationServiceMock = (): Mocked<IMediaAuthorizationService> => {
  class MediaAuthorizationServiceMock implements IMediaAuthorizationService {
    canCreateImage = vi.fn().mockReturnValue({ allowed: true })
    canUpdateImage = vi.fn().mockReturnValue({ allowed: true })
    canDeleteImage = vi.fn().mockReturnValue({ allowed: true })
  }
  return new MediaAuthorizationServiceMock()
}

export const imageProcessingServiceMock = (): Mocked<IImageProcessingService> => {
  class ImageProcessingService implements Mocked<IImageProcessingService> {
    resizeImage = vi.fn()
    getBufferMimeType = vi.fn()
  }

  return new ImageProcessingService()
}

export const imageStorageServiceMock = (): Mocked<IImageStorageService> => {
  class ImageStorageService implements Mocked<IImageStorageService> {
    storeImageBuffer = vi.fn()
    getImage = vi.fn()
    listAllStorageKeys = vi.fn()
    deleteImage = vi.fn()
    copyImage = vi.fn()
  }

  return new ImageStorageService()
}

export const domainEventServiceMock = (): Mocked<IDomainEventService> => {
  class DomainEventServiceMock implements IDomainEventService {
    persistToOutbox = vi.fn()
  }
  return new DomainEventServiceMock()
}

export const base64ImageBufferMock = (): Buffer => {
  return Buffer.from(base64Payload, 'base64')
}

export const base64ImageStringMock = (): string => {
  return `data:image/png;base64,${base64Payload}`
}

export const imageResponse = (): ImageResponse => {
  return {
    id: imageDTOMock().id,
    createdById: imageDTOMock().createdById,
    createdAt: imageDTOMock().createdAt,
    updatedAt: imageDTOMock().updatedAt,
    mimeType: imageDTOMock().mimeType,
    size: imageDTOMock().size,
    base64: imageDTOMock().base64
  }
}
