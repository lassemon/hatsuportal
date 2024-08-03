import { unixtimeNow } from '@hatsuportal/common'
import { ImageId } from '../valueObjects/ImageId'
import { ImageCreatorId } from '../valueObjects/ImageCreatorId'
import { MimeType } from '../valueObjects/MimeType'
import { FileSize } from '../valueObjects/FileSize'
import { Base64Image } from '../valueObjects/Base64Image'
import {
  ImageCreatedEvent,
  ImageDeletedEvent,
  ImageUpdatedEvent,
  ImageVersionDiscardedEvent,
  ImageVersionPromotedToCurrentEvent,
  ImageVersionStagedEvent
} from '../events/image/ImageEvents'
import { ImageVersionId } from '../valueObjects/ImageVersionId'
import { ImageStorageKey } from '../valueObjects/ImageStorageKey'
import { InvalidImageStorageKeyError } from '../errors/InvalidImageStorageKeyError'
import InvalidDomainOperationError from '../errors/InvalidDomainOperationError'
import {
  DomainError,
  Entity,
  EntityFactoryResult,
  EntityProps,
  IDomainEvent,
  IDomainEventHolder,
  UnixTimestamp
} from '@hatsuportal/shared-kernel'

export interface ImageProps extends EntityProps {
  readonly id: ImageId
  readonly createdAt: UnixTimestamp
  readonly createdById: ImageCreatorId
  readonly currentVersionId: ImageVersionId | null
  readonly versions: ImageVersionProps[]
}

export class Image extends Entity implements IDomainEventHolder<ImageId, UnixTimestamp> {
  static canCreate(props: any): boolean {
    try {
      Image.assertCanCreate(props)
      return true
    } catch (error) {
      return false
    }
  }

  static assertCanCreate(props: any): void {
    new Image(
      props.id instanceof ImageId ? props.id : new ImageId(props.id),
      props.createdAt instanceof UnixTimestamp ? props.createdAt : new UnixTimestamp(props.createdAt),
      props.createdById instanceof ImageCreatorId ? props.createdById : new ImageCreatorId(props.createdById),
      props.currentVersionId === null
        ? null
        : props.currentVersionId instanceof ImageVersionId
        ? props.currentVersionId
        : new ImageVersionId(props.currentVersionId),
      new Map(
        props.versions.map((version: any) => {
          const id = version.id instanceof ImageVersionId ? version.id : new ImageVersionId(version.id)
          const imageId = version.imageId instanceof ImageId ? version.imageId : new ImageId(version.imageId)
          const createdById = version.createdById instanceof ImageCreatorId ? version.createdById : new ImageCreatorId(version.createdById)
          const createdAt = version.createdAt instanceof UnixTimestamp ? version.createdAt : new UnixTimestamp(version.createdAt)
          const mimeType = version.mimeType instanceof MimeType ? version.mimeType : new MimeType(version.mimeType)
          const size = version.size instanceof FileSize ? version.size : new FileSize(version.size)
          const base64 = version.base64 instanceof Base64Image ? version.base64 : Base64Image.create(version.base64)
          const storageKey =
            version.storageKey instanceof ImageStorageKey ? version.storageKey : ImageStorageKey.fromString(version.storageKey)

          return [
            id.value,
            ImageVersion.reconstruct({
              id,
              imageId,
              mimeType,
              size,
              base64,
              storageKey,
              isCurrent: version.isCurrent,
              isStaged: version.isStaged,
              createdById,
              createdAt
            })
          ]
        })
      ),
      props.updatedAt instanceof UnixTimestamp ? props.updatedAt : new UnixTimestamp(props.updatedAt)
    )
  }

  static create(props: ImageProps): Image {
    const image = new Image(
      props.id,
      props.createdAt,
      props.createdById,
      props.currentVersionId,
      new Map(props.versions.map((version) => [version.id.value, ImageVersion.reconstruct(version)])),
      props.updatedAt
    )
    image.addDomainEvent(new ImageCreatedEvent(image))
    return image
  }

