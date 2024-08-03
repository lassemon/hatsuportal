import { Maybe, unixtimeNow } from '@hatsuportal/common'
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
import { ImageVersionAlreadyExistsError } from '../errors/ImageVersionAlreadyExistsError'
import { ImageVersionNotFoundError } from '../errors/ImageVersionNotFoundError'
import { ImageVersionBelongsToDifferentImageError } from '../errors/ImageVersionBelongsToDifferentImageError'
import { StagedStorageKeyMismatchError } from '../errors/StagedStorageKeyMismatchError'
import { StorageKeyOwnerEntityIdMismatchError } from '../errors/StorageKeyOwnerEntityIdMismatchError'
import { InvalidVersionStateForCurrentUpdateError } from '../errors/InvalidVersionStateForCurrentUpdateError'
import { InvalidVersionStateForStagingError } from '../errors/InvalidVersionStateForStagingError'
import { VersionStateConflictError } from '../errors/VersionStateConflictError'
import { VersionNotStagedError } from '../errors/VersionNotStagedError'
import { ImageHasNoCurrentVersionError } from '../errors/ImageHasNoCurrentVersionError'
import { PreviousCurrentVersionNotFoundError } from '../errors/PreviousCurrentVersionNotFoundError'
import { CurrentVersionNotFoundError } from '../errors/CurrentVersionNotFoundError'
import { StagedVersionNotFoundError } from '../errors/StagedVersionNotFoundError'
import { CannotReplaceNonStagedVersionError } from '../errors/CannotReplaceNonStagedVersionError'
import { VersionIdMustDifferError } from '../errors/VersionIdMustDifferError'
import { MultipleCurrentVersionsError } from '../errors/MultipleCurrentVersionsError'
import { CurrentVersionPointerInconsistencyError } from '../errors/CurrentVersionPointerInconsistencyError'
import { CurrentVersionPointerReferencesMissingVersionError } from '../errors/CurrentVersionPointerReferencesMissingVersionError'
import { CurrentVersionPointerInvalidStateError } from '../errors/CurrentVersionPointerInvalidStateError'
import {
  CreatedAtTimestamp,
  DomainError,
  Entity,
  EntityFactoryResult,
  EntityProps,
  IDomainEvent,
  IDomainEventHolder,
  UniqueId,
  UnixTimestamp
} from '@hatsuportal/shared-kernel'

export interface ImageProps extends EntityProps {
  readonly id: ImageId
  readonly createdAt: CreatedAtTimestamp
  readonly createdById: ImageCreatorId
  readonly currentVersionId: ImageVersionId
  readonly versions: ImageVersionProps[]
}

