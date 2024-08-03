import { describe, expect, it } from 'vitest'
import { ImageInfrastructureMapper } from './ImageInfrastructureMapper'
import { Image } from '../../domain'

describe('ImageInfrastructureMapper', () => {
  const imageMapper = new ImageInfrastructureMapper()

  it('converts image metadata domain entity to insert query', ({ unitFixture }) => {
    const dto = unitFixture.imageDTOMock()
    const image = Image.create(dto)
    const insertQuery = imageMapper.toInsertMetadataQuery(image)

    // common post properties
    expect(insertQuery.id).toBe(dto.id)
    expect(insertQuery.createdById).toBe(dto.createdById)
    expect((insertQuery as any).createdByName).toBeUndefined() // not a part of image table
    expect(insertQuery.createdAt).not.toBe(dto.createdAt)
    expect(insertQuery.updatedAt).not.toBe(dto.updatedAt)
    expect(insertQuery.updatedAt).toBe(insertQuery.createdAt) // newly created image should have same created and updated at timestamp

    // metadata properties
    expect(insertQuery.fileName).toBe(dto.fileName)
    expect(insertQuery.mimeType).toBe(dto.mimeType)
    expect(insertQuery.size).toBe(dto.size)
    expect(insertQuery.ownerEntityId).toBe(dto.ownerEntityId)
    expect(insertQuery.ownerEntityType).toBe(dto.ownerEntityType)
  })

  it('converts image metadata domain entity to update query', ({ unitFixture }) => {
    const dto = unitFixture.imageDTOMock()
    const image = Image.create(unitFixture.imageDTOMock())
    const updateQuery = imageMapper.toUpdateMetadataQuery(image)

    // common post properties
    expect(updateQuery.id).toBe(dto.id)
    expect((updateQuery as any).createdById).toBeUndefined() // should not be able to update
    expect((updateQuery as any).createdByName).toBeUndefined() // should not be able to update
    expect((updateQuery as any).createdAt).toBeUndefined() // should not be able to update
    expect(updateQuery.updatedAt).not.toBe(dto.updatedAt) // mapper should set new updated at timestamp

    // metadata properties
    expect(updateQuery.fileName).toBe(dto.fileName)
    expect(updateQuery.mimeType).toBe(dto.mimeType)
    expect(updateQuery.size).toBe(dto.size)
    expect(updateQuery.ownerEntityId).toBe(dto.ownerEntityId)
    expect(updateQuery.ownerEntityType).toBe(dto.ownerEntityType)
  })

  it('converts image metadata database record and base64 string to DTO', ({ unitFixture }) => {
    const metadataRecord = unitFixture.imageMetadataDatabaseRecord()
    const base64 = 'asdasdasd'
    const dto = imageMapper.toDTO(metadataRecord, base64)

    // common post properties
    expect(dto.id).toBe(metadataRecord.id)
    expect(dto.createdById).toBe(metadataRecord.createdById)
    expect(dto.createdByName).toBe(metadataRecord.createdByName)
    expect(dto.createdAt).toBe(metadataRecord.createdAt)
    expect(dto.updatedAt).toBe(metadataRecord.updatedAt)

    // metadata properties
    expect(dto.fileName).toBe(metadataRecord.fileName)
    expect(dto.mimeType).toBe(metadataRecord.mimeType)
    expect(dto.size).toBe(metadataRecord.size)
    expect(dto.ownerEntityId).toBe(metadataRecord.ownerEntityId)
    expect(dto.ownerEntityType).toBe(metadataRecord.ownerEntityType)
    expect(dto.base64).toBe(base64)
  })

  it('converts image metadata database record to domain entity', ({ unitFixture }) => {
    const metadataRecord = unitFixture.imageMetadataDatabaseRecord()
    const base64 = 'asdasdasd'
    const metadata = imageMapper.toDomainEntity(metadataRecord, base64)

    // common post properties
    expect(metadata.id.value).toBe(metadataRecord.id)
    expect(metadata.createdById.value).toBe(metadataRecord.createdById)
    expect(metadata.createdByName.value).toBe(metadataRecord.createdByName)
    expect(metadata.createdAt.value).toBe(metadataRecord.createdAt)
    expect(metadata.updatedAt?.value).toBe(metadataRecord.updatedAt)

    // metadata properties
    expect(metadata.fileName.value).toBe(metadataRecord.fileName)
    expect(metadata.mimeType.value).toBe(metadataRecord.mimeType)
    expect(metadata.size.value).toBe(metadataRecord.size)
    expect(metadata.ownerEntityId.value).toBe(metadataRecord.ownerEntityId)
    expect(metadata.ownerEntityType.value).toBe(metadataRecord.ownerEntityType)
    expect(metadata.base64.value).toBe(`data:image/png;base64,${base64}`)
  })
})
