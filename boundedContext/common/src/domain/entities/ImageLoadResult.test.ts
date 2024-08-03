import { describe, it, expect, beforeEach } from 'vitest'
import { ImageLoadResult } from './ImageLoadResult'
import { ImageLoadError } from './ImageLoadError'
import { Image } from './Image'
import { EntityTypeEnum } from '@hatsuportal/common'
import { ImageId } from '../valueObjects/ImageId'

describe('ImageLoadResult', () => {
  const VALID_IMAGE_ID = '123e4567-e89b-12d3-a456-426614174000'

  const buildValidImageProps = () => ({
    id: VALID_IMAGE_ID,
    fileName: 'test.png',
    mimeType: 'image/png',
    size: 12345,
    ownerEntityId: '987e6543-e21b-12d3-a456-426614174999',
    ownerEntityType: EntityTypeEnum.Story,
    base64: 'data:image/png;base64,abcdefg',
    createdById: '111e2222-e33b-44d3-a456-426614174abc',
    createdByName: 'Alice',
    createdAt: 1710000000,
    updatedAt: 1710000001
  })

  const buildValidImage = () => Image.reconstruct(buildValidImageProps())

  const buildLoadError = (message = 'Failed to load') => new ImageLoadError({ imageId: VALID_IMAGE_ID, error: new Error(message) })

  describe('success()', () => {
    it('returns a successful result with the given image', () => {
      const image = buildValidImage()
      const result = ImageLoadResult.success(image)

      expect(result.isSuccess()).toBe(true)
      expect(result.image).toBe(image)
      expect(result.loadError).toBeNull()

      // props view should mirror the getters
      expect(result.getProps()).toStrictEqual({
        image,
        state: result.state.value,
        loadError: null
      })
    })
  })

  describe('failedToLoad()', () => {
    it('returns a failure result with the given load error', () => {
      const error = buildLoadError()
      const result = ImageLoadResult.failedToLoad(new ImageId(VALID_IMAGE_ID), error.error)

      expect(result.isSuccess()).toBe(false)
      expect(result.image).toBeNull()
      expect(result.loadError?.getProps()).toStrictEqual(error.getProps())

      expect(result.getProps()).toStrictEqual({
        image: null,
        state: result.state.value,
        loadError: error.getProps()
      })
    })
  })

  describe('constructor validations', () => {
    it('throws if called with neither image nor error (NotSet state)', () => {
      // @ts-expect-error – intentionally invalid call
      expect(() => new ImageLoadResult({})).toThrow()
    })

    it('throws if called with both image and error', () => {
      const image = buildValidImage()
      const error = buildLoadError('fail')
      // @ts-expect-error – intentionally invalid call
      expect(() => new ImageLoadResult({ image, error })).toThrow()
    })
  })

  describe('state helpers', () => {
    it('correctly reflects success/failure status', () => {
      const image = buildValidImage()
      const error = buildLoadError('fail')

      const successResult = ImageLoadResult.success(image)
      const failedResult = ImageLoadResult.failedToLoad(new ImageId(VALID_IMAGE_ID), error.error)

      expect(successResult.isSuccess()).toBe(true)
      expect(failedResult.isSuccess()).toBe(false)
    })
  })
})
