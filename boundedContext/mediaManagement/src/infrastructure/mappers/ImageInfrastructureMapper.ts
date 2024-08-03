import _ from 'lodash'
import { ApplicationError } from '@hatsuportal/platform'
import { ImageDatabaseSchema, ImageMetadataDatabaseSchema, ImageVersionDatabaseSchema } from '../schemas/ImageMetadataDatabaseSchema'
import { Base64Image, FileSize, Image, ImageCreatorId, ImageId, ImageVersionId, MimeType } from '../../domain'
import { ImageDTO } from '../../application/dtos/ImageDTO'
import { ImageStorageKey } from '../../domain/valueObjects/ImageStorageKey'
import { CurrentImage, StagedImage } from '../../domain'
import { ImageVersionWithBase64, IncompleteImageError } from '../../application'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'

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
  toDTO(imageMetadataRecord: ImageMetadataDatabaseSchema, base64: string): ImageDTO
  stagedImageToDomainEntity(imageMetadataRecord: ImageMetadataDatabaseSchema, base64: string): Image
  toDomainEntity(imageMetadataRecord: ImageMetadataDatabaseSchema, base64: string): Image
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
      // TODO, business intent subclass of ApplicationError here
      throw new ApplicationError(
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

  toDTO(imageMetadataRecord: ImageMetadataDatabaseSchema, base64: string): ImageDTO {
    if (imageMetadataRecord.currentVersionId === null) {
      throw new IncompleteImageError(imageMetadataRecord.id)
    }

    return {
      id: imageMetadataRecord.id,
      storageKey: imageMetadataRecord.storageKey,
      mimeType: imageMetadataRecord.mimeType,
      size: imageMetadataRecord.size,
      createdById: imageMetadataRecord.createdById,
      currentVersionId: imageMetadataRecord.currentVersionId,
      base64,
      isCurrent: imageMetadataRecord.isCurrent,
      isStaged: imageMetadataRecord.isStaged,
      createdAt: imageMetadataRecord.createdAt,
      updatedAt: imageMetadataRecord.updatedAt
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

    const stagedVersion = {
      id: new ImageVersionId(props.currentVersionId),
      imageId: new ImageId(props.id),
      mimeType: new MimeType(props.mimeType),
      size: new FileSize(props.size),
      base64: Base64Image.create(base64),
      storageKey,
      isCurrent: props.isCurrent, // expected true
      isStaged: props.isStaged, // expected false
      createdById: new ImageCreatorId(props.createdById), // TODO: store creator per-version
      createdAt: new UnixTimestamp(props.updatedAt) // current version created at must always be the latest update moment
    }

    return Image.reconstruct({
      id: new ImageId(props.id),
      createdAt: new UnixTimestamp(props.createdAt),
      createdById: new ImageCreatorId(props.createdById),
      currentVersionId: props.currentVersionId ? new ImageVersionId(props.currentVersionId) : null,
      versions: [stagedVersion],
      updatedAt: new UnixTimestamp(props.updatedAt)
    })
  }

  toDomainEntity(imageMetadataRecord: ImageMetadataDatabaseSchema, base64: string): Image {
    const storageKey = ImageStorageKey.fromString(imageMetadataRecord.storageKey)
    const props = this.toDTO(imageMetadataRecord, base64)

    const currentVersion = {
      id: new ImageVersionId(props.currentVersionId),
      imageId: new ImageId(props.id),
      mimeType: new MimeType(props.mimeType),
      size: new FileSize(props.size),
      base64: Base64Image.create(base64),
      storageKey,
      isCurrent: props.isCurrent, // expected true
      isStaged: props.isStaged, // expected false
      createdById: new ImageCreatorId(props.createdById), // TODO: store creator per-version
      createdAt: new UnixTimestamp(props.updatedAt) // current version created at must always be the latest update moment
    }

    return Image.reconstruct({
      id: new ImageId(props.id),
      createdAt: new UnixTimestamp(props.createdAt),
      createdById: new ImageCreatorId(props.createdById),
      currentVersionId: props.currentVersionId ? new ImageVersionId(props.currentVersionId) : null,
      versions: [currentVersion],
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
      createdAt: new UnixTimestamp(version.createdAt)
    }))

    return Image.reconstruct({
      id: new ImageId(imageRecord.id),
      createdAt: new UnixTimestamp(imageRecord.createdAt),
      createdById: new ImageCreatorId(imageRecord.createdById),
      currentVersionId: imageRecord.currentVersionId ? new ImageVersionId(imageRecord.currentVersionId) : null,
      versions: versionProps,
      updatedAt: new UnixTimestamp(imageRecord.updatedAt)
    })
  }
}
