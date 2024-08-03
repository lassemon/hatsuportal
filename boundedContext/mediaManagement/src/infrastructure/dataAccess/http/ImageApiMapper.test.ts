import { describe, expect, it } from 'vitest'
import { ImageApiMapper } from './ImageApiMapper'

describe('ImageApiMapper', () => {
  const imageMapper = new ImageApiMapper()

  it('converts image dto to response', ({ unitFixture }) => {
    // this is more of a dummy test because currently no specific mapping is done from ImageDTO -> ImageResponse
    expect(imageMapper.toResponse(unitFixture.imageDTOMock())).toStrictEqual(unitFixture.imageResponse())
  })

  it('maps image with relations to response', ({ unitFixture }) => {
    const dto = {
      ...unitFixture.imageDTOMock(),
      createdByName: 'Test User'
    }

    expect(imageMapper.toResponseWithRelations(dto)).toMatchObject({
      id: unitFixture.sampleImageId,
      createdByName: 'Test User'
    })
  })
})