  static tryCreate(props: ImageProps): EntityFactoryResult<Image, DomainError> {
    try {
      Image.assertCanCreate(props)
      const image = Image.create(props)
      return EntityFactoryResult.ok(image)
    } catch (error) {
      if (error instanceof DomainError) {
        return EntityFactoryResult.fail(error)
      }
      return EntityFactoryResult.fail(
        new DomainError({
          message: 'Unknown error occurred while creating image',
          cause: error
        })
      )
    }
  }

  static reconstruct(props: ImageProps): Image {
    return new Image(
      props.id,
      props.createdAt,
      props.createdById,
      props.currentVersionId,
      new Map(props.versions.map((version) => [version.id.value, ImageVersion.reconstruct(version)])),
      props.updatedAt
    )
  }

  private _currentVersionId: ImageVersionId | null
  private _versions: Map<string, ImageVersion> = new Map()

  private constructor(
    id: ImageId,
    createdAt: UnixTimestamp,
    public readonly createdById: ImageCreatorId,
    currentVersionId: ImageVersionId | null,
    versions: Map<string, ImageVersion>,
    updatedAt: UnixTimestamp
  ) {
    super(id, createdAt, updatedAt)

    this._versions = versions
    this._currentVersionId = currentVersionId

    const latest = [...this.versions.values()].reduce<UnixTimestamp | null>(
      (accumulator, version) => (!accumulator || version.createdAt.value > accumulator.value ? version.createdAt : accumulator),
      null
    )
    this._updatedAt = latest ?? this.createdAt
    this.assertInvariants()
  }

  get currentVersionId(): ImageVersionId | null {
    return this._currentVersionId
  }

  get storageKey(): ImageStorageKey | null {
    return this.getCurrentVersion()?.storageKey ?? null
  }

  get mimeType(): MimeType | null {
    return this.getCurrentVersion()?.mimeType ?? null
  }

  get fileExtension(): string | null {
    return this.getCurrentVersion()?.mimeType.fileExtension ?? null
  }

  get size(): FileSize | null {
    return this.getCurrentVersion()?.size ?? null
  }

  get base64(): Base64Image | null {
    return this.getCurrentVersion()?.base64 ?? null
  }

  get isCurrent(): boolean {
    return this.getCurrentVersion()?.isCurrent ?? false
  }

  get isStaged(): boolean {
    return this.getCurrentVersion()?.isStaged ?? false
  }

  get versions(): Map<string, ImageVersion> {
    return this._versions
  }

  public updateWithNewCurrentVersion(newCurrentVersion: ImageVersion, emitEvents?: boolean): this {
    if (this.versions.has(newCurrentVersion.id.value))
      throw new InvalidDomainOperationError(
        `Cannot update current version. Version ${newCurrentVersion.id.value} already exists for image ${this.id.value}`
      )

    if (newCurrentVersion.isStaged || !newCurrentVersion.isCurrent)
      throw new InvalidDomainOperationError(
        `Cannot update current version. Version ${newCurrentVersion.id.value} must be current and not staged`
      )

    if (!newCurrentVersion.imageId.equals(this.id))
      throw new InvalidDomainOperationError(
        `Cannot update current version. New version '${newCurrentVersion.id.value}' belongs to a different image '${newCurrentVersion.imageId.value}', when it's expected to belong to '${this.id.value}'`
      )

    if (newCurrentVersion.storageKey.staged)
      throw new InvalidImageStorageKeyError(`Storage key '${newCurrentVersion.storageKey.value}' is staged`)

    if (newCurrentVersion.storageKey.ownerEntityId !== this.id.value)
      throw new InvalidDomainOperationError(
        `Cannot update current version. New version '${newCurrentVersion.id.value}' has a different owner entity id '${newCurrentVersion.storageKey.ownerEntityId}', when it's expected to be owned by '${this.id.value}'`
      )

    if (!newCurrentVersion.storageKey.mimeType.equals(newCurrentVersion.mimeType))
      throw new InvalidDomainOperationError(
        `Cannot update current version. New version '${newCurrentVersion.id.value}' has a different mime type`
      )

    if (newCurrentVersion.storageKey.versionId !== newCurrentVersion.id.value) throw new InvalidImageStorageKeyError(`Version id mismatch`)

    if (!this.currentVersionId) throw new InvalidDomainOperationError(`Image has no current version; use promoteToCurrent instead.`)

    const old = this.clone()
    const newVersion = ImageVersion.current({
      id: newCurrentVersion.id,
      imageId: this.id,
      mimeType: newCurrentVersion.mimeType,
      size: newCurrentVersion.size,
      base64: newCurrentVersion.base64,
      storageKey: newCurrentVersion.storageKey,
      isCurrent: true,
      isStaged: false,
      createdById: this.createdById,
      createdAt: new UnixTimestamp(unixtimeNow())
    })

    const previousCurrentVersion = this.versions.get(this.currentVersionId.value)
    if (!previousCurrentVersion)
      throw new InvalidDomainOperationError(
        `Cannot update current version. Previous current version not found, did you mean to use promoteToCurrent instead?`
      )

    previousCurrentVersion.markNotCurrent()

    this.versions.set(newVersion.id.value, newVersion)
    this._currentVersionId = newVersion.id
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    this.assertInvariants()
    if (emitEvents) this.addDomainEvent(new ImageUpdatedEvent(old, this))
    return this
  }

