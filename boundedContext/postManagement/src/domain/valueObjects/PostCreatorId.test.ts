import { describe, expect, it } from 'vitest'
import { uuid } from '@hatsuportal/common'
import { InvalidPostCreatorIdError } from '../errors/InvalidPostCreatorIdError'
import { PostCreatorId } from './PostCreatorId'

describe('PostCreatorId', () => {
  it('can create a post creator id', () => {
    const id = uuid()
    const postCreatorId = new PostCreatorId(id)
    expect(postCreatorId).to.be.instanceOf(PostCreatorId)
    expect(postCreatorId.value).to.eq(id)
  })

  it('does not allow creating a post creator id with an empty value', () => {
    expect(() => {
      new PostCreatorId('')
    }).toThrow(InvalidPostCreatorIdError)
    expect(() => {
      new PostCreatorId(undefined as any)
    }).toThrow(InvalidPostCreatorIdError)
    expect(() => {
      new PostCreatorId(null as any)
    }).toThrow(InvalidPostCreatorIdError)
  })

  it('does not allow creating a post creator id with an invalid value', () => {
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
        new PostCreatorId(id)
      }).toThrow(InvalidPostCreatorIdError)
    })
  })
})
