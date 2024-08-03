import { describe, expect, it } from 'vitest'
import { ImageApplicationMapper } from './ImageApplicationMapper'
import { CurrentImage } from '../../domain/entities/CurrentImage'

describe('ImageApplicationMapper', () => {
  const imageMapper = new ImageApplicationMapper()

  it('converts image to dto', ({ unitFixture }) => {
    const imageMock = unitFixture.imageMock()
    const image = CurrentImage.fromImageEnsuringCurrentVersion(imageMock)
    const result = imageMapper.toDTO(image)
    expect(typeof result).toBe('object')
    expect(result).toStrictEqual(unitFixture.imageDTOMock())
  })

  it('converts create image input to image entity', ({ unitFixture }) => {
    // TODO: Add test for create image input to image entity
  })
})
