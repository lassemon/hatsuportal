import { describe, expect, it } from 'vitest'
import { uuid } from '@hatsuportal/common'
import { InvalidTagIdError } from '../errors/InvalidTagIdError'
import { TagId } from './TagId'
import * as Fixture from '../../__test__/testFactory'

describe('TagId', () => {
  it('can create a tag id', () => {
    const id = uuid()
    const tagId = new TagId(id)
    expect(tagId).to.be.instanceOf(TagId)
    expect(tagId.value).to.eq(id)
  })

  it('does not allow creating a tag id with an empty value', () => {
    expect(() => {
      new TagId('')
    }).toThrow(InvalidTagIdError)
    expect(() => {
      new TagId(undefined as any)
    }).toThrow(InvalidTagIdError)
    expect(() => {
      new TagId(null as any)
    }).toThrow(InvalidTagIdError)
  })

  it('does not allow creating a tag id with an invalid value', () => {
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
        new TagId(id)
      }).toThrow(InvalidTagIdError)
    })
  })

  it('creates from fixture sample id', () => {
    const tagId = new TagId(Fixture.sampleTagId)
    expect(tagId.value).toBe(Fixture.sampleTagId)
  })

  it('canCreate reflects validity', () => {
    expect(TagId.canCreate(Fixture.sampleTagId)).toBe(true)
    expect(TagId.canCreate('')).toBe(false)
  })
})
