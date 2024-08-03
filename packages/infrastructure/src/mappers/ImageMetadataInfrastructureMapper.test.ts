import { describe, expect, it } from 'vitest'
import { ImageMetadataInfrastructureMapper } from './ImageMetadataInfrastructureMapper'
import { ImageMetadata } from '@hatsuportal/domain'

describe('ImageMetadataInfrastructureMapper', () => {
  const imageMetadataMapper = new ImageMetadataInfrastructureMapper()

  it('converts image metadata domain entity to insert query', ({ unitFixture }) => {
    const dto = unitFixture.imageMetadataDTO()
    const metadataEntity = new ImageMetadata(dto)
    const insertQuery = imageMetadataMapper.toInsertQuery(metadataEntity)

    // common post properties
    expect(insertQuery.id).toBe(dto.id)
    expect(insertQuery.visibility).toBe(dto.visibility)
    expect(insertQuery.createdBy).toBe(dto.createdBy)
    expect(insertQuery.createdByUserName).toBe(dto.createdByUserName)
    expect(insertQuery.createdAt).not.toBe(dto.createdAt)
    expect(insertQuery.updatedAt).not.toBe(dto.updatedAt)
    expect(insertQuery.updatedAt).toBeNull()

    // metadata properties
    expect(insertQuery.fileName).toBe(dto.fileName)
    expect(insertQuery.mimeType).toBe(dto.mimeType)
    expect(insertQuery.size).toBe(dto.size)
    expect(insertQuery.ownerId).toBe(dto.ownerId)
    expect(insertQuery.ownerType).toBe(dto.ownerType)
  })

  it('converts image metadata domain entity to update query', ({ unitFixture }) => {
    const dto = unitFixture.imageMetadataDTO()
    const metadataEntity = new ImageMetadata(unitFixture.imageMetadataDTO())
    const updateQuery = imageMetadataMapper.toUpdateQuery(metadataEntity)

    // common post properties
    expect(updateQuery.id).toBe(dto.id)
    expect(updateQuery.visibility).toBe(dto.visibility)
    expect((updateQuery as any).createdBy).toBeUndefined() // should not be able to update
    expect((updateQuery as any).createdByUserName).toBeUndefined() // should not be able to update
    expect((updateQuery as any).createdAt).toBeUndefined() // should not be able to update
    expect(updateQuery.updatedAt).not.toBe(dto.updatedAt) // mapper should set new updated at timestamp

    // metadata properties
    expect(updateQuery.fileName).toBe(dto.fileName)
    expect(updateQuery.mimeType).toBe(dto.mimeType)
    expect(updateQuery.size).toBe(dto.size)
    expect(updateQuery.ownerId).toBe(dto.ownerId)
    expect(updateQuery.ownerType).toBe(dto.ownerType)
  })

  it('converts image metadata database record to DTO', ({ unitFixture }) => {
    const metadataRecord = unitFixture.imageMetadataDatabaseRecord()
    const dto = imageMetadataMapper.toDTO(metadataRecord)

    // common post properties
    expect(dto.id).toBe(metadataRecord.id)
    expect(dto.visibility).toBe(metadataRecord.visibility)
    expect(dto.createdBy).toBe(metadataRecord.createdBy)
    expect(dto.createdByUserName).toBe(metadataRecord.createdByUserName)
    expect(dto.createdAt).toBe(metadataRecord.createdAt)
    expect(dto.updatedAt).toBe(metadataRecord.updatedAt)

    // metadata properties
    expect(dto.fileName).toBe(metadataRecord.fileName)
    expect(dto.mimeType).toBe(metadataRecord.mimeType)
    expect(dto.size).toBe(metadataRecord.size)
    expect(dto.ownerId).toBe(metadataRecord.ownerId)
    expect(dto.ownerType).toBe(metadataRecord.ownerType)
  })

  it('converts image metadata database record to domain entity', ({ unitFixture }) => {
    const metadataRecord = unitFixture.imageMetadataDatabaseRecord()
    const metadata = imageMetadataMapper.toDomainEntity(metadataRecord)

    // common post properties
    expect(metadata.id.value).toBe(metadataRecord.id)
    expect(metadata.visibility.value).toBe(metadataRecord.visibility)
    expect(metadata.createdBy.value).toBe(metadataRecord.createdBy)
    expect(metadata.createdByUserName.value).toBe(metadataRecord.createdByUserName)
    expect(metadata.createdAt.value).toBe(metadataRecord.createdAt)
    expect(metadata.updatedAt?.value).toBe(metadataRecord.updatedAt)

    // metadata properties
    expect(metadata.fileName.value).toBe(metadataRecord.fileName)
    expect(metadata.mimeType.value).toBe(metadataRecord.mimeType)
    expect(metadata.size.value).toBe(metadataRecord.size)
    expect(metadata.ownerId?.value).toBe(metadataRecord.ownerId)
    expect(metadata.ownerType?.value).toBe(metadataRecord.ownerType)
  })
})
