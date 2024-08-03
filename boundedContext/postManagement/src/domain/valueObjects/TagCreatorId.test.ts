import { describe, expect, it } from 'vitest'
import { uuid } from '@hatsuportal/common'
import { InvalidTagCreatorIdError } from '../errors/InvalidTagCreatorIdError'
import { TagCreatorId } from './TagCreatorId'

describe('TagCreatorId', () => {
  it('can create a tag creator id', () => {
    const id = uuid()
    const tagCreatorId = new TagCreatorId(id)
    expect(tagCreatorId).to.be.instanceOf(TagCreatorId)
    expect(tagCreatorId.value).to.eq(id)
  })

  it('canCreate reflects validity', () => {
    expect(TagCreatorId.canCreate(uuid())).toBe(true)
    expect(TagCreatorId.canCreate('')).toBe(false)
  })

  it('does not allow creating a tag creator id with an empty value', () => {
    expect(() => {
      new TagCreatorId('')
    }).toThrow(InvalidTagCreatorIdError)
    expect(() => {
      new TagCreatorId(undefined as any)
    }).toThrow(InvalidTagCreatorIdError)
    expect(() => {
      new TagCreatorId(null as any)
    }).toThrow(InvalidTagCreatorIdError)
  })

  it('does not allow creating a tag creator id with an invalid value', () => {
    const invalidIds = [
      '    ',
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
        new TagCreatorId(id)
      }).toThrow(InvalidTagCreatorIdError)
    })
  })
})
