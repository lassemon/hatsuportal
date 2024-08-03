import { describe, expect, it } from 'vitest'
import { uuid } from '@hatsuportal/common'
import { InvalidCommentAuthorIdError } from '../errors/InvalidCommentAuthorIdError'
import { CommentAuthorId } from './CommentAuthorId'

describe('CommentAuthorId', () => {
  it('can create a comment author id', () => {
    const id = uuid()
    const commentAuthorId = new CommentAuthorId(id)
    expect(commentAuthorId).to.be.instanceOf(CommentAuthorId)
    expect(commentAuthorId.value).to.eq(id)
  })

  it('canCreate reflects validity', () => {
    expect(CommentAuthorId.canCreate(uuid())).toBe(true)
    expect(CommentAuthorId.canCreate('')).toBe(false)
  })

  it('does not allow creating a comment author id with an empty value', () => {
    expect(() => {
      new CommentAuthorId('')
    }).toThrow(InvalidCommentAuthorIdError)
    expect(() => {
      new CommentAuthorId(undefined as any)
    }).toThrow(InvalidCommentAuthorIdError)
    expect(() => {
      new CommentAuthorId(null as any)
    }).toThrow(InvalidCommentAuthorIdError)
  })

  it('does not allow creating a comment author id with an invalid value', () => {
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
        new CommentAuthorId(id)
      }).toThrow(InvalidCommentAuthorIdError)
    })
  })
})
