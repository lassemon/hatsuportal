import { ImageMetadataDTO, ImageWithRelationsDTO } from '../dtos'
import { ImageDTO } from '../dtos/ImageDTO'
import { ImagePromotionLockDTO } from '../dtos/ImagePromotionLockDTO'
import { CurrentImage } from '../../domain/entities/CurrentImage'
import {
  Base64Image,
  FileSize,
  Image,
  ImageCreatorId,
  ImageId,
  ImageStorageKey,
  ImageVersion,
  ImageVersionId,
  MimeType
} from '../../domain'
import { CreatedAtTimestamp, UnixTimestamp } from '@hatsuportal/shared-kernel'

export interface IImageApplicationMapper {
  toDTO(image: CurrentImage): ImageDTO
  toDTOFromMetadata(metadata: ImageMetadataDTO): ImageDTO
  toDTOFromVersion(image: Image, versionId: ImageVersionId): ImageDTO
  toDomainEntity(imageMetadata: ImageMetadataDTO, base64: string): Image
  toImageForPromotion(lock: ImagePromotionLockDTO): Image
  toDTOWithRelations(image: CurrentImage, createdByName: string): ImageWithRelationsDTO
}

export class ImageApplicationMapper implements IImageApplicationMapper {
  constructor() {}

  public toDTO(image: CurrentImage): ImageDTO {
    return {
      id: image.id.value,
      storageKey: image.storageKey.value,
      mimeType: image.mimeType.value,
      size: image.size.value,
      base64: image.base64.value,
      currentVersionId: image.currentVersionId.value,
      isCurrent: true,
      isStaged: false,
      createdById: image.createdById.value,
      createdAt: image.createdAt.value,
      updatedAt: image.updatedAt.value
    }
  }

  public toDTOFromMetadata(metadata: ImageMetadataDTO): ImageDTO {
    return {
      id: metadata.id,
      storageKey: metadata.storageKey,
      mimeType: metadata.mimeType,
      size: metadata.size,
      base64: '',
      currentVersionId: metadata.isCurrent
        ? metadata.versionId
        : (metadata.currentVersionPointer ?? metadata.versionId),
      isCurrent: metadata.isCurrent,
      isStaged: metadata.isStaged,
      createdById: metadata.createdById,
      createdAt: metadata.createdAt,
      updatedAt: metadata.updatedAt
    }
  }

  public toDTOFromVersion(image: Image, versionId: ImageVersionId): ImageDTO {
    const version = image.getStagedVersionOrThrow(versionId)
    return {
      id: image.id.value,
      storageKey: version.storageKey.value,
      mimeType: version.mimeType.value,
      size: version.size.value,
      base64: version.base64.value,
      currentVersionId: version.id.value,
      isCurrent: version.isCurrent,
      isStaged: version.isStaged,
      createdById: version.createdById.value,
      createdAt: image.createdAt.value,
      updatedAt: image.updatedAt.value
    }
  }

  toDomainEntity(imageMetadata: ImageMetadataDTO, base64: string): Image {
    const version = {
      id: new ImageVersionId(imageMetadata.versionId),
      imageId: new ImageId(imageMetadata.id),
      mimeType: new MimeType(imageMetadata.mimeType),
      size: new FileSize(imageMetadata.size),
      base64: Base64Image.create(base64),
      storageKey: ImageStorageKey.fromString(imageMetadata.storageKey),
      isCurrent: imageMetadata.isCurrent,
      isStaged: imageMetadata.isStaged,
      createdById: new ImageCreatorId(imageMetadata.createdById),
      createdAt: new CreatedAtTimestamp(imageMetadata.updatedAt)
    }

    return Image.reconstruct({
      id: new ImageId(imageMetadata.id),
      createdAt: new CreatedAtTimestamp(imageMetadata.createdAt),
      createdById: new ImageCreatorId(imageMetadata.createdById),
      currentVersionId: imageMetadata.isCurrent
        ? new ImageVersionId(imageMetadata.versionId)
        : ImageVersionId.NOT_SET,
      versions: [version],
      updatedAt: new UnixTimestamp(imageMetadata.updatedAt)
    })
  }

  toImageForPromotion(lock: ImagePromotionLockDTO): Image {
    const stagedMetadata = lock.staged
    const stagedVersionId = new ImageVersionId(stagedMetadata.versionId)

    const stagedVersion = ImageVersion.reconstruct({
      id: stagedVersionId,
      imageId: new ImageId(stagedMetadata.id),
      mimeType: new MimeType(stagedMetadata.mimeType),
      size: new FileSize(stagedMetadata.size),
      base64: Base64Image.forExternalStorage(new MimeType(stagedMetadata.mimeType)),
      storageKey: ImageStorageKey.fromString(stagedMetadata.storageKey),
      isCurrent: stagedMetadata.isCurrent,
      isStaged: stagedMetadata.isStaged,
      createdById: new ImageCreatorId(stagedMetadata.createdById),
      createdAt: new CreatedAtTimestamp(stagedMetadata.updatedAt)
    })

    if (!lock.publishedCurrent) {
      return Image.reconstruct({
        id: new ImageId(stagedMetadata.id),
        createdAt: new CreatedAtTimestamp(stagedMetadata.createdAt),
        createdById: new ImageCreatorId(stagedMetadata.createdById),
        currentVersionId: ImageVersionId.NOT_SET,
        versions: [stagedVersion],
        updatedAt: new UnixTimestamp(stagedMetadata.updatedAt)
      })
    }

    const current = lock.publishedCurrent
    const currentVersion = ImageVersion.reconstruct({
      id: new ImageVersionId(current.id),
      imageId: new ImageId(current.imageId),
      mimeType: new MimeType(current.mimeType),
      size: new FileSize(current.size),
      base64: Base64Image.forExternalStorage(new MimeType(current.mimeType)),
      storageKey: ImageStorageKey.fromString(current.storageKey),
      isCurrent: current.isCurrent,
      isStaged: current.isStaged,
      // image-level creator — no per-version creator column (matches toDomainEntityWithVersions convention)
      createdById: new ImageCreatorId(stagedMetadata.createdById),
      createdAt: new CreatedAtTimestamp(current.createdAt)
    })

    return Image.reconstruct({
      id: new ImageId(stagedMetadata.id),
      createdAt: new CreatedAtTimestamp(stagedMetadata.createdAt),
      createdById: new ImageCreatorId(stagedMetadata.createdById),
      currentVersionId: new ImageVersionId(stagedMetadata.currentVersionPointer!),
      versions: [currentVersion, stagedVersion],
      updatedAt: new UnixTimestamp(stagedMetadata.updatedAt)
    })
  }

  public toDTOWithRelations(image: CurrentImage, createdByName: string): ImageWithRelationsDTO {
    return {
      id: image.id.value,
      storageKey: image.storageKey.value,
      mimeType: image.mimeType.value,
      size: image.size.value,
      base64: image.base64.value,
      currentVersionId: image.currentVersionId.value,
      isCurrent: true,
      isStaged: false,
      createdById: image.createdById.value,
      createdByName: createdByName,
      createdAt: image.createdAt.value,
      updatedAt: image.updatedAt.value
    }
  }
}
