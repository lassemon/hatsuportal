import { vi, Mocked } from 'vitest'
import { unixtimeNow, UserRoleEnum, EntityTypeEnum, ImageRoleEnum } from '@hatsuportal/common'
import { IDomainEventDispatcher, IDomainEventHolder } from '@hatsuportal/shared-kernel'
import { ITransactionManager, ITransactionAware } from '@hatsuportal/platform'

import { ImageMetadataDatabaseSchema } from '../infrastructure/schemas/ImageMetadataDatabaseSchema'
import { IImageRepository } from '../domain/repositories/IImageRepository'
import { IUserGateway } from '../application/acl/userManagement/IUserGateway'
import { UserLoadResult } from '../application/acl/userManagement/outcomes/UserLoadResult'
import { UserReadModelDTO } from '../application/dtos/UserReadModelDTO'
import { ImageDTO } from '../application/dtos/ImageDTO'
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
import { UnixTimestamp } from '@hatsuportal/shared-kernel'

import { base64Payload } from './support/base64Payload'
import { CreateImageRequest, ImageResponse, UpdateImageRequest } from '@hatsuportal/contracts'
import { IImageProcessingService } from '../application/services/IImageProcessingService'
import { IImageStorageService } from '../application/services/IImageStorageService'

const createdAt = unixtimeNow() - 3000
const updatedAt = createdAt + 1500

export const sampleUserId = 'test1b19-user-4792-a2f0-f95ccab82d92'
export const sampleImageId = 'test1b19-entity-4792-a2f0-f95ccab82d92'
export const sampleImageVersionId = 'test1b19-version-4792-a2f0-f95ccab82d92'
export const sampleImageStorageKey = `${EntityTypeEnum.Story}_${ImageRoleEnum.Cover}_${sampleImageId}_version-id_${sampleUserId}.png`
export const sampleStagedImageStorageKey = `staged_${EntityTypeEnum.Story}_${ImageRoleEnum.Cover}_${sampleImageId}_version-id_${sampleUserId}.png`

export const imageDTOMock = (): ImageDTO => {
  return cloneDeep({
    id: sampleImageId,
    storageKey: sampleImageStorageKey,
    mimeType: 'image/png',
    size: 1537565,
    currentVersionId: sampleImageVersionId,
    isCurrent: true,
    isStaged: false,
    createdById: sampleUserId,
    base64: `data:image/png;base64,${base64Payload}`,
    createdAt,
    updatedAt
  })
}

