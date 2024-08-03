import { describe, expect, it } from 'vitest'
import { uuid } from '@hatsuportal/common'
import { InvalidImageCreatorIdError } from '../errors/InvalidImageCreatorIdError'
import { ImageCreatorId } from './ImageCreatorId'

describe('ImageCreatorId', () => {
  it('can create an image creator id', () => {
    const id = uuid()
    const creatorId = new ImageCreatorId(id)
    expect(creatorId).to.be.instanceOf(ImageCreatorId)
    expect(creatorId.value).to.eq(id)
  })

  it('exposes canCreate, assertCanCreate and fromOptional helpers', () => {
    const id = uuid()
    expect(ImageCreatorId.canCreate(id)).toBe(true)
    expect(() => ImageCreatorId.assertCanCreate(id)).not.toThrow()
    expect(ImageCreatorId.canCreate('')).toBe(false)
    expect(ImageCreatorId.fromOptional(null)).toBe(ImageCreatorId.UNKNOWN)
    expect(ImageCreatorId.fromOptional(new ImageCreatorId(id)).value).toBe(id)
  })

  it('wraps invalid values in InvalidImageCreatorIdError', () => {
    expect(() => new ImageCreatorId('')).toThrow(InvalidImageCreatorIdError)
  })
})
