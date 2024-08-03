import { describe, expect, it } from 'vitest'
import { ImageApplicationMapper } from './ImageApplicationMapper'
import { CurrentImage } from '../../domain/entities/CurrentImage'
import { ImageStorageKey, ImageVersionId } from '../../domain'
import { VersionNotStagedError } from '../../domain/errors/VersionNotStagedError'
import { ImagePromotionLockDTO } from '../dtos/ImagePromotionLockDTO'

describe('ImageApplicationMapper', () => {
  const imageMapper = new ImageApplicationMapper()

  it('converts image to dto', ({ unitFixture }) => {
    const imageMock = unitFixture.imageMock()
    const image = CurrentImage.fromImageEnsuringCurrentVersion(imageMock)
    const result = imageMapper.toDTO(image)
    expect(typeof result).toBe('object')
    expect(result).toStrictEqual(unitFixture.imageDTOMock())
  })

  it('converts image metadata to dto without loading storage content', ({ unitFixture }) => {
    const metadata = unitFixture.imageMetadataDTO()
    const result = imageMapper.toDTOFromMetadata(metadata)

    expect(result).toStrictEqual({
      ...unitFixture.imageDTOMock(),
      base64: ''
    })
  })

  it('converts image to dto from specific version', ({ unitFixture }) => {
    const image = unitFixture.imageWithCurrentAndStagedVersionMock()
    const stagedVersionId = new ImageVersionId(unitFixture.sampleImageVersionId)
    const result = imageMapper.toDTOFromVersion(image, stagedVersionId)

    const stagedVersion = image.getStagedVersionOrThrow(stagedVersionId)
    expect(result.id).toBe(image.id.value)
    expect(result.storageKey).toBe(stagedVersion.storageKey.value)
    expect(result.mimeType).toBe(stagedVersion.mimeType.value)
    expect(result.size).toBe(stagedVersion.size.value)
    expect(result.base64).toBe(stagedVersion.base64.value)
    expect(result.currentVersionId).toBe(stagedVersion.id.value)
    expect(result.isCurrent).toBe(stagedVersion.isCurrent)
    expect(result.isStaged).toBe(stagedVersion.isStaged)
    expect(result.createdById).toBe(stagedVersion.createdById.value)
    expect(result.createdAt).toBe(image.createdAt.value)
    expect(result.updatedAt).toBe(image.updatedAt.value)
  })

  it('converts image to dto with relations including createdByName', ({ unitFixture }) => {
    const image = CurrentImage.fromImageEnsuringCurrentVersion(unitFixture.imageMock())
    const createdByName = 'Test User'
    const result = imageMapper.toDTOWithRelations(image, createdByName)

    expect(result).toStrictEqual({
      ...unitFixture.imageDTOMock(),
      createdByName
    })
  })

  it('converts image metadata database record to domain entity', ({ unitFixture }) => {
    const metadataDTO = unitFixture.imageMetadataDTO()
    metadataDTO.mimeType = 'image/png'
    const image = imageMapper.toDomainEntity(metadataDTO, unitFixture.base64ImageStringMock())

    expect(image.id.value).toBe(metadataDTO.id)
    expect(image.createdById.value).toBe(metadataDTO.createdById)
    expect(image.storageKey?.value).toBe(metadataDTO.storageKey)
    expect(image.mimeType?.value).toBe(metadataDTO.mimeType)
    expect(image.fileExtension).toBe('png')
    expect(image.size?.value).toBe(metadataDTO.size)
    expect(image.base64?.value).toBe(unitFixture.base64ImageStringMock())
    expect(image.currentVersionId?.value).toBe(metadataDTO.versionId)
    expect(image.isCurrent).toBe(metadataDTO.isCurrent)
    expect(image.isStaged).toBe(metadataDTO.isStaged)
    expect(image.createdAt.value).toBe(metadataDTO.createdAt)
    expect(image.updatedAt.value).toBe(metadataDTO.updatedAt)
  })

  it('toDomainEntity maps cover-replace staged row with mismatched pointer to NOT_SET aggregate', ({ unitFixture }) => {
    const stagedMetadata = {
      ...unitFixture.imageMetadataDTO(),
      versionId: unitFixture.sampleImageVersionId,
      currentVersionPointer: unitFixture.sampleCurrentVersionId,
      isCurrent: false,
      isStaged: true,
      storageKey: unitFixture.sampleStagedImageStorageKeyWithVersionId
    }
    const stagedVersionId = new ImageVersionId(unitFixture.sampleImageVersionId)

    const image = imageMapper.toDomainEntity(stagedMetadata, unitFixture.base64ImageStringMock())

    expect(image.currentVersionId.equals(ImageVersionId.NOT_SET)).toBe(true)
    expect(image.versions.has(unitFixture.sampleImageVersionId)).toBe(true)
    expect(() => image.getStagedVersionOrThrow(stagedVersionId)).not.toThrow()
    expect(() => imageMapper.toDTOFromVersion(image, stagedVersionId)).not.toThrow()
  })

  describe('toImageForPromotion', () => {
    it('builds a minimal aggregate for first publication with NOT_SET current pointer', ({ unitFixture }) => {
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

      const image = imageMapper.toImageForPromotion(lock)

      expect(image.currentVersionId.equals(ImageVersionId.NOT_SET)).toBe(true)
      expect(image.versions.size).toBe(1)
      const stagedVersion = image.getStagedVersionOrThrow(stagedVersionId)
      expect(stagedVersion.isStaged).toBe(true)
      expect(stagedVersion.isCurrent).toBe(false)

      const permanentKey = ImageStorageKey.fromString(
        `story_cover_${unitFixture.sampleImageId}_${unitFixture.sampleImageVersionId}_${unitFixture.sampleUserId}.png`
      )
      expect(() => image.promoteToCurrent(stagedVersionId, permanentKey)).not.toThrow()
      expect(image.currentVersionId.value).toBe(unitFixture.sampleImageVersionId)
    })

    it('preserves explicit staged version id when staged metadata pointer is poisoned', ({ unitFixture }) => {
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

      const image = imageMapper.toImageForPromotion(lock)

      expect(image.versions.size).toBe(2)
      expect(image.versions.has(unitFixture.sampleCurrentVersionId)).toBe(true)
      expect(image.versions.has(unitFixture.sampleImageVersionId)).toBe(true)
      expect(image.getStagedVersionOrThrow(stagedVersionId).isStaged).toBe(true)
    })

    it('preserves retired version flags so promoteToCurrent throws VersionNotStagedError', ({ unitFixture }) => {
      const retiredMetadata = {
        ...unitFixture.imageMetadataDTO(),
        isCurrent: false,
        isStaged: false
      }
      const lock: ImagePromotionLockDTO = { staged: retiredMetadata, publishedCurrent: null }
      const stagedVersionId = new ImageVersionId(unitFixture.sampleImageVersionId)
      const image = imageMapper.toImageForPromotion(lock)
      const permanentKey = ImageStorageKey.fromString(
        `story_cover_${unitFixture.sampleImageId}_${unitFixture.sampleImageVersionId}_${unitFixture.sampleUserId}.png`
      )

      expect(image.getStagedVersionOrThrow(stagedVersionId).isStaged).toBe(false)
      expect(() => image.promoteToCurrent(stagedVersionId, permanentKey)).toThrow(VersionNotStagedError)
    })
  })
})
