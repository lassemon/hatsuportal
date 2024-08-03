import { describe, expect, it } from 'vitest'
import { ImageId } from './ImageId'
import { uuid } from '@hatsuportal/common'
import { InvalidImageIdError } from '../errors/InvalidImageIdError'

describe('ImageId', () => {
  it('can create an image id', () => {
    const id = uuid()
    const imageId = new ImageId(id)
    expect(imageId).to.be.instanceOf(ImageId)
    expect(imageId.value).to.eq(id)
  })

  it('does not allow creating an image id with an empty value', () => {
    expect(() => {
      new ImageId('')
    }).toThrow(InvalidImageIdError)
    expect(() => {
      new ImageId(undefined as any)
    }).toThrow(InvalidImageIdError)
    expect(() => {
      new ImageId(null as any)
    }).toThrow(InvalidImageIdError)
  })

  it('does not allow creating an image id with an invalid value', () => {
    const invalidIds = [
      '    ',
      '  te  st  ',
      '1',
      '1234',
      '1234567',
      '1234567891',
      '1234567891234',
      '1234567891234567',
      '1234567891234567891',
      '1234567891234567891234',
      '1234567891234567891234567',
      '1234567891234567891234567891',
      '1234567891234567891234567891234',
      1,
      0,
      -1
    ] as any[]

    invalidIds.forEach((id) => {
      expect(() => {
        new ImageId(id)
      }).toThrow(InvalidImageIdError)
    })
  })

  it('exposes canCreate and assertCanCreate helpers', () => {
    const id = uuid()
    expect(ImageId.canCreate(id)).toBe(true)
    expect(() => ImageId.assertCanCreate(id)).not.toThrow()
    expect(ImageId.canCreate('')).toBe(false)
    expect(() => ImageId.assertCanCreate('')).toThrow(InvalidImageIdError)
    expect(ImageId.fromOptional(null)).toBe(ImageId.UNKNOWN)
    expect(ImageId.fromOptional(new ImageId(id)).value).toBe(id)
  })
})
