import { describe, expect, it } from 'vitest'
import { InvalidOwnerTypeError } from '../errors/InvalidOwnerTypeError'
import { OwnerType } from './OwnerType'
import { EntityTypeEnum } from '@hatsuportal/common'

describe('OwnerType', () => {
  it('can create an owner type', () => {
    const ownerType = new OwnerType(EntityTypeEnum.Story)
    expect(ownerType).to.be.instanceOf(OwnerType)
    expect(ownerType.value).to.eq(EntityTypeEnum.Story)
  })

  it('canCreate reflects validity', () => {
    expect(OwnerType.canCreate(EntityTypeEnum.Story)).toBe(true)
    expect(OwnerType.canCreate('invalid' as EntityTypeEnum)).toBe(false)
  })

  it('assertCanCreate validates without returning a value', () => {
    expect(() => OwnerType.assertCanCreate(EntityTypeEnum.Story)).not.toThrow()
    expect(() => OwnerType.assertCanCreate('invalid' as EntityTypeEnum)).toThrow(InvalidOwnerTypeError)
  })

  it('compares by value against OwnerType instances and raw enum values', () => {
    const story = new OwnerType(EntityTypeEnum.Story)
    const sameStory = new OwnerType(EntityTypeEnum.Story)
    const recipe = new OwnerType(EntityTypeEnum.Recipe)

    expect(story.equals(sameStory)).toBe(true)
    expect(story.equals(EntityTypeEnum.Story)).toBe(true)
    expect(story.equals(recipe)).toBe(false)
    expect(story.equals(EntityTypeEnum.Recipe)).toBe(false)
    expect(story.equals('unknown')).toBe(false)
  })

  it('stringifies to the enum value', () => {
    const ownerType = new OwnerType(EntityTypeEnum.Story)
    expect(ownerType.toString()).toBe(EntityTypeEnum.Story)
  })

  it('does not allow creating an owner type with an empty value', () => {
    expect(() => {
      new OwnerType('' as any)
    }).toThrow(InvalidOwnerTypeError)
    expect(() => {
      new OwnerType(undefined as any)
    }).toThrow(InvalidOwnerTypeError)
    expect(() => {
      new OwnerType(null as any)
    }).toThrow(InvalidOwnerTypeError)
  })

  it('does not allow creating an owner type with an invalid value', () => {
    const invalidOwnerTypes = ['   ', 'master', 'admin', 'foobar', 1, 0, -1] as any[]

    invalidOwnerTypes.forEach((ownerType) => {
      expect(() => {
        new OwnerType(ownerType)
      }).toThrow(InvalidOwnerTypeError)
    })
  })
})
