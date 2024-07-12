import { describe, expect, it } from 'vitest'
import ImageMetadata from './ImageMetadata'
import { Visibility } from '../enums/Visibility'

describe('ImageMetadata', () => {
  it('can create image metadata with all properties', ({ unitFixture }) => {
    const metadata = new ImageMetadata(unitFixture.imageMetadata())
    expect(metadata.fileName).toBe(unitFixture.serializedImageMetadata().fileName)
    expect(metadata.mimeType).toBe(unitFixture.serializedImageMetadata().mimeType)
    expect(metadata.size).toBe(unitFixture.serializedImageMetadata().size)
    expect(metadata.ownerId).toStrictEqual(unitFixture.serializedImageMetadata().ownerId)
    expect(metadata.ownerType).toBe(unitFixture.serializedImageMetadata().ownerType)
  })

  it('does not allow creating image metadata without an id', ({ unitFixture }) => {
    const { id, ...entityWithoutId } = unitFixture.imageMetadata()
    expect(() => {
      new ImageMetadata(entityWithoutId as any)
    }).toThrow('Entity must have an id')
  })

  it('does not allow creating image metadata with an id with empty spaces', ({ unitFixture }) => {
    expect(() => {
      new ImageMetadata({ ...unitFixture.imageMetadata(), id: ' te st ' } as any)
    }).toThrow('Entity id " te st " cannot contain white spaces.')
  })

  it('does not allow creating image metadata with extra props', ({ unitFixture }) => {
    expect(() => {
      new ImageMetadata({ ...unitFixture.imageMetadata(), extraProp: 'foobar' } as any)
    }).toThrow('Props contain extra keys: extraProp.')
  })

  it('can compare image metadatas', ({ unitFixture }) => {
    const entity = new ImageMetadata(unitFixture.imageMetadata())
    const entity2 = new ImageMetadata({
      ...unitFixture.imageMetadata(),
      id: 'testId2',
      visibility: Visibility.Private
    })
    expect(entity.isEqual(entity)).toBe(true)
    expect(entity.isEqual(entity2)).toBe(false)
  })

  it('can clone image metadata', ({ unitFixture }) => {
    const original = new ImageMetadata(unitFixture.imageMetadata())
    const clone = original.clone({ visibility: Visibility.Private })
    expect(original.visibility).toBe(unitFixture.serializedImageMetadata().visibility)
    expect(clone.visibility).toBe(Visibility.Private)

    const { visibility: origVisibility, ...serializedOriginal } = original.serialize()
    const { visibility: cloneVisibility, ...serializedClone } = clone.serialize()
    expect(JSON.stringify(serializedOriginal)).toBe(JSON.stringify(serializedClone))
  })

  it('can serialize image metadata', ({ unitFixture }) => {
    const entity = new ImageMetadata(unitFixture.imageMetadata())
    expect(typeof entity.serialize()).toBe('object')
    expect(entity.serialize()).toStrictEqual(unitFixture.serializedImageMetadata())
  })

  it('can stringify image metadata', ({ unitFixture }) => {
    const entity = new ImageMetadata(unitFixture.imageMetadata())
    expect(typeof entity.toString()).toBe('string')
    // we need to use JSON.parse and toStringEqual here instead of
    // JSON.stringify === JSON.stringify comparison because serializing the entity
    // (which the toString method calls) changes the order of the
    // properties from the original JSON
    expect(JSON.parse(entity.toString())).toStrictEqual(unitFixture.serializedImageMetadata())
  })
})
