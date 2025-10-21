import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import mime from 'mime-types'
import { ImageId } from '../../domain/valueObjects/ImageId'
import { ImageCreatorId } from '../../domain/valueObjects/ImageCreatorId'
import { ImageVersionId } from '../../domain/valueObjects/ImageVersionId'
import { ImageStorageKey } from '../../domain/valueObjects/ImageStorageKey'
import { MimeType } from '../../domain/valueObjects/MimeType'
import Image, { ImageVersion } from '../../domain/entities/Image'
import { FileSize } from '../../domain/valueObjects/FileSize'
import { Base64Image } from '../../domain/valueObjects/Base64Image'
import { InvalidMimeTypeError } from '../../domain/errors/InvalidMimeTypeError'

export interface CreateCurrentImageCommand {
  imageId: ImageId
  versionId: ImageVersionId
  storageKey: ImageStorageKey
  mimeType: MimeType
  size: FileSize
  base64: Base64Image
  createdById: ImageCreatorId
  createdAt: UnixTimestamp
}

export class CurrentImage {
  private constructor(private readonly image: Image, private readonly currentVersion: ImageVersion) {}

  static fromImageEnsuringCurrentVersion(image: Image): CurrentImage {
    const currentVersion = image.getCurrentVersionOrThrow()
    return new CurrentImage(image, currentVersion)
  }

  static createNewFrom(command: CreateCurrentImageCommand): CurrentImage {
    const currentVersion = ImageVersion.current({
      id: command.versionId,
      imageId: command.imageId,
      mimeType: command.mimeType,
      size: command.size,
      base64: command.base64,
      storageKey: command.storageKey,
      isCurrent: true,
      isStaged: false,
      createdById: command.createdById,
      createdAt: command.createdAt
    })

    const image = Image.create({
      id: command.imageId,
      createdById: command.createdById,
      createdAt: command.createdAt,
      updatedAt: command.createdAt,
      currentVersionId: command.versionId,
      versions: [currentVersion]
    })

    return new CurrentImage(image, currentVersion)
  }

  get id(): ImageId {
    return this.image.id
  }
  get currentVersionId(): ImageVersionId {
    return this.image.currentVersionId!
  }
  get storageKey(): ImageStorageKey {
    return this.currentVersion.storageKey
  }
  get mimeType(): MimeType {
    return this.currentVersion.mimeType
  }
  get size(): FileSize {
    return this.currentVersion.size
  }
  get base64(): Base64Image {
    return this.currentVersion.base64
  }
  get createdById(): ImageCreatorId {
    return this.image.createdById
  }
  get createdAt(): UnixTimestamp {
    return this.image.createdAt
  }
  get updatedAt(): UnixTimestamp {
    return this.image.updatedAt
  }

  get fileExtension(): string {
    const mimeType = this.currentVersion.mimeType
    const fileExtension = mime.extension(mimeType.value)
    if (!fileExtension) {
      throw new InvalidMimeTypeError(`Could not parse mime type from '${mimeType.value}'`)
    }
    return fileExtension
  }

  equals(other: unknown): boolean {
    return other instanceof CurrentImage && this.id.equals(other.id)
  }

  toDomainVersion(): ImageVersion {
    return this.currentVersion
  }

  /**
   * Creates a plain object of all the properties encapsulated by this object. For use with logging and observability.
   * @returns A plain object of all the properties encapsulated by this object.
   */
  serialize(): Record<string, unknown> {
    return {
      id: this.id.value,
      currentVersionId: this.currentVersionId.value,
      storageKey: this.storageKey.value,
      mimeType: this.mimeType.value,
      size: this.size.value,
      base64: this.base64.value,
      createdById: this.createdById.value,
      createdAt: this.createdAt.value,
      updatedAt: this.updatedAt.value
    }
  }
}
