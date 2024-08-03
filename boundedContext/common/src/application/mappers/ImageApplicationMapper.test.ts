import { describe, expect, it } from 'vitest'
import { ImageApplicationMapper } from './ImageApplicationMapper'
import { Image } from '../../domain'
import { ImageFactory } from '../services/ImageFactory'

describe('ImageApplicationMapper', () => {
  const imageMapper = new ImageApplicationMapper(new ImageFactory())

  it('converts image to dto', ({ unitFixture }) => {
    const image = Image.create(unitFixture.imageDTOMock())
    const result = imageMapper.toDTO(image)
    expect(typeof result).toBe('object')
    expect(result).toStrictEqual(unitFixture.imageDTOMock())
  })

  it('converts dto and base64 image data into image', ({ unitFixture }) => {
    const image = imageMapper.dtoToDomainEntity(unitFixture.imageDTOMock(), 'asfasdf')
    expect(image).toBeInstanceOf(Image)
    expect(image.base64.value).toBe('data:image/png;base64,asfasdf')
    expect({
      id: image.id.value,
      fileName: image.fileName.value,
      mimeType: image.mimeType.value,
      size: image.size.value,
      ownerEntityId: image.ownerEntityId.value,
      ownerEntityType: image.ownerEntityType.value,
      base64: image.base64?.value,
      createdById: image.createdById.value,
      createdByName: image.createdByName.value,
      createdAt: image.createdAt.value,
      updatedAt: image.updatedAt?.value
    }).toStrictEqual({ ...unitFixture.imageDTOMock(), base64: 'data:image/png;base64,asfasdf' })

    const image2 = imageMapper.dtoToDomainEntity(unitFixture.imageDTOMock(), 'data:image/png;base64,asfasdf')
    expect(image2.base64.value).toBe('data:image/png;base64,asfasdf')
  })

  it('converts create image input to image entity', ({ unitFixture }) => {
    // TODO: Add test for create image input to image entity
  })
})
