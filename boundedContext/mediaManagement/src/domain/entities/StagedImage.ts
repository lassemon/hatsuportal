import { unixtimeNow } from '@hatsuportal/common'
import { ImageId, ImageVersionId, MimeType } from '../../domain'
import Image, { ImageVersion } from '../../domain/entities/Image'
import { Base64Image } from '../../domain/valueObjects/Base64Image'
import { FileSize } from '../../domain/valueObjects/FileSize'
import { ImageCreatorId } from '../../domain/valueObjects/ImageCreatorId'
import { ImageStorageKey } from '../../domain/valueObjects/ImageStorageKey'
import { StagedStorageKeyMismatchError } from '../errors/StagedStorageKeyMismatchError'
import { CreatedAtTimestamp } from '@hatsuportal/shared-kernel'

export interface StageImageCommand {
  imageId: ImageId
  stagedVersionId: ImageVersionId
  storageKey: ImageStorageKey // staged === true
  mimeType: MimeType
  size: FileSize
  base64: Base64Image
  createdById: ImageCreatorId
}

/**
 * Read-only view of a draft image version not yet published.
 * Use when preparing or editing changes before promotion—e.g. upload preview, edit forms, staging flows.
 *
 * @remarks
 * - **Image**: Aggregate root; holds all versions and lifecycle logic (stage, promote, discard).
 * - **CurrentImage**: View of the published version; used for display, updates, exports.
 * - **StagedImage**: View of a draft version only; identity is versionId; used before promotion.
 */
export class StagedImage {
  static fromImageEnsuringStagedVersion(image: Image, stagedVersionId: ImageVersionId): StagedImage {
    const stagedVersion = image.getStagedVersionOrThrow(stagedVersionId)
    return new StagedImage(stagedVersion)
  }

  static createNewFrom(command: StageImageCommand): StagedImage {
    if (!command.storageKey.staged) {
      throw new StagedStorageKeyMismatchError(
        `Cannot create staged image version '${command.stagedVersionId.value}' with non-staged storage key '${command.storageKey.value}'`
      )
    }

    const stagedVersion = ImageVersion.staged({
      id: command.stagedVersionId,
      imageId: command.imageId,
      mimeType: command.mimeType,
      size: command.size,
      base64: command.base64,
      storageKey: command.storageKey,
      isCurrent: false,
      isStaged: true,
      createdById: command.createdById,
      createdAt: new CreatedAtTimestamp(unixtimeNow())
    })

    return new StagedImage(stagedVersion)
  }

  private constructor(private readonly version: ImageVersion) {}

  get id(): ImageVersionId {
    return this.version.id
  }
  get imageId(): ImageId {
    return this.version.imageId
  }
  get storageKey(): ImageStorageKey {
    return this.version.storageKey
  }
  get mimeType(): MimeType {
    return this.version.mimeType
  }
  get size(): FileSize {
    return this.version.size
  }
  get base64(): Base64Image {
    return this.version.base64
  }
  get createdById(): ImageCreatorId {
    return this.version.createdById
  }
  get createdAt(): CreatedAtTimestamp {
    return this.version.createdAt
  }
  get isStaged(): boolean {
    return this.version.isStaged
  }

  equals(other: unknown): boolean {
    return other instanceof StagedImage && this.id.equals(other.id)
  }

  toDomainVersion(): ImageVersion {
    return this.version
  }

  /**
   * Creates a plain object of all the properties encapsulated by this object. For use with logging and observability.
   * @returns A plain object of all the properties encapsulated by this object.
   */
  serialize(): Record<string, unknown> {
    return {
      id: this.id.value,
      imageId: this.imageId.value,
      storageKey: this.storageKey.value,
      mimeType: this.mimeType.value,
      size: this.size.value,
      base64: this.base64.value,
      createdById: this.createdById.value,
      createdAt: this.createdAt.value,
      isStaged: this.isStaged
    }
  }
}
