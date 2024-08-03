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
