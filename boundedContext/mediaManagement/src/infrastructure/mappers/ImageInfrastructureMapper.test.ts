import { describe, expect, it, vi } from 'vitest'
import { DataPersistenceError } from '@hatsuportal/platform'
import { IncompleteImageError } from '../../application'
import {
  Base64Image,
  FileSize,
  Image,
  ImageCreatorId,
  ImageId,
  ImageStorageKey,
  ImageVersion,
  ImageVersionId,
  MimeType,
  StagedImage,
  StagedStorageKeyMismatchError
} from '../../domain'
import { ImageApplicationMapper } from '../../application/mappers/ImageApplicationMapper'
import { ImagePromotionLockDTO } from '../../application/dtos/ImagePromotionLockDTO'
import { ImageInfrastructureMapper } from './ImageInfrastructureMapper'
import { CreatedAtTimestamp, UnixTimestamp } from '@hatsuportal/shared-kernel'

describe('ImageInfrastructureMapper', () => {
  const imageMapper = new ImageInfrastructureMapper()

  it('converts staged image entity to insert query for image metadata main table', ({ unitFixture }) => {
    const image = unitFixture.stagedImageMock()
    const insertQuery = imageMapper.toInsertStagedImageQuery(image)

    expect(insertQuery.id).toBe(image.imageId.value)
    expect(insertQuery.createdById).toBe(image.createdById.value)
    expect(insertQuery.createdAt).toBe(image.createdAt.value)
    expect(insertQuery.currentVersionId).toBe(null)
  })

  it('converts staged image entity to staged version insert query', ({ unitFixture }) => {
    const image = unitFixture.stagedImageMock()
    const insertQuery = imageMapper.toInsertStagedImageVersionQuery(image)

    expect(insertQuery.id).toBe(image.id.value)
    expect(insertQuery.isStaged).toBe(true)
    expect(insertQuery.isCurrent).toBe(false)
  })

  it('throws when staged version insert query receives non-staged storage key', ({ unitFixture }) => {
    const staged = unitFixture.stagedImageMock()
    const invalidStaged = {
      id: staged.id,
      imageId: staged.imageId,
      storageKey: ImageStorageKey.fromString(unitFixture.sampleImageStorageKey),
      mimeType: staged.mimeType,
      size: staged.size,
      createdAt: staged.createdAt
    } as StagedImage

    expect(() => imageMapper.toInsertStagedImageVersionQuery(invalidStaged)).toThrow(StagedStorageKeyMismatchError)
  })

  it('converts current image entity to insert query for image metadata main table', ({ unitFixture }) => {
    const image = unitFixture.currentImageMock()
    const insertQuery = imageMapper.toInsertImageQuery(image)

    expect(insertQuery.id).toBe(image.id.value)
    expect(insertQuery.createdById).toBe(image.createdById.value)
    expect(insertQuery.createdAt).toBe(image.createdAt.value)
    expect(insertQuery.currentVersionId).toBe(image.currentVersionId.value)
  })

  it('converts current image entity to insert query for image versions table', ({ unitFixture }) => {
    const image = unitFixture.currentImageMock()
    const insertQuery = imageMapper.toInsertCurrentImageVersionQuery(image)

    expect(insertQuery.id).toBe(image.currentVersionId.value)
    expect(insertQuery.imageId).toBe(image.id.value)
    expect(insertQuery.storageKey).toBe(image.storageKey.value)
    expect(insertQuery.mimeType).toBe(image.mimeType.value)
    expect(insertQuery.size).toBe(image.size.value)
    expect(insertQuery.isCurrent).toBe(true)
    expect(insertQuery.isStaged).toBe(false)
    expect(insertQuery.createdAt).toBe(image.createdAt.value)
  })

  it('maps current image to DTO', ({ unitFixture }) => {
    const image = unitFixture.currentImageMock()
    const dto = imageMapper.currentImageToDTO(image)

    expect(dto.id).toBe(image.id.value)
    expect(dto.storageKey).toBe(image.storageKey.value)
    expect(dto.isCurrent).toBe(true)
    expect(dto.isStaged).toBe(false)
  })

  it('converts image metadata database record and base64 string to DTO', ({ unitFixture }) => {
    const metadataRecord = unitFixture.imageMetadataDatabaseRecord()
    const dto = imageMapper.toDTO(metadataRecord)

    expect(dto.id).toBe(metadataRecord.id)
    expect(dto.storageKey).toBe(metadataRecord.storageKey)
    expect(dto.mimeType).toBe(metadataRecord.mimeType)
    expect(dto.size).toBe(metadataRecord.size)
    expect(dto.createdById).toBe(metadataRecord.createdById)
    expect(dto.versionId).toBe(metadataRecord.versionId)
    expect(dto.currentVersionPointer).toBe(metadataRecord.currentVersionId)
    expect(dto.isCurrent).toBe(metadataRecord.isCurrent)
    expect(dto.isStaged).toBe(metadataRecord.isStaged)
    expect(dto.createdAt).toBe(metadataRecord.createdAt)
    expect(dto.updatedAt).toBe(metadataRecord.updatedAt)
  })

  it('throws IncompleteImageError when metadata has no version id', ({ unitFixture }) => {
    const metadataRecord = {
      ...unitFixture.imageMetadataDatabaseRecord(),
      currentVersionId: null,
      versionId: null
    }

    expect(() => imageMapper.toDTO(metadataRecord)).toThrow(IncompleteImageError)
  })

  it('maps versionId and currentVersionPointer independently for staged cover-replace row', ({ unitFixture }) => {
    const record = {
      ...unitFixture.imageMetadataDatabaseRecord(),
      versionId: unitFixture.sampleImageVersionId,
      currentVersionId: unitFixture.sampleCurrentVersionId,
      isStaged: true,
      isCurrent: false
    }
    const dto = imageMapper.toDTO(record)

    expect(dto.versionId).toBe(unitFixture.sampleImageVersionId)
    expect(dto.currentVersionPointer).toBe(unitFixture.sampleCurrentVersionId)
  })

  it('maps first-publication staged row with null pointer', ({ unitFixture }) => {
    const record = {
      ...unitFixture.imageMetadataDatabaseRecord(),
      versionId: unitFixture.sampleImageVersionId,
      currentVersionId: null,
      isStaged: true,
      isCurrent: false
    }
    const dto = imageMapper.toDTO(record)

    expect(dto.versionId).toBe(unitFixture.sampleImageVersionId)
    expect(dto.currentVersionPointer).toBeNull()
  })

  it('maps version database record to version DTO', ({ unitFixture }) => {
    const metadataRecord = unitFixture.imageMetadataDatabaseRecord()
    const versionId = metadataRecord.versionId ?? unitFixture.sampleImageVersionId
    const versionDto = imageMapper.toVersionDTO({
      id: versionId,
      imageId: metadataRecord.id,
      storageKey: metadataRecord.storageKey,
      mimeType: metadataRecord.mimeType,
      size: metadataRecord.size,
      isCurrent: metadataRecord.isCurrent,
      isStaged: metadataRecord.isStaged,
      createdAt: metadataRecord.updatedAt
    })

    expect(versionDto.id).toBe(versionId)
    expect(versionDto.imageId).toBe(metadataRecord.id)
  })

  it('reconstructs staged image domain entity from metadata and base64', ({ unitFixture }) => {
    const metadataRecord = {
      ...unitFixture.imageMetadataDatabaseRecord(),
      isStaged: true,
      isCurrent: false,
      storageKey: unitFixture.sampleStagedImageStorageKeyWithVersionId
    }

    const image = imageMapper.stagedImageToDomainEntity(metadataRecord, unitFixture.base64ImageStringMock())

    expect(image.id.value).toBe(metadataRecord.id)
    expect([...image.versions.values()][0].isStaged).toBe(true)
  })

  it('reconstructs image with multiple versions', ({ unitFixture }) => {
    const metadataRecord = unitFixture.imageMetadataDatabaseRecord()
    const image = imageMapper.toDomainEntityWithVersions(metadataRecord, [
      {
        id: unitFixture.sampleCurrentVersionId,
        imageId: unitFixture.sampleImageId,
        storageKey: unitFixture.sampleImageStorageKey,
        mimeType: 'image/png',
        size: 100,
        base64: unitFixture.base64ImageStringMock(),
        isCurrent: true,
        isStaged: false,
        createdAt: metadataRecord.updatedAt
      },
      {
        id: unitFixture.sampleImageVersionId,
        imageId: unitFixture.sampleImageId,
        storageKey: unitFixture.sampleStagedImageStorageKey,
        mimeType: 'image/png',
        size: 100,
        base64: unitFixture.base64ImageStringMock(),
        isCurrent: false,
        isStaged: true,
        createdAt: metadataRecord.updatedAt
      }
    ])

    expect(image.id.value).toBe(unitFixture.sampleImageId)
    expect(image.versions).toHaveLength(2)
  })

  it('throws IncompleteImageError when no current version exists in version list', ({ unitFixture }) => {
    const metadataRecord = unitFixture.imageMetadataDatabaseRecord()

    expect(() =>
      imageMapper.toDomainEntityWithVersions(metadataRecord, [
        {
          id: unitFixture.sampleImageVersionId,
          imageId: unitFixture.sampleImageId,
          storageKey: unitFixture.sampleStagedImageStorageKey,
          mimeType: 'image/png',
          size: 100,
          base64: unitFixture.base64ImageStringMock(),
          isCurrent: false,
          isStaged: true,
          createdAt: metadataRecord.updatedAt
        }
      ])
    ).toThrow(IncompleteImageError)
  })

  describe('toPromotionUpdate', () => {
    const applicationMapper = new ImageApplicationMapper()

    it('maps first publication with no previous current version', ({ unitFixture }) => {
      const stagedMetadata = {
        ...unitFixture.imageMetadataDTO(),
        versionId: unitFixture.sampleImageVersionId,
        currentVersionPointer: null,
        isCurrent: false,
        isStaged: true,
        storageKey: unitFixture.sampleStagedImageStorageKeyWithVersionId
      }
      const lock: ImagePromotionLockDTO = { staged: stagedMetadata, publishedCurrent: null }
      const stagedVersionId = new ImageVersionId(unitFixture.sampleImageVersionId)
      const image = applicationMapper.toImageForPromotion(lock)
      const permanentKey = ImageStorageKey.fromString(
        `story_cover_${unitFixture.sampleImageId}_${unitFixture.sampleImageVersionId}_${unitFixture.sampleUserId}.png`
      )
      image.promoteToCurrent(stagedVersionId, permanentKey)

      const updates = imageMapper.toPromotionUpdate(image)

      expect(updates.imageId).toBe(unitFixture.sampleImageId)
      expect(updates.currentVersionId).toBe(unitFixture.sampleImageVersionId)
      expect(updates.previousCurrentVersionId).toBeNull()
      expect(updates.promotedVersion).toEqual({
        id: unitFixture.sampleImageVersionId,
        storageKey: permanentKey.value,
        isCurrent: true,
        isStaged: false
      })
    })

    it('maps cover-replace with previous current version id', ({ unitFixture }) => {
      const stagedMetadata = {
        ...unitFixture.imageMetadataDTO(),
        versionId: unitFixture.sampleImageVersionId,
        currentVersionPointer: unitFixture.sampleCurrentVersionId,
        isCurrent: false,
        isStaged: true,
        storageKey: unitFixture.sampleStagedImageStorageKeyWithVersionId
      }
      const lock: ImagePromotionLockDTO = {
        staged: stagedMetadata,
        publishedCurrent: {
          id: unitFixture.sampleCurrentVersionId,
          imageId: unitFixture.sampleImageId,
          storageKey: unitFixture.sampleImageStorageKey,
          mimeType: 'image/png',
          size: 100,
          isCurrent: true,
          isStaged: false,
          createdAt: unitFixture.imageMetadataDTO().updatedAt
        }
      }
      const stagedVersionId = new ImageVersionId(unitFixture.sampleImageVersionId)
      const image = applicationMapper.toImageForPromotion(lock)
      const permanentKey = ImageStorageKey.fromString(
        `story_cover_${unitFixture.sampleImageId}_${unitFixture.sampleImageVersionId}_${unitFixture.sampleUserId}.png`
      )
      image.promoteToCurrent(stagedVersionId, permanentKey)

      const updates = imageMapper.toPromotionUpdate(image)

      expect(updates.previousCurrentVersionId).toBe(unitFixture.sampleCurrentVersionId)
      expect(updates.promotedVersion.id).toBe(unitFixture.sampleImageVersionId)
      expect(updates.currentVersionId).toBe(unitFixture.sampleImageVersionId)
    })

    it('throws when partial aggregate has more than one demoted version', ({ unitFixture }) => {
      const demotedA = ImageVersion.reconstruct({
        id: new ImageVersionId('test3b19-version-4792-a2f0-f95ccab91'),
        imageId: new ImageId(unitFixture.sampleImageId),
        mimeType: new MimeType('image/png'),
        size: new FileSize(100),
        base64: Base64Image.forExternalStorage(new MimeType('image/png')),
        storageKey: ImageStorageKey.fromString(unitFixture.sampleImageStorageKey),
        isCurrent: false,
        isStaged: false,
        createdById: new ImageCreatorId(unitFixture.sampleUserId),
        createdAt: new CreatedAtTimestamp(unitFixture.imageMetadataDTO().updatedAt)
      })
      const demotedB = ImageVersion.reconstruct({
        id: new ImageVersionId('test4b19-version-4792-a2f0-f95ccab90'),
        imageId: new ImageId(unitFixture.sampleImageId),
        mimeType: new MimeType('image/png'),
        size: new FileSize(100),
        base64: Base64Image.forExternalStorage(new MimeType('image/png')),
        storageKey: ImageStorageKey.fromString(unitFixture.sampleStagedImageStorageKey),
        isCurrent: false,
        isStaged: false,
        createdById: new ImageCreatorId(unitFixture.sampleUserId),
        createdAt: new CreatedAtTimestamp(unitFixture.imageMetadataDTO().updatedAt)
      })
      const current = ImageVersion.reconstruct({
        id: new ImageVersionId(unitFixture.sampleImageVersionId),
        imageId: new ImageId(unitFixture.sampleImageId),
        mimeType: new MimeType('image/png'),
        size: new FileSize(100),
        base64: Base64Image.forExternalStorage(new MimeType('image/png')),
        storageKey: ImageStorageKey.fromString(unitFixture.sampleImageStorageKey),
        isCurrent: true,
        isStaged: false,
        createdById: new ImageCreatorId(unitFixture.sampleUserId),
        createdAt: new CreatedAtTimestamp(unitFixture.imageMetadataDTO().updatedAt)
      })
      const image = Image.reconstruct({
        id: new ImageId(unitFixture.sampleImageId),
        createdAt: new CreatedAtTimestamp(unitFixture.imageMetadataDTO().createdAt),
        createdById: new ImageCreatorId(unitFixture.sampleUserId),
        currentVersionId: current.id,
        versions: [current, demotedA, demotedB],
        updatedAt: new UnixTimestamp(unitFixture.imageMetadataDTO().updatedAt)
      })

      expect(() => imageMapper.toPromotionUpdate(image)).toThrow(DataPersistenceError)
    })

    it('throws when promoted version is still staged', ({ unitFixture }) => {
      const image = unitFixture.imageMock()
      vi.spyOn(image, 'getCurrentVersionOrThrow').mockReturnValue(
        ImageVersion.reconstruct({
          id: new ImageVersionId(unitFixture.sampleImageVersionId),
          imageId: new ImageId(unitFixture.sampleImageId),
          mimeType: new MimeType('image/png'),
          size: new FileSize(100),
          base64: Base64Image.forExternalStorage(new MimeType('image/png')),
          storageKey: ImageStorageKey.fromString(unitFixture.sampleImageStorageKey),
          isCurrent: true,
          isStaged: true,
          createdById: new ImageCreatorId(unitFixture.sampleUserId),
          createdAt: new CreatedAtTimestamp(unitFixture.imageMetadataDTO().updatedAt)
        })
      )

      expect(() => imageMapper.toPromotionUpdate(image)).toThrow(DataPersistenceError)
    })

    it('throws when currentVersionId pointer does not match promoted version', ({ unitFixture }) => {
      const current = ImageVersion.reconstruct({
        id: new ImageVersionId(unitFixture.sampleCurrentVersionId),
        imageId: new ImageId(unitFixture.sampleImageId),
        mimeType: new MimeType('image/png'),
        size: new FileSize(100),
        base64: Base64Image.forExternalStorage(new MimeType('image/png')),
        storageKey: ImageStorageKey.fromString(unitFixture.sampleImageStorageKey),
        isCurrent: true,
        isStaged: false,
        createdById: new ImageCreatorId(unitFixture.sampleUserId),
        createdAt: new CreatedAtTimestamp(unitFixture.imageMetadataDTO().updatedAt)
      })
      const staged = ImageVersion.reconstruct({
        id: new ImageVersionId(unitFixture.sampleImageVersionId),
        imageId: new ImageId(unitFixture.sampleImageId),
        mimeType: new MimeType('image/png'),
        size: new FileSize(100),
        base64: Base64Image.forExternalStorage(new MimeType('image/png')),
        storageKey: ImageStorageKey.fromString(unitFixture.sampleStagedImageStorageKeyWithVersionId),
        isCurrent: false,
        isStaged: true,
        createdById: new ImageCreatorId(unitFixture.sampleUserId),
        createdAt: new CreatedAtTimestamp(unitFixture.imageMetadataDTO().updatedAt)
      })
      const image = Image.reconstruct({
        id: new ImageId(unitFixture.sampleImageId),
        createdAt: new CreatedAtTimestamp(unitFixture.imageMetadataDTO().createdAt),
        createdById: new ImageCreatorId(unitFixture.sampleUserId),
        currentVersionId: staged.id,
        versions: [current, staged],
        updatedAt: new UnixTimestamp(unitFixture.imageMetadataDTO().updatedAt)
      })

      expect(() => imageMapper.toPromotionUpdate(image)).toThrow(DataPersistenceError)
    })
  })
})
