import { describe, it, expect } from 'vitest'
import { ImageLoadError, ImageLoadErrorProps } from './ImageLoadError'
import { NonEmptyString } from '@hatsuportal/shared-kernel'

describe('ImageLoadError', () => {
  it('should construct with valid props and expose imageId and error', () => {
    const props: ImageLoadErrorProps = {
      imageId: '123e4567-e89b-12d3-a456-426614174000',
      error: new Error('Failed to load image')
    }
    const err = new ImageLoadError(props)
    expect(err.imageId).toBeInstanceOf(NonEmptyString)
    expect(err.imageId.value).toBe(props.imageId)
    expect(err.error).toBe(props.error)
  })

  it('should return correct props from getProps', () => {
    const props: ImageLoadErrorProps = {
      imageId: '123e4567-e89b-12d3-a456-426614174000',
      error: new Error('Some error')
    }
    const err = new ImageLoadError(props)
    const returnedProps = err.getProps()
    expect(returnedProps.imageId).toBe(props.imageId)
    expect(returnedProps.error).toBe(props.error)
  })

  it('should throw if constructed with invalid imageId', () => {
    const props: ImageLoadErrorProps = {
      imageId: '', // invalid
      error: new Error('fail')
    }
    expect(() => new ImageLoadError(props)).toThrow()
  })
})
