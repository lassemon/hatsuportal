import { describe, expect, it } from 'vitest'
import { uuid } from '@hatsuportal/common'
import { InvalidCommentIdError } from '../errors/InvalidCommentIdError'
import { Comment, CommentAuthorId, CommentCreatedEvent, CommentId, CommentSoftDeletedEvent, CommentUpdatedEvent, PostId } from '../index'
import { CreatedAtTimestamp, NonEmptyString, UnixTimestamp, UniqueId } from '@hatsuportal/shared-kernel'

describe('Comment', () => {
  it('can create comment with all properties', ({ unitFixture }) => {
    const comment = unitFixture.commentMock()
    expect(comment.id.value).toBe(unitFixture.commentDTOMock().id)
    expect(comment.postId.value).toBe(unitFixture.commentDTOMock().postId)
    expect(comment.authorId.value).toBe(unitFixture.commentDTOMock().authorId)
    expect(comment.body?.value).toBe(unitFixture.commentDTOMock().body)
    expect(comment.isDeleted).toBe(false)
  })

  it('does not allow creating a comment without an id', ({ unitFixture }) => {
    const { id, ...commentWithoutId } = unitFixture.commentDTOMock()
    expect(() => {
      Comment.assertCanCreate(commentWithoutId)
    }).toThrow(InvalidCommentIdError)
  })

  it('does not allow creating a comment with an id containing empty spaces', ({ unitFixture }) => {
    expect(() => {
      Comment.assertCanCreate({ ...unitFixture.commentDTOMock(), id: ' te st ' })
    }).toThrow(InvalidCommentIdError)
  })

  it('can reconstruct a comment from props', ({ unitFixture }) => {
    const props = unitFixture.commentDTOMock()
    const comment = Comment.reconstruct({
      id: new CommentId(props.id),
      postId: new PostId(props.postId),
      authorId: new CommentAuthorId(props.authorId),
      body: props.body ? new NonEmptyString(props.body) : null,
      parentCommentId: CommentId.fromOptional(props.parentCommentId),
      isDeleted: props.isDeleted,
      createdAt: new CreatedAtTimestamp(props.createdAt),
      updatedAt: new UnixTimestamp(props.updatedAt)
    })
    expect(comment.id.value).toBe(props.id)
    expect(comment.body?.value).toBe(props.body)
  })

  it('canCreate returns true for valid props', ({ unitFixture }) => {
    expect(Comment.canCreate(unitFixture.commentDTOMock())).toBe(true)
  })

  it('canCreate returns false for invalid props', ({ unitFixture }) => {
    const { id, ...invalidProps } = unitFixture.commentDTOMock()
    expect(Comment.canCreate(invalidProps)).toBe(false)
  })

  it('emits CommentCreatedEvent on create', ({ unitFixture }) => {
    const props = unitFixture.commentPropsMock({ id: new CommentId(uuid()) })
    const comment = Comment.create(props)
    expect(comment.domainEvents.some((event) => event instanceof CommentCreatedEvent)).toBe(true)
  })

  it('emits CommentUpdatedEvent on writeBody', ({ unitFixture }) => {
    const comment = unitFixture.commentMock()
    comment.clearEvents()
    comment.writeBody(new NonEmptyString('Updated body'))
    expect(comment.domainEvents.some((event) => event instanceof CommentUpdatedEvent)).toBe(true)
    expect(comment.body?.value).toBe('Updated body')
  })

  it('emits CommentSoftDeletedEvent on softDelete', ({ unitFixture }) => {
    const comment = unitFixture.commentMock()
    comment.clearEvents()
    comment.softDelete(new UniqueId(unitFixture.sampleUserId))
    expect(comment.isDeleted).toBe(true)
    expect(comment.domainEvents.some((event) => event instanceof CommentSoftDeletedEvent)).toBe(true)
  })

  it('softDelete is idempotent', ({ unitFixture }) => {
    const comment = unitFixture.commentMock({ isDeleted: true, body: null })
    comment.clearEvents()
    comment.softDelete(new UniqueId(unitFixture.sampleUserId))
    expect(comment.domainEvents).toHaveLength(0)
  })

  it('can compare comments', ({ unitFixture }) => {
    const comment = unitFixture.commentMock()
    const otherComment = Comment.create({
      ...unitFixture.commentPropsMock({ id: new CommentId(uuid()) })
    })
    expect(comment.equals(comment)).toBe(true)
    expect(comment.equals(otherComment)).toBe(false)
  })
})
