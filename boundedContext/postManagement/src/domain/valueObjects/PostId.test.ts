import { describe, expect, it } from 'vitest'
import { PostId } from './PostId'
import { uuid } from '@hatsuportal/common'
import { InvalidPostIdError } from '../errors/InvalidPostIdError'

describe('PostId', () => {
  it('can create a post id', () => {
    const id = uuid()
    const postId = new PostId(id)
    expect(postId).to.be.instanceOf(PostId)
    expect(postId.value).to.eq(id)
  })

  it('does not allow creating a post id with an empty value', () => {
    expect(() => {
      new PostId('')
    }).toThrow(InvalidPostIdError)
    expect(() => {
      new PostId(undefined as any)
    }).toThrow(InvalidPostIdError)
    expect(() => {
      new PostId(null as any)
    }).toThrow(InvalidPostIdError)
  })

  it('does not allow creating a post id with an invalid value', () => {
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
        new PostId(id)
      }).toThrow(InvalidPostIdError)
    })
  })
})
