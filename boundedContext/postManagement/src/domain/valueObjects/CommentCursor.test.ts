import { describe, expect, it } from 'vitest'
import { CommentCursor } from './CommentCursor'
import * as Fixture from '../../__test__/testFactory'

describe('CommentCursor', () => {
  it('round-trips cursor props through base64 encoding', () => {
    const props = {
      parentId: null,
      createdAt: Fixture.commentDTOMock().createdAt,
      id: Fixture.sampleCommentId
    }

    const encoded = CommentCursor.toCursor(props)
    expect(CommentCursor.fromCursorStringToProps(encoded)).toEqual(props)
    expect(CommentCursor.fromCursorString(encoded).value).toBe(encoded)
  })

  it('round-trips reply cursor with parent id', () => {
    const props = {
      parentId: Fixture.sampleParentCommentId,
      createdAt: Fixture.commentDTOMock().createdAt,
      id: Fixture.sampleCommentId
    }

    const cursor = CommentCursor.fromCursorString(CommentCursor.toCursor(props))

    expect(cursor.parentId).toBe(Fixture.sampleParentCommentId)
    expect(cursor.id).toBe(Fixture.sampleCommentId)
  })

  it('compares cursors by encoded value', () => {
    const props = {
      parentId: null,
      createdAt: 1_700_000_000,
      id: Fixture.sampleCommentId
    }
    const a = CommentCursor.fromCursorString(CommentCursor.toCursor(props))
    const b = CommentCursor.fromCursorString(CommentCursor.toCursor(props))

    expect(a.equals(b)).toBe(true)
    expect(a.equals(CommentCursor.fromCursorString(CommentCursor.toCursor({ ...props, id: Fixture.sampleParentCommentId })))).toBe(
      false
    )
  })
})
