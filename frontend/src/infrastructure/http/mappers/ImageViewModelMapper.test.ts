import { describe, expect, it } from 'vitest'
import { ImageViewModelMapper } from './ImageViewModelMapper'

describe('ImageViewModelMapper', () => {
  const imageMapper = new ImageViewModelMapper()

  it('converts image response to ImageViewModel entity', ({ unitFixture }) => {
    expect(imageMapper.toViewModel(unitFixture.imageResponse()).toJSON()).toStrictEqual(unitFixture.imageDTOMock())
  })
})
