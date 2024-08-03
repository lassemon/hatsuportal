import { ImageMetadataDTO, ImageWithRelationsDTO } from '../dtos'
import { ImageDTO } from '../dtos/ImageDTO'
import { CurrentImage } from '../../domain/entities/CurrentImage'
import { Base64Image, FileSize, Image, ImageCreatorId, ImageId, ImageStorageKey, ImageVersionId, MimeType } from '../../domain'
import { CreatedAtTimestamp, UnixTimestamp } from '@hatsuportal/shared-kernel'

export interface IImageApplicationMapper {
  toDTO(image: CurrentImage): ImageDTO
  toDTOFromVersion(image: Image, versionId: ImageVersionId): ImageDTO
  toDomainEntity(imageMetadata: ImageMetadataDTO, base64: string): Image
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
    const { id, createdById, currentVersionId, storageKey, mimeType, size, isCurrent, isStaged, createdAt, updatedAt } = imageMetadata

    const version = {
      id: new ImageVersionId(currentVersionId),
      imageId: new ImageId(id),
      mimeType: new MimeType(mimeType),
      size: new FileSize(size),
      base64: Base64Image.create(base64),
      storageKey: ImageStorageKey.fromString(storageKey),
      isCurrent: isCurrent,
      isStaged: isStaged,
      createdById: new ImageCreatorId(createdById),
      createdAt: new CreatedAtTimestamp(updatedAt) // the image versions createdAt is always the latest update time of the image itself
    }

    return Image.reconstruct({
      id: new ImageId(id),
      createdAt: new CreatedAtTimestamp(createdAt),
      createdById: new ImageCreatorId(createdById),
      currentVersionId: currentVersionId ? new ImageVersionId(currentVersionId) : ImageVersionId.NOT_SET,
      versions: [version],
      updatedAt: new UnixTimestamp(updatedAt)
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
