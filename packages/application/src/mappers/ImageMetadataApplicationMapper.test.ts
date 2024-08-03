import { describe, expect, it } from 'vitest'
import { ImageMetadata } from '@hatsuportal/domain'
import { ImageMetadataApplicationMapper } from './ImageMetadataApplicationMapper'

describe('ImageApplicationMapper', () => {
  const imageMapper = new ImageMetadataApplicationMapper()

  it('converts image metadata entity to dto', ({ unitFixture }) => {
    const imageMetadata = new ImageMetadata(unitFixture.imageMetadataDTO())
    const result = imageMapper.toDTO(imageMetadata)
    expect(typeof result).toBe('object')
    expect(result).toStrictEqual(unitFixture.imageMetadataDTO())
  })

  it('converts dto into image metadata entity', ({ unitFixture }) => {
    const imageMetadata = imageMapper.toDomainEntity(unitFixture.imageMetadataDTO())
    expect(imageMetadata).toBeInstanceOf(ImageMetadata)
    expect({
      id: imageMetadata.id.value,
      visibility: imageMetadata.visibility.value,
      fileName: imageMetadata.fileName.value,
      mimeType: imageMetadata.mimeType.value,
      size: imageMetadata.size.value,
      ownerId: imageMetadata.ownerId?.value,
      ownerType: imageMetadata.ownerType?.value,
      createdBy: imageMetadata.createdBy.value,
      createdByUserName: imageMetadata.createdByUserName.value,
      createdAt: imageMetadata.createdAt.value,
      updatedAt: imageMetadata.updatedAt?.value
    }).toStrictEqual({ ...unitFixture.imageMetadataDTO() })
  })
})
