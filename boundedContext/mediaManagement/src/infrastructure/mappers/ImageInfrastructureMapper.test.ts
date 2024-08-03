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
    const dto = imageMapper.toDTO(metadataRecord)

    expect(dto.id).toBe(metadataRecord.id)
    expect(dto.storageKey).toBe(metadataRecord.storageKey)
    expect(dto.mimeType).toBe(metadataRecord.mimeType)
    expect(dto.size).toBe(metadataRecord.size)
    expect(dto.createdById).toBe(metadataRecord.createdById)
    expect(dto.currentVersionId).toBe(metadataRecord.currentVersionId)
    expect(dto.isCurrent).toBe(metadataRecord.isCurrent)
    expect(dto.isStaged).toBe(metadataRecord.isStaged)
    expect(dto.createdAt).toBe(metadataRecord.createdAt)
    expect(dto.updatedAt).toBe(metadataRecord.updatedAt)
  })
})
