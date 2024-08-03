import { describe, expect, it } from 'vitest'
import { ImageApplicationMapper } from './ImageApplicationMapper'
import { CurrentImage } from '../../domain/entities/CurrentImage'
import { ImageVersionId } from '../../domain'

describe('ImageApplicationMapper', () => {
  const imageMapper = new ImageApplicationMapper()

  it('converts image to dto', ({ unitFixture }) => {
    const imageMock = unitFixture.imageMock()
    const image = CurrentImage.fromImageEnsuringCurrentVersion(imageMock)
    const result = imageMapper.toDTO(image)
    expect(typeof result).toBe('object')
    expect(result).toStrictEqual(unitFixture.imageDTOMock())
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
    expect(image.currentVersionId?.value).toBe(metadataDTO.currentVersionId)
    expect(image.isCurrent).toBe(metadataDTO.isCurrent)
    expect(image.isStaged).toBe(metadataDTO.isStaged)
    expect(image.createdAt.value).toBe(metadataDTO.createdAt)
    expect(image.updatedAt.value).toBe(metadataDTO.updatedAt)
  })
})