  public stageVersion(imageVersion: ImageVersion, emitEvents: boolean = false): void {
    if (this.versions.has(imageVersion.id.value)) {
      throw new InvalidDomainOperationError(
        `Cannot stage version. Version '${imageVersion.id.value}' already exists for image '${this.id.value}'`
      )
    }
    if (!imageVersion.isStaged || imageVersion.isCurrent) {
      throw new InvalidDomainOperationError(
        `Cannot stage version. Version '${imageVersion.id.value}' must have isStaged=true and isCurrent=false`
      )
    }
    if (imageVersion.storageKey.staged !== true)
      throw new InvalidDomainOperationError(`Cannot stage version. Version '${imageVersion.id.value}' has a non-staged storage key`)

    this.versions.set(imageVersion.id.value, imageVersion)
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    this.assertInvariants()
    if (emitEvents) this.addDomainEvent(new ImageVersionStagedEvent(imageVersion))
  }

  replaceStagedVersion(originalVersionId: ImageVersionId, newStagedVersion: ImageVersion, emitEvents: boolean = false): void {
    const original = this.versions.get(originalVersionId.value)
    if (!original)
      throw new InvalidDomainOperationError(
        `Cannot replace staged version. Version '${originalVersionId.value}' not found for image '${this.id.value}'`
      )

    if (!original.isStaged) throw new InvalidDomainOperationError(`Cannot replace non-staged version ${originalVersionId.value}`)

    if (!newStagedVersion.isStaged || newStagedVersion.isCurrent)
      throw new InvalidDomainOperationError(`New version must be staged and not current`)

    if (!newStagedVersion.imageId.equals(this.id))
      throw new InvalidDomainOperationError(
        `New version '${newStagedVersion.id.value}' belongs to a different image '${newStagedVersion.imageId.value}'`
      )

    if (newStagedVersion.id.equals(originalVersionId))
      throw new InvalidDomainOperationError(`New version id must be different from original`)

    if (newStagedVersion.storageKey.staged !== true)
      throw new InvalidDomainOperationError(
        `Cannot replace staged version. Version '${newStagedVersion.id.value}' has a non-staged storage key`
      )

    // replace
    this.versions.delete(originalVersionId.value)
    this.versions.set(newStagedVersion.id.value, newStagedVersion)

    this._updatedAt = new UnixTimestamp(unixtimeNow())

    this.assertInvariants()
    if (emitEvents) this.addDomainEvent(new ImageVersionStagedEvent(newStagedVersion))
  }