const imageVersionProps = (overrides: Partial<ImageVersionProps> = {}): ImageVersionProps => {
  return cloneDeep({
    id: new ImageVersionId(sampleImageVersionId),
    imageId: new ImageId(sampleImageId),
    mimeType: new MimeType('image/png'),
    size: new FileSize(1537565),
    base64: Base64Image.create(`data:image/png;base64,${base64Payload}`),
    storageKey: ImageStorageKey.fromString(sampleImageStorageKey),
    isCurrent: true,
    isStaged: false,
    createdById: new ImageCreatorId(sampleUserId),
    createdAt: new UnixTimestamp(updatedAt),
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
    createdAt: new UnixTimestamp(createdAt),
    createdById: new ImageCreatorId(sampleUserId),
    currentVersionId: new ImageVersionId(sampleImageVersionId),
    versions: [imageVersionProps(versionOverrides)],
    updatedAt: new UnixTimestamp(updatedAt),
    ...overrides
  }
}

export const imageMock = (overrides: Partial<ImageProps> = {}, versionOverrides: Partial<ImageVersionProps> = {}): Image => {
  const versionMock = imageVersionMock({
    ...versionOverrides,
    ...(overrides.id || versionOverrides.imageId ? { imageId: overrides.id ? overrides.id : versionOverrides.imageId } : {})
  })

  return Image.reconstruct({
    id: overrides.id ? overrides.id : new ImageId(imageDTOMock().id),
    createdAt: overrides.createdAt ? overrides.createdAt : new UnixTimestamp(imageDTOMock().createdAt),
    createdById: overrides.createdById ? overrides.createdById : new ImageCreatorId(imageDTOMock().createdById),
    currentVersionId: overrides.currentVersionId !== undefined ? overrides.currentVersionId : versionMock.id,
    versions: [versionMock],
    updatedAt: overrides.updatedAt ? overrides.updatedAt : new UnixTimestamp(imageDTOMock().updatedAt)
  })
}

export const currentImageMock = (overrides: Partial<ImageProps> = {}): CurrentImage => {
  return CurrentImage.fromImageEnsuringCurrentVersion(imageMock(overrides, { isCurrent: true }))
}

export const stagedImageMock = (overrides: Partial<ImageProps> = {}): StagedImage => {
  return StagedImage.fromImageEnsuringStagedVersion(
    imageMock(
      { ...overrides, currentVersionId: null, versions: [] },
      { isCurrent: false, isStaged: true, storageKey: ImageStorageKey.fromString(sampleStagedImageStorageKey) }
    ),
    new ImageVersionId(sampleImageVersionId)
  )
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

export const imageRepositoryMock = (): Mocked<IImageRepository & ITransactionAware> => {
  class ImageRepositoryMock implements IImageRepository {
    findById = vi.fn().mockResolvedValue(imageMock())
    insert = vi.fn().mockResolvedValue(imageMock())
    update = vi.fn().mockResolvedValue(imageMock())
    delete = vi.fn()
    findByIdAndVersionId = vi.fn()
    insertStaged = vi.fn()
    insertCurrent = vi.fn()
    discardStagedVersion = vi.fn()
    deleteById = vi.fn()
    setTransaction = vi.fn()
    clearLastLoadedMap = vi.fn()
    getTableName = vi.fn().mockReturnValue('images')
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
    getUserById = vi.fn().mockResolvedValue(UserLoadResult.success(userReadModelDTOMock()))
  }
  return new UserGatewayMock()
}

export const domainEventDispatcherMock = (): Mocked<IDomainEventDispatcher> => {
  return {
    register: vi.fn(),
    dispatch: vi.fn()
  }
}

export const transactionManagerMock = (domainEventDispatcherMock: Mocked<IDomainEventDispatcher>): ITransactionManager<ImageId> => {
  class TransactionManagerMock implements ITransactionManager<ImageId> {
    execute = async <T extends Array<IDomainEventHolder<ImageId> | null>>(
      work: () => Promise<[...T]>,
      repositories?: ITransactionAware[]
    ): Promise<[...T]> => {
      const domainEventHolders = await work()

      for (const eventHolder of domainEventHolders) {
        if (eventHolder) {
          for (const event of eventHolder.domainEvents) {
            await domainEventDispatcherMock.dispatch(event)
          }
        }
      }
      domainEventHolders.forEach((eventHolder) => eventHolder && eventHolder.clearEvents())

      return domainEventHolders
    }
  }

  return new TransactionManagerMock()
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
    writeImageBufferToFile = vi.fn()
    getImageFromFileSystem = vi.fn()
    deleteImageFromFileSystem = vi.fn()
    renameImage = vi.fn()
    clearLastLoadedMap = vi.fn()
  }

  return new ImageStorageService()
}

export const base64ImageBufferMock = (): Buffer => {
  return Buffer.from(base64Payload, 'base64')
}

export const base64ImageStringMock = (): string => {
  return `data:image/png;base64,${base64Payload}`
}

export const createImageRequest = (): CreateImageRequest => {
  return {
    ...{
      id: 'not ok id', // should not be able to give this
      ownerEntityType: EntityTypeEnum.Story,
      ownerEntityId: '123',
      role: ImageRoleEnum.Cover,
      mimeType: 'image/png',
      size: 1537565,
      base64: 'asdasdasd',
      createdById: sampleUserId, // should not be able to give this
      createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to give this
      updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to give this
    }
  }
}

export const updateImageRequest = (): UpdateImageRequest => {
  return {
    ...{
      id: imageDTOMock().id,
      storageKey: 'filename.png',
      mimeType: 'image/png',
      size: 1577165,
      ownerEntityId: '123',
      ownerEntityType: EntityTypeEnum.Blogpost,
      base64: 'loremipsum',
      createdById: sampleUserId, // should not be able to change this
      createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to change this
      updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to change this
    }
  }
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
