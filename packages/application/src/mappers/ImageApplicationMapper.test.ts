import { describe, expect, it } from 'vitest'
import { Image } from '@hatsuportal/domain'
import { ImageApplicationMapper } from './ImageApplicationMapper'

describe('ImageApplicationMapper', () => {
  const imageMapper = new ImageApplicationMapper()

  it('converts image post to dto', ({ unitFixture }) => {
    const image = new Image(unitFixture.imageDTO())
    const result = imageMapper.toDTO(image)
    expect(typeof result).toBe('object')
    expect(result).toStrictEqual(unitFixture.imageDTO())
  })

  it('converts dto and base64 image data into image post', ({ unitFixture }) => {
    const image = imageMapper.toDomainEntity(unitFixture.imageDTO(), 'asfasdf')
    expect(image).toBeInstanceOf(Image)
    expect(image.base64.value).toBe('data:image/png;base64,asfasdf')
    expect({
      id: image.id.value,
      visibility: image.visibility.value,
      fileName: image.fileName.value,
      mimeType: image.mimeType.value,
      size: image.size.value,
      ownerId: image.ownerId?.value,
      ownerType: image.ownerType?.value,
      base64: image.base64?.value,
      createdBy: image.createdBy.value,
      createdByUserName: image.createdByUserName.value,
      createdAt: image.createdAt.value,
      updatedAt: image.updatedAt?.value
    }).toStrictEqual({ ...unitFixture.imageDTO(), base64: 'data:image/png;base64,asfasdf' })

    const image2 = imageMapper.toDomainEntity(unitFixture.imageDTO(), 'data:image/png;base64,asfasdf')
    expect(image2.base64.value).toBe('data:image/png;base64,asfasdf')
  })
})