/**
 * Aggregate root for image media. Holds all versions (current and staged) and lifecycle logic.
 * Use when staging, promoting, discarding, or mutating versions—e.g. repositories, use cases.
 *
 * @remarks
 * - **Image**: Aggregate root; full version history and mutability.
 * - **CurrentImage**: Read-only view of the published version; for display/update flows.
 * - **StagedImage**: Read-only view of a draft version; for pre-promotion flows.
 */
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
      props.createdAt instanceof CreatedAtTimestamp ? props.createdAt : new CreatedAtTimestamp(props.createdAt),
      props.createdById instanceof ImageCreatorId ? props.createdById : new ImageCreatorId(props.createdById),
      ImageVersionId.fromOptional(props.currentVersionId),
      new Map(
        props.versions.map((version: any) => {
          const id = version.id instanceof ImageVersionId ? version.id : new ImageVersionId(version.id)
          const imageId = version.imageId instanceof ImageId ? version.imageId : new ImageId(version.imageId)
          const createdById = version.createdById instanceof ImageCreatorId ? version.createdById : new ImageCreatorId(version.createdById)
          const createdAt = version.createdAt instanceof CreatedAtTimestamp ? version.createdAt : new CreatedAtTimestamp(version.createdAt)
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
    image.addDomainEvent(
      new ImageCreatedEvent({
        id: image.id.value,
        createdById: image.createdById.value,
        createdAt: image.createdAt.value
      })
    )
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

  private _currentVersionId: ImageVersionId
  private _versions: Map<string, ImageVersion> = new Map()

  private constructor(
    id: ImageId,
    createdAt: CreatedAtTimestamp,
    public readonly createdById: ImageCreatorId,
    currentVersionId: ImageVersionId,
    versions: Map<string, ImageVersion>,
    updatedAt: UnixTimestamp
  ) {
    super(id, createdAt, updatedAt)

    this._versions = versions
    this._currentVersionId = currentVersionId

    const latest = [...this.versions.values()].reduce<UnixTimestamp>(
      (accumulator, version) =>
        !accumulator || version.createdAt.value > accumulator.value ? new UnixTimestamp(version.createdAt.value) : accumulator,
      UnixTimestamp.UNKNOWN
    )
    this._updatedAt = latest ?? this.createdAt
    this.assertInvariants()
  }

  get currentVersionId(): ImageVersionId {
    return this._currentVersionId
  }

  get storageKey(): Maybe<ImageStorageKey> {
    return this.getCurrentVersion()?.storageKey ?? null
  }

  get mimeType(): MimeType {
    return this.getCurrentVersion()?.mimeType ?? MimeType.UNKNOWN
  }

  get fileExtension(): string {
    return this.getCurrentVersion()?.mimeType.fileExtension ?? MimeType.UNKNOWN_FILE_EXTENSION
  }

  get size(): FileSize {
    return this.getCurrentVersion()?.size ?? FileSize.UNKNOWN
  }

  get base64(): Maybe<Base64Image> {
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

  public updateWithNewCurrentVersion(newCurrentVersion: ImageVersion, updatedById: UniqueId): this {
    if (this.versions.has(newCurrentVersion.id.value)) {
      throw new ImageVersionAlreadyExistsError(
        `Cannot update current version. Version ${newCurrentVersion.id.value} already exists for image ${this.id.value}`
      )
    }

    if (newCurrentVersion.isStaged || !newCurrentVersion.isCurrent) {
      throw new InvalidVersionStateForCurrentUpdateError(
        `Cannot update current version. Version ${newCurrentVersion.id.value} must be current and not staged`
      )
    }

    if (!newCurrentVersion.imageId.equals(this.id)) {
      throw new ImageVersionBelongsToDifferentImageError(
        `Cannot update current version. New version '${newCurrentVersion.id.value}' belongs to a different image '${newCurrentVersion.imageId.value}', when it's expected to belong to '${this.id.value}'`
      )
    }

    if (newCurrentVersion.storageKey.staged) {
      throw new InvalidImageStorageKeyError(`Cannot update current version. Storage key '${newCurrentVersion.storageKey.value}' is staged`)
    }

    if (this.currentVersionId.equals(ImageVersionId.NOT_SET)) {
      throw new ImageHasNoCurrentVersionError(`Cannot update current version. Image has no current version; use promoteToCurrent instead.`)
    }

    const previousCurrentVersion = this.versions.get(this.currentVersionId.value)
    if (!previousCurrentVersion) {
      throw new PreviousCurrentVersionNotFoundError(
        `Cannot update current version. Previous current version not found, did you mean to use promoteToCurrent instead?`
      )
    }

    // ownerEntityId in the storage key is the owning entity's ID (e.g. story ID), not the image ID.
    // Ensure the new version targets the same owner as the existing current version.
    if (newCurrentVersion.storageKey.ownerEntityId !== previousCurrentVersion.storageKey.ownerEntityId) {
      throw new StorageKeyOwnerEntityIdMismatchError(
        `Cannot update current version. New version '${newCurrentVersion.id.value}' has a different owner in storage key '${newCurrentVersion.storageKey.ownerEntityId}', when it's expected to match existing owner '${previousCurrentVersion.storageKey.ownerEntityId}'`
      )
    }

    if (newCurrentVersion.storageKey.versionId !== newCurrentVersion.id.value) {
      throw new InvalidImageStorageKeyError(
        `Cannot update current version. Version id mismatch between storage key '${newCurrentVersion.storageKey.value}' and version '${newCurrentVersion.id.value}'`
      )
    }

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
      createdAt: new CreatedAtTimestamp(unixtimeNow())
    })

    previousCurrentVersion.markNotCurrent()

    this.versions.set(newVersion.id.value, newVersion)
    this._currentVersionId = newVersion.id
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    this.assertInvariants()
    this.addDomainEvent(
      new ImageUpdatedEvent({
        id: old.id.value,
        oldImageId: old.currentVersionId.equals(ImageVersionId.NOT_SET) ? null : old.currentVersionId.value,
        newImageId: newVersion.id.value,
        updatedAt: this.updatedAt.value,
        updatedById: updatedById.value
      })
    )
    return this
  }

  public stageVersion(imageVersion: ImageVersion): void {
    if (this.versions.has(imageVersion.id.value)) {
      throw new ImageVersionAlreadyExistsError(
        `Cannot stage version. Version '${imageVersion.id.value}' already exists for image '${this.id.value}'`
      )
    }
    if (!imageVersion.isStaged || imageVersion.isCurrent) {
      throw new InvalidVersionStateForStagingError(
        `Cannot stage version. Version '${imageVersion.id.value}' must have isStaged=true and isCurrent=false`
      )
    }
    if (imageVersion.storageKey.staged !== true)
      throw new StagedStorageKeyMismatchError(`Cannot stage version. Version '${imageVersion.id.value}' has a non-staged storage key`)

    this.versions.set(imageVersion.id.value, imageVersion)
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    this.assertInvariants()
    this.addDomainEvent(
      new ImageVersionStagedEvent({
        id: imageVersion.id.value,
        imageVersionId: imageVersion.id.value,
        stagedAt: this.updatedAt.value
      })
    )
  }

  public replaceStagedVersion(originalVersionId: ImageVersionId, newStagedVersion: ImageVersion): this {
    this._replaceStagedVersion(originalVersionId, newStagedVersion)
    this.addDomainEvent(
      new ImageVersionStagedEvent({
        id: newStagedVersion.id.value,
        imageVersionId: newStagedVersion.id.value,
        stagedAt: this.updatedAt.value
      })
    )
    return this
  }

  replaceStagedVersionSilently(originalVersionId: ImageVersionId, newStagedVersion: ImageVersion): this {
    this._replaceStagedVersion(originalVersionId, newStagedVersion)
    return this
  }

  private _replaceStagedVersion(originalVersionId: ImageVersionId, newStagedVersion: ImageVersion): void {
    const original = this.versions.get(originalVersionId.value)
    if (!original)
      throw new ImageVersionNotFoundError(
        `Cannot replace staged version. Version '${originalVersionId.value}' not found for image '${this.id.value}'`
      )

    if (!original.isStaged) throw new CannotReplaceNonStagedVersionError(`Cannot replace non-staged version ${originalVersionId.value}`)

    if (!newStagedVersion.isStaged || newStagedVersion.isCurrent)
      throw new InvalidVersionStateForStagingError(`New version must be staged and not current`)

    if (!newStagedVersion.imageId.equals(this.id))
      throw new ImageVersionBelongsToDifferentImageError(
        `New version '${newStagedVersion.id.value}' belongs to a different image '${newStagedVersion.imageId.value}'`
      )

    if (newStagedVersion.id.equals(originalVersionId)) throw new VersionIdMustDifferError(`New version id must be different from original`)

    if (newStagedVersion.storageKey.staged !== true)
      throw new StagedStorageKeyMismatchError(
        `Cannot replace staged version. Version '${newStagedVersion.id.value}' has a non-staged storage key`
      )

    // replace
    this.versions.delete(originalVersionId.value)
    this.versions.set(newStagedVersion.id.value, newStagedVersion)

    this._updatedAt = new UnixTimestamp(unixtimeNow())

    this.assertInvariants()
  }

  promoteToCurrent(versionId: ImageVersionId, storageKey: ImageStorageKey, promotedById: UniqueId): this {
    const target = this._promoteToCurrent(versionId, storageKey)
    this.addDomainEvent(
      new ImageVersionPromotedToCurrentEvent({
        id: target.id.value,
        imageVersionId: target.id.value,
        promotedAt: this.updatedAt.value,
        promotedById: promotedById.value
      })
    )
    return this
  }

  promoteToCurrentSilently(versionId: ImageVersionId, storageKey: ImageStorageKey): void {
    this._promoteToCurrent(versionId, storageKey)
  }

  private _promoteToCurrent(versionId: ImageVersionId, storageKey: ImageStorageKey): ImageVersion {
    const target = this.versions.get(versionId.value)
    if (!target)
      throw new ImageVersionNotFoundError(`Cannot promote to current. Version '${versionId.value}' not found for image '${this.id.value}'`)
    if (target.isCurrent) return target // idempotent
    if (!target.isStaged) throw new VersionNotStagedError(`Cannot find staged version '${versionId.value}' to promote to current`)
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
    return target
  }

  private getCurrentVersion(): Maybe<ImageVersion> {
    const currentVersion = this.versions.get(this.currentVersionId?.value ?? '')
    if (!currentVersion) {
      return null
    }
    return currentVersion
  }

  public getCurrentVersionOrThrow(): ImageVersion {
    const currentVersion = this.getCurrentVersion()
    if (!currentVersion) {
      throw new CurrentVersionNotFoundError('Cannot get current version. Current version is null')
    }
    return currentVersion
  }

  public getStagedVersion(versionId: ImageVersionId): Maybe<ImageVersion> {
    const stagedVersion = this.versions.get(versionId.value)
    if (!stagedVersion) {
      return null
    }
    return stagedVersion
  }

  public getStagedVersionOrThrow(versionId: ImageVersionId): ImageVersion {
    const stagedVersion = this.getStagedVersion(versionId)
    if (!stagedVersion) {
      throw new StagedVersionNotFoundError(`Cannot get staged version. Staged version '${versionId.value}' not found`)
    }
    return stagedVersion
  }

  public delete(deletedById: UniqueId): this {
    this._delete()
    this.addDomainEvent(
      new ImageDeletedEvent({
        id: this.id.value,
        deletedById: deletedById.value,
        deletedAt: this.updatedAt.value
      })
    )
    return this
  }

  public deleteSilently(): void {
    this._delete()
  }

  private _delete(): void {
    this._currentVersionId = ImageVersionId.NOT_SET
    this.versions.clear()
    this.assertInvariants()
    this._updatedAt = new UnixTimestamp(unixtimeNow())
  }

  public discardStagedVersion(discardedById: UniqueId, versionId: ImageVersionId): this {
    const stagedVersion = this._discardStagedVersion(versionId)
    if (!stagedVersion) return this // idempotent
    this.addDomainEvent(
      new ImageVersionDiscardedEvent({
        id: stagedVersion.id.value,
        imageVersionId: stagedVersion.id.value,
        discardedAt: this.updatedAt.value,
        discardedById: discardedById.value
      })
    )
    return this
  }

  public discardStagedVersionSilently(versionId: ImageVersionId): void {
    this._discardStagedVersion(versionId)
  }

  private _discardStagedVersion(versionId: ImageVersionId): ImageVersion | undefined {
    const stagedVersion = this.versions.get(versionId.value)
    if (!stagedVersion) return // idempotent
    if (!stagedVersion.isStaged) throw new VersionNotStagedError(`Cannot discard non-staged version '${versionId.value}'`)

    this.versions.delete(versionId.value)

    this._updatedAt = new UnixTimestamp(unixtimeNow())
    this.assertInvariants()
    return stagedVersion
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
        throw new ImageVersionBelongsToDifferentImageError(
          `Image version ${imageVersion.id.value} does not belong to image ${this.id.value}`
        )
      if (imageVersion.isCurrent && imageVersion.isStaged)
        throw new VersionStateConflictError(`Image version ${imageVersion.id.value} cannot be both current and staged`)
      if (imageVersion.isStaged && imageVersion.storageKey.staged !== true)
        throw new StagedStorageKeyMismatchError(`Image version ${imageVersion.id.value} is staged but has non-staged storage key`)
      if (imageVersion.isCurrent && imageVersion.storageKey.staged === true)
        throw new StagedStorageKeyMismatchError(`Image version ${imageVersion.id.value} is current but has staged storage key`)
    }

    // at most one current
    const currentVersions = [...this.versions.values()].filter((v) => v.isCurrent)
    if (currentVersions.length > 1) {
      const currentIds = currentVersions.map((v) => v.id.value).join(', ')
      throw new MultipleCurrentVersionsError(`Multiple current versions detected: ${currentIds}`)
    }

    // pointer rules
    if (this.currentVersionId.equals(ImageVersionId.NOT_SET)) {
      if (currentVersions.length !== 0) {
        throw new CurrentVersionPointerInconsistencyError(`Pointer is null but there is a current version`)
      }
    } else {
      const pointed = this.versions.get(this.currentVersionId.value)
      if (!pointed) {
        throw new CurrentVersionPointerReferencesMissingVersionError(`Pointer references missing version ${this.currentVersionId.value}`)
      }
      if (!pointed.isCurrent && !pointed.isStaged) {
        throw new CurrentVersionPointerInvalidStateError(`Pointer is neither current nor staged`)
      }
      if (pointed.isCurrent && pointed.isStaged) {
        throw new VersionStateConflictError(`Pointer is both current and staged`)
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
    return new Image(
      this.id,
      this.createdAt,
      this.createdById,
      this.currentVersionId ?? ImageVersionId.NOT_SET,
      this.cloneVersions(),
      this.updatedAt
    )
  }

  public cloneVersions(): Map<string, ImageVersion> {
    return new Map<string, ImageVersion>(
      [...this.versions.entries()].map(([key, version]) => [
        key,
        ImageVersion.reconstruct({
          id: version.id,
          imageId: version.imageId,
          mimeType: version.mimeType,
          size: version.size,
          base64: version.base64,
          storageKey: version.storageKey,
          isCurrent: version.isCurrent,
          isStaged: version.isStaged,
          createdById: version.createdById,
          createdAt: version.createdAt
        })
      ])
    )
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
  createdAt: CreatedAtTimestamp
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
    public createdAt: CreatedAtTimestamp
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
