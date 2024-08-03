import { uuid } from '@hatsuportal/common'
import {
  Base64Image,
  FileSize,
  ImageCreatorId,
  ImageId,
  ImageVersionId,
  ImageStorageKey,
  MimeType,
  StagedImage
} from '../../domain'
import { CreateImageInputDTO } from '../dtos/CreateImageInputDTO'
import { PreparedStagedImageDTO } from '../dtos/PreparedStagedImageDTO'
import { IStorageKeyGenerator } from '../services/IStorageKeyGenerator'

export interface IStagedImageFactory {
  createFromInput(createdById: string, input: CreateImageInputDTO): StagedImage
  fromPreparedDTO(prepared: PreparedStagedImageDTO): StagedImage
}

/**
 * Builds a {@link StagedImage} from application input before persistence runs.
 *
 * Lives in the application layer because creation here combines concerns the domain entity
 * should not own: mapping {@link CreateImageInputDTO}, assigning new image/version ids, and
 * deriving a staged storage path via {@link IStorageKeyGenerator}. Owner entity fields
 * (type, id, role) are used only for that storage path — they are not passed to
 * {@link StagedImage}; ownership is recorded separately (e.g. post_image_links).
 *
 * Domain construction and invariants remain on {@link StagedImage.createNewFrom}.
 */
export class StagedImageFactory implements IStagedImageFactory {
  constructor(private readonly storageKeyGenerator: IStorageKeyGenerator) {}

  createFromInput(createdById: string, input: CreateImageInputDTO): StagedImage {
    const imageId = uuid()
    const versionId = uuid()
    const { ownerEntityType, role, ownerEntityId, mimeType, size, base64 } = input

    const storageKey = this.storageKeyGenerator.generateStorageKey(
      ownerEntityType,
      role,
      ownerEntityId,
      versionId,
      createdById,
      new MimeType(mimeType),
      { isStaged: true }
    )

    return StagedImage.createNewFrom({
      imageId: new ImageId(imageId),
      stagedVersionId: new ImageVersionId(versionId),
      storageKey,
      mimeType: new MimeType(mimeType),
      size: new FileSize(size),
      base64: Base64Image.create(base64),
      createdById: new ImageCreatorId(createdById)
    })
  }

  fromPreparedDTO(prepared: PreparedStagedImageDTO): StagedImage {
    return StagedImage.fromPreparedMetadata({
      imageId: new ImageId(prepared.imageId),
      stagedVersionId: new ImageVersionId(prepared.stagedVersionId),
      storageKey: ImageStorageKey.fromString(prepared.storageKey),
      mimeType: new MimeType(prepared.mimeType),
      size: new FileSize(prepared.size),
      createdById: new ImageCreatorId(prepared.createdById)
    })
  }
}
