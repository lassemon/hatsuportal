import { describe, expect, it } from 'vitest'
import Image, { ImageVersion } from './Image'
import { ImageId } from '../valueObjects/ImageId'
import { CreatedAtTimestamp, UniqueId, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { ImageCreatorId } from '../valueObjects/ImageCreatorId'
import { ImageVersionId } from '../valueObjects/ImageVersionId'
import { MimeType } from '../valueObjects/MimeType'
import { Base64Image } from '../valueObjects/Base64Image'
import { FileSize } from '../valueObjects/FileSize'
import { ImageStorageKey } from '../valueObjects/ImageStorageKey'
import { uuid, EntityTypeEnum, ImageRoleEnum, unixtimeNow } from '@hatsuportal/common'
import { ImageVersionAlreadyExistsError } from '../errors/ImageVersionAlreadyExistsError'
import { InvalidVersionStateForCurrentUpdateError } from '../errors/InvalidVersionStateForCurrentUpdateError'
import { ImageVersionBelongsToDifferentImageError } from '../errors/ImageVersionBelongsToDifferentImageError'
import { InvalidImageStorageKeyError } from '../errors/InvalidImageStorageKeyError'
import { ImageHasNoCurrentVersionError } from '../errors/ImageHasNoCurrentVersionError'
import { PreviousCurrentVersionNotFoundError } from '../errors/PreviousCurrentVersionNotFoundError'
import { StorageKeyOwnerEntityIdMismatchError } from '../errors/StorageKeyOwnerEntityIdMismatchError'
import { ImageVersionNotFoundError } from '../errors/ImageVersionNotFoundError'
import { VersionNotStagedError } from '../errors/VersionNotStagedError'
import { CurrentVersionNotFoundError } from '../errors/CurrentVersionNotFoundError'
import { StagedVersionNotFoundError } from '../errors/StagedVersionNotFoundError'
import { InvalidVersionStateForStagingError } from '../errors/InvalidVersionStateForStagingError'
import { CannotReplaceNonStagedVersionError } from '../errors/CannotReplaceNonStagedVersionError'
import { VersionIdMustDifferError } from '../errors/VersionIdMustDifferError'
import { StagedStorageKeyMismatchError } from '../errors/StagedStorageKeyMismatchError'
import { ImageUpdatedEvent } from '../events/image/ImageEvents'

describe('Image', () => {
  it('can create image with all properties', ({ unitFixture }) => {
    const image = Image.create({
      id: new ImageId(unitFixture.imageDTOMock().id),
      createdAt: new CreatedAtTimestamp(unitFixture.imageDTOMock().createdAt),
      createdById: new ImageCreatorId(unitFixture.imageDTOMock().createdById),
      currentVersionId: new ImageVersionId(unitFixture.imageDTOMock().currentVersionId),
      updatedAt: new UnixTimestamp(unitFixture.imageDTOMock().updatedAt),
      versions: [unitFixture.imageVersionMock()]
    })
    expect(image).to.be.instanceOf(Image)
    expect(image.id.value).to.eq(unitFixture.imageDTOMock().id)
    expect(image.createdAt.value).to.eq(unitFixture.imageDTOMock().createdAt)
    expect(image.createdById.value).to.eq(unitFixture.imageDTOMock().createdById)
    expect(image.currentVersionId?.value).to.eq(unitFixture.imageDTOMock().currentVersionId)
    expect(image.updatedAt.value).to.eq(unitFixture.imageVersionMock().createdAt.value) // images updatedAt is the latest version createdAt if version is set
    expect(image.versions.size).to.eq(1)

    const currentVersion = image.getCurrentVersionOrThrow()
    expect(currentVersion.id.value).to.eq(unitFixture.imageVersionMock().id.value)
    expect(currentVersion.imageId.value).to.eq(unitFixture.imageDTOMock().id)
    expect(currentVersion.mimeType.value).to.eq(unitFixture.imageDTOMock().mimeType)
    expect(currentVersion.size.value).to.eq(unitFixture.imageDTOMock().size)
    expect(currentVersion.base64.value).to.eq(unitFixture.imageDTOMock().base64)
    expect(currentVersion.storageKey.value).to.eq(unitFixture.imageDTOMock().storageKey)
    expect(currentVersion.isCurrent).to.be.true
    expect(currentVersion.isStaged).to.be.false
    expect(currentVersion.createdById.value).to.eq(unitFixture.imageDTOMock().createdById)
    expect(currentVersion.createdAt.value).to.eq(image.updatedAt.value)
  })

  it('sets file extension based on mime type', ({ unitFixture }) => {
    const image = Image.reconstruct({
      id: unitFixture.imageMock().id,
      createdAt: unitFixture.imageMock().createdAt,
      createdById: unitFixture.imageMock().createdById,
      currentVersionId: unitFixture.imageMock().currentVersionId,
      updatedAt: unitFixture.imageMock().updatedAt,
      versions: [
        unitFixture.imageVersionMock({
          mimeType: new MimeType('video/x-msvideo')
        })
      ]
    })
    expect(image.fileExtension).toBe('avi')
  })

  it('can compare images', ({ unitFixture }) => {
    const image = unitFixture.imageMock()
    const otherImageId = new ImageId(uuid())
    const otherImage = Image.create({
      id: otherImageId,
      createdAt: new CreatedAtTimestamp(unitFixture.imageDTOMock().createdAt),
      createdById: new ImageCreatorId(unitFixture.imageDTOMock().createdById),
      currentVersionId: new ImageVersionId(unitFixture.imageDTOMock().currentVersionId),
      updatedAt: new UnixTimestamp(unitFixture.imageDTOMock().updatedAt),
      versions: [unitFixture.imageVersionMock({ imageId: otherImageId })]
    })
    expect(image.equals(image)).toBe(true)
    expect(image.equals(otherImage)).toBe(false)
  })

  it('creates image with proper base64 encoding prefix', ({ unitFixture }) => {
    const image = Image.create({
      id: new ImageId(unitFixture.imageDTOMock().id),
      createdAt: new CreatedAtTimestamp(unitFixture.imageDTOMock().createdAt),
      createdById: new ImageCreatorId(unitFixture.imageDTOMock().createdById),
      currentVersionId: new ImageVersionId(unitFixture.imageDTOMock().currentVersionId),
      updatedAt: new UnixTimestamp(unitFixture.imageDTOMock().updatedAt),
      versions: [unitFixture.imageVersionMock({ base64: Base64Image.create('data:image/png;base64,testbinarystring') })]
    })
    expect(image.base64?.value).toBe('data:image/png;base64,testbinarystring')
  })

  describe('updateWithNewCurrentVersion', () => {
    it('updates current version and emits ImageUpdatedEvent when valid new version provided', ({ unitFixture }) => {
      const image = unitFixture.imageMock()
      const previousCurrentVersionId = image.currentVersionId.value
      const previousCurrentVersion = image.getCurrentVersionOrThrow()
      const ownerEntityId = previousCurrentVersion.storageKey.ownerEntityId
      const newVersionId = uuid()

      const newVersion = ImageVersion.current({
        id: new ImageVersionId(newVersionId),
        imageId: image.id,
        mimeType: new MimeType('image/png'),
        size: new FileSize(2000),
        base64: Base64Image.create('data:image/png;base64,AAAA'),
        storageKey: new ImageStorageKey(
          EntityTypeEnum.Story,
          ImageRoleEnum.Cover,
          ownerEntityId,
          newVersionId,
          unitFixture.sampleUserId,
          new MimeType('image/png'),
          false
        ),
        isCurrent: true,
        isStaged: false,
        createdById: new ImageCreatorId(unitFixture.sampleUserId),
        createdAt: new CreatedAtTimestamp(unixtimeNow())
      })

      image.updateWithNewCurrentVersion(newVersion, new UniqueId(unitFixture.sampleUserId))

      expect(image.currentVersionId.value).toBe(newVersionId)
      expect(image.versions.has(newVersionId)).toBe(true)
      expect(image.versions.get(previousCurrentVersionId)?.isCurrent).toBe(false)
      const events = image.domainEvents
      expect(events.some((e) => e instanceof ImageUpdatedEvent)).toBe(true)
      const updatedEvent = events.find((e) => e instanceof ImageUpdatedEvent) as ImageUpdatedEvent
      expect(updatedEvent.data.oldImageId).toBe(previousCurrentVersionId)
      expect(updatedEvent.data.newImageId).toBe(newVersionId)
    })

    it('allows new current version to have different mime type in storage key than previous version', ({ unitFixture }) => {
      const image = unitFixture.imageMock()
      const previousCurrentVersion = image.getCurrentVersionOrThrow()
      const ownerEntityId = previousCurrentVersion.storageKey.ownerEntityId
      const newVersionId = uuid()

      expect(previousCurrentVersion.storageKey.mimeType.value).toBe('image/png')

      const newVersion = ImageVersion.current({
        id: new ImageVersionId(newVersionId),
        imageId: image.id,
        mimeType: new MimeType('image/jpeg'),
        size: new FileSize(3000),
        base64: Base64Image.create('data:image/jpeg;base64,AAAA'),
        storageKey: new ImageStorageKey(
          EntityTypeEnum.Story,
          ImageRoleEnum.Cover,
          ownerEntityId,
          newVersionId,
          unitFixture.sampleUserId,
          new MimeType('image/jpeg'),
          false
        ),
        isCurrent: true,
        isStaged: false,
        createdById: new ImageCreatorId(unitFixture.sampleUserId),
        createdAt: new CreatedAtTimestamp(unixtimeNow())
      })

      image.updateWithNewCurrentVersion(newVersion, new UniqueId(unitFixture.sampleUserId))

      expect(image.currentVersionId.value).toBe(newVersionId)
      expect(image.mimeType.value).toBe('image/jpeg')
      expect(image.getCurrentVersionOrThrow().storageKey.mimeType.value).toBe('image/jpeg')
    })

    it('throws ImageVersionAlreadyExistsError when version already exists in image', ({ unitFixture }) => {
      const image = unitFixture.imageMock()
      const existingVersion = image.getCurrentVersionOrThrow()

      expect(() => image.updateWithNewCurrentVersion(existingVersion, new UniqueId(unitFixture.sampleUserId))).toThrow(
        ImageVersionAlreadyExistsError
      )
    })

    it('throws InvalidVersionStateForCurrentUpdateError when version is staged', ({ unitFixture }) => {
      const image = unitFixture.imageMock()
      const newVersionId = uuid()
      const stagedVersion = ImageVersion.staged({
        id: new ImageVersionId(newVersionId),
        imageId: image.id,
        mimeType: new MimeType('image/png'),
        size: new FileSize(2000),
        base64: Base64Image.create('data:image/png;base64,AAAA'),
        storageKey: ImageStorageKey.fromString(
          `staged_${EntityTypeEnum.Story}_${ImageRoleEnum.Cover}_${unitFixture.sampleImageId}_${newVersionId}_${unitFixture.sampleUserId}.png`
        ),
        isCurrent: false,
        isStaged: true,
        createdById: new ImageCreatorId(unitFixture.sampleUserId),
        createdAt: new CreatedAtTimestamp(unixtimeNow())
      })

      expect(() => image.updateWithNewCurrentVersion(stagedVersion, new UniqueId(unitFixture.sampleUserId))).toThrow(
        InvalidVersionStateForCurrentUpdateError
      )
    })

    it('throws InvalidVersionStateForCurrentUpdateError when version is not current', ({ unitFixture }) => {
      const image = unitFixture.imageMock()
      const previousCurrentVersion = image.getCurrentVersionOrThrow()
      const ownerEntityId = previousCurrentVersion.storageKey.ownerEntityId
      const newVersionId = uuid()

      const notCurrentVersion = ImageVersion.reconstruct({
        id: new ImageVersionId(newVersionId),
        imageId: image.id,
        mimeType: new MimeType('image/png'),
        size: new FileSize(2000),
        base64: Base64Image.create('data:image/png;base64,AAAA'),
        storageKey: new ImageStorageKey(
          EntityTypeEnum.Story,
          ImageRoleEnum.Cover,
          ownerEntityId,
          newVersionId,
          unitFixture.sampleUserId,
          new MimeType('image/png'),
          false
        ),
        isCurrent: false,
        isStaged: false,
        createdById: new ImageCreatorId(unitFixture.sampleUserId),
        createdAt: new CreatedAtTimestamp(unixtimeNow())
      })

      expect(() => image.updateWithNewCurrentVersion(notCurrentVersion, new UniqueId(unitFixture.sampleUserId))).toThrow(
        InvalidVersionStateForCurrentUpdateError
      )
    })

    it('throws ImageVersionBelongsToDifferentImageError when version belongs to different image', ({ unitFixture }) => {
      const image = unitFixture.imageMock()
      const previousCurrentVersion = image.getCurrentVersionOrThrow()
      const ownerEntityId = previousCurrentVersion.storageKey.ownerEntityId
      const newVersionId = uuid()
      const differentImageId = new ImageId(uuid())

      const newVersion = ImageVersion.current({
        id: new ImageVersionId(newVersionId),
        imageId: differentImageId,
        mimeType: new MimeType('image/png'),
        size: new FileSize(2000),
        base64: Base64Image.create('data:image/png;base64,AAAA'),
        storageKey: new ImageStorageKey(
          EntityTypeEnum.Story,
          ImageRoleEnum.Cover,
          ownerEntityId,
          newVersionId,
          unitFixture.sampleUserId,
          new MimeType('image/png'),
          false
        ),
        isCurrent: true,
        isStaged: false,
        createdById: new ImageCreatorId(unitFixture.sampleUserId),
        createdAt: new CreatedAtTimestamp(unixtimeNow())
      })

      expect(() => image.updateWithNewCurrentVersion(newVersion, new UniqueId(unitFixture.sampleUserId))).toThrow(
        ImageVersionBelongsToDifferentImageError
      )
    })

    it('throws InvalidImageStorageKeyError when storage key is staged', ({ unitFixture }) => {
      const image = unitFixture.imageMock()
      const previousCurrentVersion = image.getCurrentVersionOrThrow()
      const ownerEntityId = previousCurrentVersion.storageKey.ownerEntityId
      const newVersionId = uuid()

      const newVersionWithStagedKey = ImageVersion.current({
        id: new ImageVersionId(newVersionId),
        imageId: image.id,
        mimeType: new MimeType('image/png'),
        size: new FileSize(2000),
        base64: Base64Image.create('data:image/png;base64,AAAA'),
        storageKey: new ImageStorageKey(
          EntityTypeEnum.Story,
          ImageRoleEnum.Cover,
          ownerEntityId,
          newVersionId,
          unitFixture.sampleUserId,
          new MimeType('image/png'),
          true
        ),
        isCurrent: true,
        isStaged: false,
        createdById: new ImageCreatorId(unitFixture.sampleUserId),
        createdAt: new CreatedAtTimestamp(unixtimeNow())
      })

      expect(() => image.updateWithNewCurrentVersion(newVersionWithStagedKey, new UniqueId(unitFixture.sampleUserId))).toThrow(
        InvalidImageStorageKeyError
      )
    })

    it('throws ImageHasNoCurrentVersionError when image has no current version', ({ unitFixture }) => {
      const image = Image.reconstruct({
        id: new ImageId(unitFixture.sampleImageId),
        createdAt: new CreatedAtTimestamp(unitFixture.imageDTOMock().createdAt),
        createdById: new ImageCreatorId(unitFixture.sampleUserId),
        currentVersionId: ImageVersionId.NOT_SET,
        versions: [],
        updatedAt: new UnixTimestamp(unitFixture.imageDTOMock().updatedAt)
      })
      const newVersionId = uuid()

      const newVersion = ImageVersion.current({
        id: new ImageVersionId(newVersionId),
        imageId: image.id,
        mimeType: new MimeType('image/png'),
        size: new FileSize(2000),
        base64: Base64Image.create('data:image/png;base64,AAAA'),
        storageKey: new ImageStorageKey(
          EntityTypeEnum.Story,
          ImageRoleEnum.Cover,
          unitFixture.sampleImageId,
          newVersionId,
          unitFixture.sampleUserId,
          new MimeType('image/png'),
          false
        ),
        isCurrent: true,
        isStaged: false,
        createdById: new ImageCreatorId(unitFixture.sampleUserId),
        createdAt: new CreatedAtTimestamp(unixtimeNow())
      })

      expect(() => image.updateWithNewCurrentVersion(newVersion, new UniqueId(unitFixture.sampleUserId))).toThrow(
        ImageHasNoCurrentVersionError
      )
    })

    it('throws PreviousCurrentVersionNotFoundError when previous current version not in versions map', ({ unitFixture }) => {
      const image = unitFixture.imageMock()
      const previousCurrentVersion = image.getCurrentVersionOrThrow()
      const ownerEntityId = previousCurrentVersion.storageKey.ownerEntityId
      const newVersionId = uuid()

      image.versions.delete(image.currentVersionId.value)

      const newVersion = ImageVersion.current({
        id: new ImageVersionId(newVersionId),
        imageId: image.id,
        mimeType: new MimeType('image/png'),
        size: new FileSize(2000),
        base64: Base64Image.create('data:image/png;base64,AAAA'),
        storageKey: new ImageStorageKey(
          EntityTypeEnum.Story,
          ImageRoleEnum.Cover,
          ownerEntityId,
          newVersionId,
          unitFixture.sampleUserId,
          new MimeType('image/png'),
          false
        ),
        isCurrent: true,
        isStaged: false,
        createdById: new ImageCreatorId(unitFixture.sampleUserId),
        createdAt: new CreatedAtTimestamp(unixtimeNow())
      })

      expect(() => image.updateWithNewCurrentVersion(newVersion, new UniqueId(unitFixture.sampleUserId))).toThrow(
        PreviousCurrentVersionNotFoundError
      )
    })

    it('throws StorageKeyOwnerEntityIdMismatchError when storage key ownerEntityId differs', ({ unitFixture }) => {
      const image = unitFixture.imageMock()
      const newVersionId = uuid()
      const differentOwnerEntityId = uuid()

      const newVersion = ImageVersion.current({
        id: new ImageVersionId(newVersionId),
        imageId: image.id,
        mimeType: new MimeType('image/png'),
        size: new FileSize(2000),
        base64: Base64Image.create('data:image/png;base64,AAAA'),
        storageKey: new ImageStorageKey(
          EntityTypeEnum.Story,
          ImageRoleEnum.Cover,
          differentOwnerEntityId,
          newVersionId,
          unitFixture.sampleUserId,
          new MimeType('image/png'),
          false
        ),
        isCurrent: true,
        isStaged: false,
        createdById: new ImageCreatorId(unitFixture.sampleUserId),
        createdAt: new CreatedAtTimestamp(unixtimeNow())
      })

      expect(() => image.updateWithNewCurrentVersion(newVersion, new UniqueId(unitFixture.sampleUserId))).toThrow(
        StorageKeyOwnerEntityIdMismatchError
      )
    })

    it('throws InvalidImageStorageKeyError when storage key versionId does not match version id', ({ unitFixture }) => {
      const image = unitFixture.imageMock()
      const previousCurrentVersion = image.getCurrentVersionOrThrow()
      const ownerEntityId = previousCurrentVersion.storageKey.ownerEntityId
      const newVersionId = uuid()
      const mismatchedStorageKeyVersionId = uuid()

      const newVersion = ImageVersion.current({
        id: new ImageVersionId(newVersionId),
        imageId: image.id,
        mimeType: new MimeType('image/png'),
        size: new FileSize(2000),
        base64: Base64Image.create('data:image/png;base64,AAAA'),
        storageKey: new ImageStorageKey(
          EntityTypeEnum.Story,
          ImageRoleEnum.Cover,
          ownerEntityId,
          mismatchedStorageKeyVersionId,
          unitFixture.sampleUserId,
          new MimeType('image/png'),
          false
        ),
        isCurrent: true,
        isStaged: false,
        createdById: new ImageCreatorId(unitFixture.sampleUserId),
        createdAt: new CreatedAtTimestamp(unixtimeNow())
      })

      expect(() => image.updateWithNewCurrentVersion(newVersion, new UniqueId(unitFixture.sampleUserId))).toThrow(
        InvalidImageStorageKeyError
      )
    })
  })

  describe('factory helpers', () => {
    it('canCreate and assertCanCreate accept plain serializable props', ({ unitFixture }) => {
      const dto = unitFixture.imageDTOMock()
      const plainProps = {
        id: dto.id,
        createdAt: dto.createdAt,
        createdById: dto.createdById,
        currentVersionId: dto.currentVersionId,
        updatedAt: dto.updatedAt,
        versions: [
          {
            id: dto.currentVersionId,
            imageId: dto.id,
            mimeType: dto.mimeType,
            size: dto.size,
            base64: dto.base64,
            storageKey: dto.storageKey,
            isCurrent: true,
            isStaged: false,
            createdById: dto.createdById,
            createdAt: dto.updatedAt
          }
        ]
      }

      expect(Image.canCreate(plainProps)).toBe(true)
      expect(() => Image.assertCanCreate(plainProps)).not.toThrow()
    })

    it('tryCreate returns success for valid props', ({ unitFixture }) => {
      const result = Image.tryCreate({
        id: new ImageId(unitFixture.sampleImageId),
        createdAt: new CreatedAtTimestamp(unitFixture.imageDTOMock().createdAt),
        createdById: new ImageCreatorId(unitFixture.sampleUserId),
        currentVersionId: new ImageVersionId(unitFixture.sampleImageVersionId),
        updatedAt: new UnixTimestamp(unitFixture.imageDTOMock().updatedAt),
        versions: [unitFixture.imageVersionMock()]
      })

      expect(result.isSuccess()).toBe(true)
      expect(result.value).toBeInstanceOf(Image)
    })

    it('tryCreate returns failure for invalid props', () => {
      const result = Image.tryCreate({ id: 'bad' } as never)

      expect(result.isFailure()).toBe(true)
    })
  })

  describe('lifecycle operations', () => {
    it('deletes image and emits ImageDeletedEvent', ({ unitFixture }) => {
      const image = unitFixture.imageMock()
      image.delete(new UniqueId(unitFixture.sampleUserId))

      expect(image.versions.size).toBe(0)
      expect(image.domainEvents.some((event) => event.eventType === 'ImageDeleted')).toBe(true)
    })

    it('deletes image silently without emitting events', ({ unitFixture }) => {
      const image = unitFixture.imageMock()
      image.deleteSilently()

      expect(image.versions.size).toBe(0)
      expect(image.domainEvents).toHaveLength(0)
    })

    it('promoteToCurrent rejects a staged permanent storage key', ({ unitFixture }) => {
      const image = unitFixture.imageWithCurrentAndStagedVersionMock()
      const stagedKey = ImageStorageKey.fromString(unitFixture.sampleStagedImageStorageKeyWithVersionId)

      expect(() => image.promoteToCurrent(new ImageVersionId(unitFixture.sampleImageVersionId), stagedKey)).toThrow(
        InvalidImageStorageKeyError
      )
    })

    it('promotes first publication from NOT_SET with a single staged version', ({ unitFixture }) => {
      const stagedVersionId = uuid()
      const stagedVersion = ImageVersion.staged({
        id: new ImageVersionId(stagedVersionId),
        imageId: new ImageId(unitFixture.sampleImageId),
        mimeType: new MimeType('image/png'),
        size: new FileSize(100),
        base64: Base64Image.create('data:image/png;base64,AAAA'),
        storageKey: ImageStorageKey.fromString(
          `staged_story_cover_${unitFixture.sampleImageId}_${stagedVersionId}_${unitFixture.sampleUserId}.png`
        ),
        isCurrent: false,
        isStaged: true,
        createdById: new ImageCreatorId(unitFixture.sampleUserId),
        createdAt: new CreatedAtTimestamp(unixtimeNow())
      })
      const image = Image.reconstruct({
        id: new ImageId(unitFixture.sampleImageId),
        createdAt: new CreatedAtTimestamp(unixtimeNow()),
        createdById: new ImageCreatorId(unitFixture.sampleUserId),
        currentVersionId: ImageVersionId.NOT_SET,
        versions: [stagedVersion],
        updatedAt: new UnixTimestamp(unixtimeNow())
      })
      const permanentKey = ImageStorageKey.fromString(
        `story_cover_${unitFixture.sampleImageId}_${stagedVersionId}_${unitFixture.sampleUserId}.png`
      )

      image.promoteToCurrent(new ImageVersionId(stagedVersionId), permanentKey)

      expect(image.currentVersionId.value).toBe(stagedVersionId)
      expect(image.getCurrentVersionOrThrow().isCurrent).toBe(true)
      expect(image.getCurrentVersionOrThrow().isStaged).toBe(false)
    })

    it('promotes staged version to current without emitting domain events', ({ unitFixture }) => {
      const image = unitFixture.imageWithCurrentAndStagedVersionMock()
      const permanentKey = ImageStorageKey.fromString(
        `story_cover_${unitFixture.sampleImageId}_${unitFixture.sampleImageVersionId}_${unitFixture.sampleUserId}.png`
      )

      image.promoteToCurrent(new ImageVersionId(unitFixture.sampleImageVersionId), permanentKey)

      expect(image.currentVersionId.value).toBe(unitFixture.sampleImageVersionId)
      expect(image.domainEvents.some((event) => event.eventType === 'ImageVersionPromotedToCurrent')).toBe(false)
    })

    it('stages and replaces staged versions', ({ unitFixture }) => {
      const image = unitFixture.imageMock()
      const stagedVersionId = uuid()
      const stagedVersion = ImageVersion.staged({
        id: new ImageVersionId(stagedVersionId),
        imageId: image.id,
        mimeType: new MimeType('image/png'),
        size: new FileSize(100),
        base64: Base64Image.create('data:image/png;base64,AAAA'),
        storageKey: ImageStorageKey.fromString(
          `staged_story_cover_${unitFixture.sampleImageId}_${stagedVersionId}_${unitFixture.sampleUserId}.png`
        ),
        isCurrent: false,
        isStaged: true,
        createdById: new ImageCreatorId(unitFixture.sampleUserId),
        createdAt: new CreatedAtTimestamp(unixtimeNow())
      })

      image.stageVersion(stagedVersion)
      expect(image.domainEvents.some((event) => event.eventType === 'ImageVersionStaged')).toBe(false)

      const replacementId = uuid()
      const replacement = ImageVersion.staged({
        id: new ImageVersionId(replacementId),
        imageId: image.id,
        mimeType: new MimeType('image/png'),
        size: new FileSize(100),
        base64: Base64Image.create('data:image/png;base64,BBBB'),
        storageKey: ImageStorageKey.fromString(
          `staged_story_cover_${unitFixture.sampleImageId}_${replacementId}_${unitFixture.sampleUserId}.png`
        ),
        isCurrent: false,
        isStaged: true,
        createdById: new ImageCreatorId(unitFixture.sampleUserId),
        createdAt: new CreatedAtTimestamp(unixtimeNow())
      })

      image.replaceStagedVersion(new ImageVersionId(stagedVersionId), replacement)
      expect(image.versions.has(replacementId)).toBe(true)
      expect(image.versions.has(stagedVersionId)).toBe(false)
    })

    it('returns idempotently when promoting an already current version', ({ unitFixture }) => {
      const image = unitFixture.imageMock()
      const currentKey = ImageStorageKey.fromString(
        `story_cover_${unitFixture.sampleImageId}_${unitFixture.sampleImageVersionId}_${unitFixture.sampleUserId}.png`
      )

      expect(() => image.promoteToCurrent(new ImageVersionId(unitFixture.sampleImageVersionId), currentKey)).not.toThrow()
    })

    it('throws when promoting a non-staged version', ({ unitFixture }) => {
      const image = unitFixture.imageMock()
      const oldVersionId = uuid()
      const oldVersion = ImageVersion.reconstruct({
        id: new ImageVersionId(oldVersionId),
        imageId: image.id,
        mimeType: new MimeType('image/png'),
        size: new FileSize(100),
        base64: Base64Image.create('data:image/png;base64,AAAA'),
        storageKey: ImageStorageKey.fromString(`story_cover_${unitFixture.sampleImageId}_${oldVersionId}_${unitFixture.sampleUserId}.png`),
        isCurrent: false,
        isStaged: false,
        createdById: new ImageCreatorId(unitFixture.sampleUserId),
        createdAt: new CreatedAtTimestamp(unixtimeNow())
      })
      image.versions.set(oldVersionId, oldVersion)

      const key = ImageStorageKey.fromString(`story_cover_${unitFixture.sampleImageId}_${oldVersionId}_${unitFixture.sampleUserId}.png`)

      expect(() => image.promoteToCurrent(new ImageVersionId(oldVersionId), key)).toThrow(VersionNotStagedError)
    })

    it('throws when replacing a missing staged version', ({ unitFixture }) => {
      const image = unitFixture.imageMock()

      expect(() => image.replaceStagedVersion(new ImageVersionId(uuid()), unitFixture.stagedImageMock().toDomainVersion())).toThrow(
        ImageVersionNotFoundError
      )
    })

    it('getStagedVersion returns null and getStagedVersionOrThrow throws when missing', ({ unitFixture }) => {
      const image = unitFixture.imageMock()
      const missingId = new ImageVersionId(uuid())

      expect(image.getStagedVersion(missingId)).toBeNull()
      expect(() => image.getStagedVersionOrThrow(missingId)).toThrow(StagedVersionNotFoundError)
    })

    it('getCurrentVersionOrThrow throws after image is deleted', ({ unitFixture }) => {
      const image = unitFixture.imageMock()
      image.deleteSilently()

      expect(() => image.getCurrentVersionOrThrow()).toThrow(CurrentVersionNotFoundError)
    })

    it('stageVersion throws when version already exists or has invalid state', ({ unitFixture }) => {
      const image = unitFixture.imageMock()
      const existing = image.getCurrentVersionOrThrow()

      expect(() => image.stageVersion(existing)).toThrow(ImageVersionAlreadyExistsError)

      const invalidVersion = ImageVersion.reconstruct({
        ...unitFixture.imageVersionMock({ id: new ImageVersionId(uuid()) }),
        isCurrent: false,
        isStaged: false
      })
      expect(() => image.stageVersion(invalidVersion)).toThrow(InvalidVersionStateForStagingError)
    })

    it('replaceStagedVersion rejects invalid replacement versions', ({ unitFixture }) => {
      const image = unitFixture.imageWithCurrentAndStagedVersionMock()
      const stagedId = new ImageVersionId(unitFixture.sampleImageVersionId)
      const staged = image.getStagedVersionOrThrow(stagedId)

      const wrongImageVersion = ImageVersion.staged({
        id: new ImageVersionId(uuid()),
        imageId: new ImageId(uuid()),
        mimeType: staged.mimeType,
        size: staged.size,
        base64: staged.base64,
        storageKey: staged.storageKey,
        isCurrent: false,
        isStaged: true,
        createdById: staged.createdById,
        createdAt: staged.createdAt
      })
      expect(() => image.replaceStagedVersion(stagedId, wrongImageVersion)).toThrow(ImageVersionBelongsToDifferentImageError)

      const sameIdVersion = ImageVersion.staged({
        id: stagedId,
        imageId: image.id,
        mimeType: staged.mimeType,
        size: staged.size,
        base64: staged.base64,
        storageKey: staged.storageKey,
        isCurrent: false,
        isStaged: true,
        createdById: staged.createdById,
        createdAt: staged.createdAt
      })
      expect(() => image.replaceStagedVersion(stagedId, sameIdVersion)).toThrow(VersionIdMustDifferError)

      const nonStagedKeyVersion = ImageVersion.staged({
        id: new ImageVersionId(uuid()),
        imageId: image.id,
        mimeType: staged.mimeType,
        size: staged.size,
        base64: staged.base64,
        storageKey: ImageStorageKey.fromString(unitFixture.sampleImageStorageKey),
        isCurrent: false,
        isStaged: true,
        createdById: staged.createdById,
        createdAt: staged.createdAt
      })
      expect(() => image.replaceStagedVersion(stagedId, nonStagedKeyVersion)).toThrow(StagedStorageKeyMismatchError)
    })

    it('replaceStagedVersion rejects replacing a non-staged version', ({ unitFixture }) => {
      const image = unitFixture.imageMock()
      const currentId = image.currentVersionId
      const replacement = unitFixture.stagedImageMock().toDomainVersion()

      expect(() => image.replaceStagedVersion(currentId, replacement)).toThrow(CannotReplaceNonStagedVersionError)
    })

    it('tracks and clears domain events', ({ unitFixture }) => {
      const image = unitFixture.imageMock()
      image.delete(new UniqueId(unitFixture.sampleUserId))

      expect(image.domainEvents.length).toBeGreaterThan(0)
      image.clearEvents()
      expect(image.domainEvents).toHaveLength(0)
    })

    it('serializes image and clones a detached copy', ({ unitFixture }) => {
      const image = unitFixture.imageMock()
      const serialized = image.serialize()
      const clone = image.clone()

      expect(serialized.id).toBe(unitFixture.sampleImageId)
      expect(clone.id.value).toBe(image.id.value)
      expect(clone).not.toBe(image)
    })

    it('exposes ImageVersion serialize and state transitions', ({ unitFixture }) => {
      const version = unitFixture.imageVersionMock()
      version.markNotCurrent()
      expect(version.isCurrent).toBe(false)

      const promotedKey = ImageStorageKey.fromString(unitFixture.sampleImageStorageKey)
      version.promoteToCurrent(promotedKey)
      expect(version.isStaged).toBe(false)
      expect(version.serialize()).toMatchObject({ id: unitFixture.sampleImageVersionId })
    })
  })
})