  promoteToCurrent(versionId: ImageVersionId, storageKey: ImageStorageKey, emitEvents: boolean = false): void {
    const target = this.versions.get(versionId.value)
    if (!target)
      throw new InvalidDomainOperationError(
        `Cannot promote to current. Version '${versionId.value}' not found for image '${this.id.value}'`
      )
    if (target.isCurrent) return // idempotent
    if (!target.isStaged) throw new InvalidDomainOperationError(`Cannot find staged version '${versionId.value}' to promote to current`)
    if (storageKey.staged === true)
      throw new InvalidImageStorageKeyError(`Cannot promote to current, storage key '${storageKey.value}' is staged`)
    if (storageKey.versionId !== versionId.value)
      throw new InvalidImageStorageKeyError(`Cannot promote to current, storage key '${storageKey.value}' has a different version id`)
    if (!storageKey.mimeType.equals(target.mimeType))
      throw new InvalidImageStorageKeyError(`Cannot promote to current, storage key '${storageKey.value}' has a different mime type`)

    if (this.currentVersionId) {
      const prev = this.versions.get(this.currentVersionId.value)
      if (prev) prev.markNotCurrent()
    }

    target.promote(storageKey)

    this._currentVersionId = versionId

    this._updatedAt = new UnixTimestamp(unixtimeNow())
    this.assertInvariants()
    if (emitEvents) this.addDomainEvent(new ImageVersionPromotedToCurrentEvent(target))
  }

  private getCurrentVersion(): ImageVersion | null {
    const currentVersion = this.versions.get(this.currentVersionId?.value ?? '')
    if (!currentVersion) {
      return null
    }
    return currentVersion
  }

  public getCurrentVersionOrThrow(): ImageVersion {
    const currentVersion = this.getCurrentVersion()
    if (!currentVersion) {
      throw new InvalidDomainOperationError('Cannot get current version. Current version is null')
    }
    return currentVersion
  }

  public getStagedVersion(versionId: ImageVersionId): ImageVersion | null {
    const stagedVersion = this.versions.get(versionId.value)
    if (!stagedVersion) {
      return null
    }
    return stagedVersion
  }

  public getStagedVersionOrThrow(versionId: ImageVersionId): ImageVersion {
    const stagedVersion = this.getStagedVersion(versionId)
    if (!stagedVersion) {
      throw new InvalidDomainOperationError(`Cannot get staged version. Staged version '${versionId.value}' not found`)
    }
    return stagedVersion
  }

  public delete(emitEvents: boolean = false): void {
    this._currentVersionId = null
    this.versions.clear()
    this.assertInvariants()
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    if (emitEvents) this.addDomainEvent(new ImageDeletedEvent(this))
  }

  public discardStagedVersion(versionId: ImageVersionId, emitEvents: boolean = false): void {
    const stagedVersion = this.versions.get(versionId.value)
    if (!stagedVersion) return // idempotent
    if (!stagedVersion.isStaged) throw new InvalidDomainOperationError(`Cannot discard non-staged version '${versionId.value}'`)

    this.versions.delete(versionId.value)

    this._updatedAt = new UnixTimestamp(unixtimeNow())
    this.assertInvariants()
    if (emitEvents) this.addDomainEvent(new ImageVersionDiscardedEvent(stagedVersion))
  }

  equals(other: unknown): boolean {
    return other instanceof Image && this.id.equals(other.id)
  }

  public get domainEvents(): IDomainEvent<UnixTimestamp>[] {
    return [...this._domainEvents]
  }

  public clearEvents(): void {
    this._domainEvents = []
  }

  public addDomainEvent(event: IDomainEvent<UnixTimestamp>): void {
    this._domainEvents.push(event)
  }

