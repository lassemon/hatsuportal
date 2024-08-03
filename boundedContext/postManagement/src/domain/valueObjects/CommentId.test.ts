import { describe, expect, it } from 'vitest'
import { uuid } from '@hatsuportal/common'
import { InvalidCommentIdError } from '../errors/InvalidCommentIdError'
import { CommentId } from './CommentId'
import * as Fixture from '../../__test__/testFactory'

describe('CommentId', () => {
  it('can create a comment id', () => {
    const id = uuid()
    const commentId = new CommentId(id)
    expect(commentId).to.be.instanceOf(CommentId)
    expect(commentId.value).to.eq(id)
  })

  it('exposes NOT_SET sentinel', () => {
    expect(CommentId.NOT_SET.value).toBe('UNKNOWN_UNIQUE_ID')
  })

  it('canCreate reflects validity', () => {
    expect(CommentId.canCreate(Fixture.sampleCommentId)).toBe(true)
    expect(CommentId.canCreate('')).toBe(false)
  })

  it('fromOptional returns null for unset values', () => {
    expect(CommentId.fromOptional(null)).toBeNull()
    expect(CommentId.fromOptional(undefined)).toBeNull()
    expect(CommentId.fromOptional(CommentId.NOT_SET)).toBeNull()
  })

  it('fromOptional returns CommentId for valid string or instance', () => {
    const fromString = CommentId.fromOptional(Fixture.sampleCommentId)
    const existing = new CommentId(Fixture.sampleCommentId)

    expect(fromString).toBeInstanceOf(CommentId)
    expect(fromString?.value).toBe(Fixture.sampleCommentId)
    expect(CommentId.fromOptional(existing)).toBe(existing)
  })

  it('does not allow creating a comment id with an empty value', () => {
    expect(() => {
      new CommentId('')
    }).toThrow(InvalidCommentIdError)
    expect(() => {
      new CommentId(undefined as any)
    }).toThrow(InvalidCommentIdError)
    expect(() => {
      new CommentId(null as any)
    }).toThrow(InvalidCommentIdError)
  })

  it('does not allow creating a comment id with an invalid value', () => {
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
        new CommentId(id)
      }).toThrow(InvalidCommentIdError)
    })
  })
})
