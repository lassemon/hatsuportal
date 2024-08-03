import { describe, expect, it } from 'vitest'
import { ImageInfrastructureMapper } from './ImageInfrastructureMapper'

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

  it('converts image metadata database record and base64 string to DTO', ({ unitFixture }) => {
    const metadataRecord = unitFixture.imageMetadataDatabaseRecord()
    const base64 = 'data:image/png;base64,asdasdasd'
    const dto = imageMapper.toDTO(metadataRecord, base64)

    expect(dto.id).toBe(metadataRecord.id)
    expect(dto.storageKey).toBe(metadataRecord.storageKey)
    expect(dto.mimeType).toBe(metadataRecord.mimeType)
    expect(dto.size).toBe(metadataRecord.size)
    expect(dto.createdById).toBe(metadataRecord.createdById)
    expect(dto.currentVersionId).toBe(metadataRecord.currentVersionId)
    expect(dto.base64).toBe(base64)
    expect(dto.isCurrent).toBe(metadataRecord.isCurrent)
    expect(dto.isStaged).toBe(metadataRecord.isStaged)
    expect(dto.createdAt).toBe(metadataRecord.createdAt)
    expect(dto.updatedAt).toBe(metadataRecord.updatedAt)
  })

  it('converts image metadata database record to domain entity', ({ unitFixture }) => {
    const metadataRecord = unitFixture.imageMetadataDatabaseRecord()
    metadataRecord.mimeType = 'image/png'
    const image = imageMapper.toDomainEntity(metadataRecord, unitFixture.base64ImageStringMock())

    expect(image.id.value).toBe(metadataRecord.id)
    expect(image.createdById.value).toBe(metadataRecord.createdById)
    expect(image.storageKey?.value).toBe(metadataRecord.storageKey)
    expect(image.mimeType?.value).toBe(metadataRecord.mimeType)
    expect(image.fileExtension).toBe('png')
    expect(image.size?.value).toBe(metadataRecord.size)
    expect(image.base64?.value).toBe(unitFixture.base64ImageStringMock())
    expect(image.currentVersionId?.value).toBe(metadataRecord.currentVersionId)
    expect(image.isCurrent).toBe(metadataRecord.isCurrent)
    expect(image.isStaged).toBe(metadataRecord.isStaged)
    expect(image.createdAt.value).toBe(metadataRecord.createdAt)
    expect(image.updatedAt.value).toBe(metadataRecord.updatedAt)
  })
})
