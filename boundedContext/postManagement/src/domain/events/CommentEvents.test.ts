import { describe, expect, it } from 'vitest'
import {
  CommentCreatedEvent,
  CommentDeletedEvent,
  CommentSoftDeletedEvent,
  CommentUpdatedEvent
} from './CommentEvents'

describe('CommentEvents', () => {
  it('constructs comment lifecycle events with payload data', () => {
    expect(
      new CommentCreatedEvent({
        id: 'comment-1',
        postId: 'post-1',
        authorId: 'user-1',
        body: 'Hello',
        parentCommentId: null
      }).eventType
    ).toBe('CommentCreated')

    expect(
      new CommentUpdatedEvent({
        id: 'comment-1',
        postId: 'post-1',
        authorId: 'user-1',
        body: 'Updated',
        parentCommentId: null
      }).eventType
    ).toBe('CommentUpdated')

    expect(
      new CommentSoftDeletedEvent({
        id: 'comment-1',
        postId: 'post-1',
        deletedById: 'user-1',
        deletedAt: 1,
        parentCommentId: null
      }).eventType
    ).toBe('CommentSoftDeleted')

    expect(
      new CommentDeletedEvent({
        id: 'comment-1',
        postId: 'post-1',
        deletedById: 'user-1',
        deletedAt: 2,
        parentCommentId: null
      }).eventType
    ).toBe('CommentDeleted')
  })
})
