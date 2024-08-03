import { describe, expect, it } from 'vitest'
import { uuid } from '@hatsuportal/common'
import { InvalidImageVersionIdError } from '../errors/InvalidImageVersionIdError'
import { ImageVersionId } from './ImageVersionId'

describe('ImageVersionId', () => {
  it('can create an image version id', () => {
    const id = uuid()
    const versionId = new ImageVersionId(id)
    expect(versionId).to.be.instanceOf(ImageVersionId)
    expect(versionId.value).to.eq(id)
  })

  it('does not allow creating an image version id with an empty value', () => {
    expect(() => new ImageVersionId('')).toThrow(InvalidImageVersionIdError)
    expect(() => new ImageVersionId(undefined as unknown as string)).toThrow(InvalidImageVersionIdError)
    expect(() => new ImageVersionId(null as unknown as string)).toThrow(InvalidImageVersionIdError)
  })

  it('exposes canCreate and assertCanCreate helpers', () => {
    const id = uuid()
    expect(ImageVersionId.canCreate(id)).toBe(true)
    expect(() => ImageVersionId.assertCanCreate(id)).not.toThrow()
    expect(ImageVersionId.canCreate('')).toBe(false)
    expect(() => ImageVersionId.assertCanCreate('')).toThrow(InvalidImageVersionIdError)
  })

  it('resolves optional values via fromOptional', () => {
    const id = new ImageVersionId(uuid())
    expect(ImageVersionId.fromOptional(id)).toBe(id)
    expect(ImageVersionId.fromOptional(id.value)).toStrictEqual(id)
    expect(ImageVersionId.fromOptional(null)).toBe(ImageVersionId.NOT_SET)
    expect(ImageVersionId.fromOptional(ImageVersionId.NOT_SET)).toBe(ImageVersionId.NOT_SET)
  })
})