  private assertInvariants(): void {
    // all versions belong to this image
    for (const imageVersion of this.versions.values()) {
      if (!imageVersion.imageId.equals(this.id))
        throw new InvalidDomainOperationError(`Image version ${imageVersion.id.value} does not belong to image ${this.id.value}`)
      if (imageVersion.isCurrent && imageVersion.isStaged)
        throw new InvalidDomainOperationError(`Image version ${imageVersion.id.value} cannot be both current and staged`)
      if (imageVersion.isStaged && imageVersion.storageKey.staged !== true)
        throw new InvalidDomainOperationError(`Image version ${imageVersion.id.value} is staged but has non-staged storage key`)
      if (imageVersion.isCurrent && imageVersion.storageKey.staged === true)
        throw new InvalidDomainOperationError(`Image version ${imageVersion.id.value} is current but has staged storage key`)
    }

    // at most one current
    const currentVersions = [...this.versions.values()].filter((v) => v.isCurrent)
    if (currentVersions.length > 1) {
      const currentIds = currentVersions.map((v) => v.id.value).join(', ')
      throw new InvalidDomainOperationError(`Multiple current versions detected: ${currentIds}`)
    }

    // pointer rules
    if (this.currentVersionId === null) {
      if (currentVersions.length !== 0) {
        throw new InvalidDomainOperationError(`Pointer is null but there is a current version`)
      }
    } else {
      const pointed = this.versions.get(this.currentVersionId.value)
      if (!pointed) {
        throw new InvalidDomainOperationError(`Pointer references missing version ${this.currentVersionId.value}`)
      }
      if (!pointed.isCurrent && !pointed.isStaged) {
        throw new InvalidDomainOperationError(`Pointer is neither current nor staged`)
      }
      if (pointed.isCurrent && pointed.isStaged) {
        throw new InvalidDomainOperationError(`Pointer is both current and staged`)
      }
    }
  }

  /**
   * Creates a plain object of all the properties encapsulated by this object. For use with logging and observability.
   * @returns A plain object of all the properties encapsulated by this object.
   */
  public serialize(): Record<string, unknown> {
    return {
      id: this.id.value,
      createdAt: this.createdAt.value,
      createdById: this.createdById.value,
      currentVersionId: this.currentVersionId?.value ?? null,
      versions: [...this.versions.values()].map((version) => version.serialize())
    }
  }

  public clone(): Image {
    return new Image(this.id, this.createdAt, this.createdById, this.currentVersionId ?? null, this.versions, this.updatedAt)
  }
}

export default Image

export interface ImageVersionProps {
  id: ImageVersionId
  imageId: ImageId
  mimeType: MimeType
  size: FileSize
  base64: Base64Image
  storageKey: ImageStorageKey
  isCurrent: boolean
  isStaged: boolean
  createdById: ImageCreatorId
  createdAt: UnixTimestamp
}

export class ImageVersion {
  public static staged(props: ImageVersionProps): ImageVersion {
    return new ImageVersion(
      props.id,
      props.imageId,
      props.mimeType,
      props.size,
      props.base64,
      props.storageKey,
      false,
      true,
      props.createdById,
      props.createdAt
    )
  }

  public static current(props: ImageVersionProps): ImageVersion {
    return new ImageVersion(
      props.id,
      props.imageId,
      props.mimeType,
      props.size,
      props.base64,
      props.storageKey,
      true,
      false,
      props.createdById,
      props.createdAt
    )
  }

  public static reconstruct(props: ImageVersionProps): ImageVersion {
    return new ImageVersion(
      props.id,
      props.imageId,
      props.mimeType,
      props.size,
      props.base64,
      props.storageKey,
      props.isCurrent,
      props.isStaged,
      props.createdById,
      props.createdAt
    )
  }

  private constructor(
    public readonly id: ImageVersionId,
    public readonly imageId: ImageId,
    public readonly mimeType: MimeType,
    public readonly size: FileSize,
    public readonly base64: Base64Image,
    public storageKey: ImageStorageKey,
    public isCurrent: boolean,
    public isStaged: boolean,
    public readonly createdById: ImageCreatorId,
    public createdAt: UnixTimestamp
  ) {
    // validate file extension by calling the file extension getter
    this.mimeType.fileExtension
  }

  promote(permanentKey: ImageStorageKey): void {
    this.isCurrent = true
    this.isStaged = false
    this.storageKey = permanentKey
  }

  markNotCurrent(): void {
    this.isCurrent = false
  }

  /**
   * Creates a plain object of all the properties encapsulated by this object. For use with logging and observability.
   * @returns A plain object of all the properties encapsulated by this object.
   */
  serialize(): Record<string, unknown> {
    return {
      id: this.id.value,
      imageId: this.imageId.value,
      mimeType: this.mimeType.value,
      size: this.size.value,
      base64: this.base64.value,
      storageKey: this.storageKey.value,
      isCurrent: this.isCurrent,
      isStaged: this.isStaged,
      createdById: this.createdById.value,
      createdAt: this.createdAt.value
    }
  }
}
