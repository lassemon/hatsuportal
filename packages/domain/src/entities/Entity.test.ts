import { describe, expect, it } from 'vitest'
import { Entity } from './Entity'
import { Visibility } from '../enums/Visibility'

describe('Entity', () => {
  it('can create entity with all properties', ({ unitFixture }) => {
    const entity = new Entity(unitFixture.entity())
    expect(entity.id).toBe(unitFixture.serializedEntity().id)
    expect(entity.visibility).toBe(unitFixture.serializedEntity().visibility)
    expect(entity.createdBy).toBe(unitFixture.serializedEntity().createdBy)
    expect(entity.createdByUserName).toBe(unitFixture.serializedEntity().createdByUserName)
    expect(entity.createdAt).toBe(unitFixture.serializedEntity().createdAt)
    expect(entity.updatedAt).toBe(unitFixture.serializedEntity().updatedAt)
  })

  it('does not allow creating entity without an id', ({ unitFixture }) => {
    const { id, ...entityWithoutId } = unitFixture.entity()
    expect(() => {
      new Entity(entityWithoutId as any)
    }).toThrow('Entity must have an id')
  })

  it('does not allow creating entity with an id with empty spaces', ({ unitFixture }) => {
    expect(() => {
      new Entity({ ...unitFixture.entity(), id: ' te st ' } as any)
    }).toThrow('Entity id " te st " cannot contain white spaces.')
  })

  it('does not allow creating entity with extra props', ({ unitFixture }) => {
    expect(() => {
      new Entity({ ...unitFixture.entity(), extraProp: 'foobar' } as any)
    }).toThrow('Props contain extra keys: extraProp.')
  })

  it('can compare entities', ({ unitFixture }) => {
    const entity = new Entity(unitFixture.entity())
    const entity2 = new Entity({
      ...unitFixture.entity(),
      id: 'testId2',
      visibility: Visibility.Private
    })
    expect(entity.isEqual(entity)).toBe(true)
    expect(entity.isEqual(entity2)).toBe(false)
  })

  it('can clone entity', ({ unitFixture }) => {
    const original = new Entity(unitFixture.entity())
    const clone = original.clone({ visibility: Visibility.Private })
    expect(original.visibility).toBe(unitFixture.serializedEntity().visibility)
    expect(clone.visibility).toBe(Visibility.Private)

    const { visibility: origVisibility, ...serializedOriginal } = original.serialize()
    const { visibility: cloneVisibility, ...serializedClone } = clone.serialize()
    expect(JSON.stringify(serializedOriginal)).toBe(JSON.stringify(serializedClone))
  })

  it('can serialize entity', ({ unitFixture }) => {
    const entity = new Entity(unitFixture.entity())
    expect(typeof entity.serialize()).toBe('object')
    expect(entity.serialize()).toStrictEqual(unitFixture.serializedEntity())
  })

  it('can stringify entity', ({ unitFixture }) => {
    const entity = new Entity(unitFixture.entity())
    expect(typeof entity.toString()).toBe('string')
    // we need to use JSON.parse and toStringEqual here instead of
    // JSON.stringify === JSON.stringify comparison because serializing the entity
    // (which the toString method calls) changes the order of the
    // properties from the original JSON
    expect(JSON.parse(entity.toString())).toStrictEqual(unitFixture.serializedEntity())
  })
})
