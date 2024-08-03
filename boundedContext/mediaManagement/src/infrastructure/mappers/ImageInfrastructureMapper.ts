import _ from 'lodash'
import { ImageDatabaseSchema, ImageMetadataDatabaseSchema, ImageVersionDatabaseSchema } from '../schemas/ImageMetadataDatabaseSchema'
import { Base64Image, FileSize, Image, ImageCreatorId, ImageId, ImageVersionId, MimeType } from '../../domain'
import { ImageDTO } from '../../application/dtos/ImageDTO'
import { ImageStorageKey } from '../../domain/valueObjects/ImageStorageKey'
import { CurrentImage, StagedImage, StagedStorageKeyMismatchError } from '../../domain'
import { ImageVersionWithBase64, IncompleteImageError } from '../../application'
import { CreatedAtTimestamp, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { ImageMetadataDTO } from '../../application/dtos/ImageMetadataDTO'
import { ImageVersionMetadataDTO } from '../../application/dtos/ImageVersionMetadataDTO'

export interface IImageInfrastructureMapper {
  toInsertStagedImageQuery(image: StagedImage): ImageDatabaseSchema
  /**
   * Converts a current image entity to an insert query for image metadata main table
   * @param image
   */
  toInsertImageQuery(image: CurrentImage): ImageDatabaseSchema
  toInsertStagedImageVersionQuery(image: StagedImage): ImageVersionDatabaseSchema
  toInsertCurrentImageVersionQuery(image: CurrentImage): ImageVersionDatabaseSchema
  currentImageToDTO(image: CurrentImage): ImageDTO
  toDTO(imageMetadataRecord: ImageMetadataDatabaseSchema): ImageMetadataDTO
  toVersionDTO(imageVersionRecord: ImageVersionDatabaseSchema): ImageVersionMetadataDTO
  stagedImageToDomainEntity(imageMetadataRecord: ImageMetadataDatabaseSchema, base64: string): Image
  toDomainEntityWithVersions(imageMetadataRecord: ImageMetadataDatabaseSchema, versions: ImageVersionWithBase64[]): Image
}

export class ImageInfrastructureMapper implements IImageInfrastructureMapper {
  toInsertStagedImageQuery(image: StagedImage): ImageDatabaseSchema {
    return {
      id: image.imageId.value,
      createdById: image.createdById.value,
      createdAt: image.createdAt.value,
      currentVersionId: null
    }
  }

  toInsertImageQuery(image: CurrentImage): ImageDatabaseSchema {
    return {
      id: image.id.value,
      createdById: image.createdById.value,
      createdAt: image.createdAt.value,
      currentVersionId: image.currentVersionId.value
    }
  }

  toInsertStagedImageVersionQuery(image: StagedImage): ImageVersionDatabaseSchema {
    if (!image.storageKey.staged) {
      throw new StagedStorageKeyMismatchError(
        `Cannot insert staged image version '${image.id.value}' for image '${image.imageId.value}' because storage key is not staged.`
      )
    }

    return {
      id: image.id.value,
      imageId: image.imageId.value,
      storageKey: image.storageKey.value,
      mimeType: image.mimeType.value,
      size: image.size.value,
      isCurrent: false,
      isStaged: true,
      createdAt: image.createdAt.value
    }
  }

  toInsertCurrentImageVersionQuery(image: CurrentImage): ImageVersionDatabaseSchema {
    return {
      id: image.currentVersionId.value,
      imageId: image.id.value,
      storageKey: image.storageKey.value,
      mimeType: image.mimeType.value,
      size: image.size.value,
      isCurrent: true,
      isStaged: false,
      createdAt: image.createdAt.value
    }
  }

  currentImageToDTO(image: CurrentImage): ImageDTO {
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

  toDTO(imageMetadataRecord: ImageMetadataDatabaseSchema): ImageMetadataDTO {
    const effectiveVersionId = imageMetadataRecord.currentVersionId ?? imageMetadataRecord.versionId
    if (effectiveVersionId === null || effectiveVersionId === undefined) {
      throw new IncompleteImageError(imageMetadataRecord.id)
    }

    return {
      id: imageMetadataRecord.id,
      storageKey: imageMetadataRecord.storageKey,
      mimeType: imageMetadataRecord.mimeType,
      size: imageMetadataRecord.size,
      createdById: imageMetadataRecord.createdById,
      currentVersionId: effectiveVersionId,
      isCurrent: imageMetadataRecord.isCurrent,
      isStaged: imageMetadataRecord.isStaged,
      createdAt: imageMetadataRecord.createdAt,
      updatedAt: imageMetadataRecord.updatedAt
    }
  }

  toVersionDTO(imageVersionRecord: ImageVersionDatabaseSchema): ImageVersionMetadataDTO {
    return {
      id: imageVersionRecord.id,
      imageId: imageVersionRecord.imageId,
      storageKey: imageVersionRecord.storageKey,
      mimeType: imageVersionRecord.mimeType,
      size: imageVersionRecord.size,
      isCurrent: imageVersionRecord.isCurrent,
      isStaged: imageVersionRecord.isStaged,
      createdAt: imageVersionRecord.createdAt
    }
  }

  stagedImageToDomainEntity(imageMetadataRecord: ImageMetadataDatabaseSchema, base64: string): Image {
    const storageKey = ImageStorageKey.fromString(imageMetadataRecord.storageKey)

    const props = {
      id: imageMetadataRecord.id,
      storageKey: imageMetadataRecord.storageKey,
      mimeType: imageMetadataRecord.mimeType,
      size: imageMetadataRecord.size,
      createdById: imageMetadataRecord.createdById,
      currentVersionId: imageMetadataRecord.versionId!,
      base64,
      isCurrent: imageMetadataRecord.isCurrent,
      isStaged: imageMetadataRecord.isStaged,
      createdAt: imageMetadataRecord.createdAt,
      updatedAt: imageMetadataRecord.updatedAt
    }

    const version = {
      id: new ImageVersionId(props.currentVersionId),
      imageId: new ImageId(props.id),
      mimeType: new MimeType(props.mimeType),
      size: new FileSize(props.size),
      base64: Base64Image.create(base64),
      storageKey,
      isCurrent: props.isCurrent,
      isStaged: props.isStaged,
      createdById: new ImageCreatorId(props.createdById),
      createdAt: new CreatedAtTimestamp(props.updatedAt) // the image versions createdAt is always the latest update time of the image itself
    }

    return Image.reconstruct({
      id: new ImageId(props.id),
      createdAt: new CreatedAtTimestamp(props.createdAt),
      createdById: new ImageCreatorId(props.createdById),
      currentVersionId: props.currentVersionId ? new ImageVersionId(props.currentVersionId) : ImageVersionId.NOT_SET,
      versions: [version],
      updatedAt: new UnixTimestamp(props.updatedAt)
    })
  }

  toDomainEntityWithVersions(imageRecord: ImageMetadataDatabaseSchema, versions: ImageVersionWithBase64[]): Image {
    const current = versions.find((version) => version.isCurrent)
    if (!current) throw new IncompleteImageError(imageRecord.id)

    const versionProps = versions.map((version) => ({
      id: new ImageVersionId(version.id),
      imageId: new ImageId(version.imageId),
      mimeType: new MimeType(version.mimeType),
      size: new FileSize(version.size),
      base64: Base64Image.create(version.base64),
      storageKey: ImageStorageKey.fromString(version.storageKey),
      isCurrent: version.isCurrent,
      isStaged: version.isStaged,
      createdById: new ImageCreatorId(imageRecord.createdById), // replace when you persist per-version creator
      createdAt: new CreatedAtTimestamp(version.createdAt)
    }))

    return Image.reconstruct({
      id: new ImageId(imageRecord.id),
      createdAt: new CreatedAtTimestamp(imageRecord.createdAt),
      createdById: new ImageCreatorId(imageRecord.createdById),
      currentVersionId: imageRecord.currentVersionId ? new ImageVersionId(imageRecord.currentVersionId) : ImageVersionId.NOT_SET,
      versions: versionProps,
      updatedAt: new UnixTimestamp(imageRecord.updatedAt)
    })
  }
}
