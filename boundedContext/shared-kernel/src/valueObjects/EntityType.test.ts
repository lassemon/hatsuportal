import { describe, expect, it } from 'vitest'
import { EntityTypeEnum } from '@hatsuportal/common'
import { EntityType } from './EntityType'
import { InvalidEntityTypeError } from '../errors/InvalidEntityTypeError'

describe('EntityType', () => {
  it('can create an entity type', () => {
    const entityType = new EntityType(EntityTypeEnum.Story)
    expect(entityType).to.be.instanceOf(EntityType)
    expect(entityType.value).to.eq(EntityTypeEnum.Story)
  })

  it('does not allow creating an entity type with an empty value', () => {
    expect(() => {
      new EntityType('' as any)
    }).toThrow(InvalidEntityTypeError)
    expect(() => {
      new EntityType(undefined as any)
    }).toThrow(InvalidEntityTypeError)
    expect(() => {
      new EntityType(null as any)
    }).toThrow(InvalidEntityTypeError)
  })

  it('does not allow creating an entity type with an invalid value', () => {
    const invalidEntityTypes = ['   ', 'master', 'admin', 'foobar', 1, 0, -1] as any[]

    invalidEntityTypes.forEach((entityType) => {
      expect(() => {
        new EntityType(entityType)
      }).toThrow(InvalidEntityTypeError)
    })
  })
})
