import { describe, expect, it } from 'vitest'
import { CommentApiMapper } from './CommentApiMapper'
import { InvalidRequestError } from '@hatsuportal/platform'
import { OrderEnum } from '@hatsuportal/common'

describe('CommentApiMapper', () => {
  const commentMapper = new CommentApiMapper()

  it('converts comment with relations dto to response', ({ unitFixture }) => {
    const dto = unitFixture.commentWithRelationsDTOMock()
    const response = commentMapper.toCommentResponse(dto)

    expect(response.id).toBe(dto.id)
    expect(response.postId).toBe(dto.postId)
    expect(response.authorId).toBe(dto.authorId)
    expect(response.authorName).toBe(dto.authorName)
    expect(response.body).toBe(dto.body)
    expect(response.replyCount).toBe(dto.replyCount)
    expect(response.hasReplies).toBe(dto.hasReplies)
  })

  it('converts get comments request to input dto', ({ unitFixture }) => {
    const input = commentMapper.toGetCommentsInputDTO({ limit: 5, cursor: 'cursor-value' }, unitFixture.sampleStoryId)

    expect(input.postId).toBe(unitFixture.sampleStoryId)
    expect(input.limit).toBe(5)
    expect(input.cursor).toBe('cursor-value')
    expect(input.sort).toBe(OrderEnum.Descending)
  })

  it('converts comment list chunk dto to get comments response', ({ unitFixture }) => {
    const chunk = unitFixture.commentListChunkDTOMock()
    const response = commentMapper.toGetCommentsResponse(chunk)

    expect(response.comments).toHaveLength(1)
    expect(response.nextCursor).toBe(chunk.nextCursor)
    expect(response.comments[0]?.id).toBe(chunk.comments[0]?.id)
  })

  it('converts get replies request to input dto', ({ unitFixture }) => {
    const input = commentMapper.toGetRepliesInputDTO({ limit: 8, cursor: 'reply-cursor' }, unitFixture.sampleCommentId)

    expect(input.parentCommentId).toBe(unitFixture.sampleCommentId)
    expect(input.limit).toBe(8)
    expect(input.cursor).toBe('reply-cursor')
  })

  it('converts replies preview dto to get replies response', ({ unitFixture }) => {
    const preview = unitFixture.repliesPreviewDTOMock({
      replies: [
        {
          id: unitFixture.sampleCommentId,
          authorId: unitFixture.sampleUserId,
          authorName: unitFixture.sampleUserName,
          body: 'reply',
          isDeleted: false,
          createdAt: unitFixture.commentDTOMock().createdAt
        }
      ]
    })
    const response = commentMapper.toGetRepliesResponse(preview)

    expect(response.replies).toHaveLength(1)
    expect(response.nextCursor).toBe(preview.nextCursor)
  })

  it('converts add comment request to input dto for top-level comment', ({ unitFixture }) => {
    const input = commentMapper.toAddCommentInputDTO({ body: '  hello  ' }, unitFixture.sampleStoryId, unitFixture.sampleUserId)

    expect(input.postId).toBe(unitFixture.sampleStoryId)
    expect(input.body).toBe('hello')
    expect(input.authorId).toBe(unitFixture.sampleUserId)
    expect(input.target.kind).toBe('TopLevel')
  })

  it('converts add comment request to input dto for reply', ({ unitFixture }) => {
    const input = commentMapper.toAddCommentInputDTO(
      { body: 'reply body', parentCommentId: unitFixture.sampleParentCommentId },
      unitFixture.sampleStoryId,
      unitFixture.sampleUserId
    )

    expect(input.parentCommentId).toBe(unitFixture.sampleParentCommentId)
    expect(input.target.kind).toBe('Reply')
  })

  it('throws InvalidRequestError when logged in user id is missing for add comment', ({ unitFixture }) => {
    expect(() => commentMapper.toAddCommentInputDTO({ body: 'hello' }, unitFixture.sampleStoryId)).toThrow(InvalidRequestError)
  })

  it('converts edit comment request to input dto', ({ unitFixture }) => {
    const input = commentMapper.toEditCommentInputDTO({ body: '  updated  ' }, unitFixture.sampleCommentId, unitFixture.sampleUserId)

    expect(input.commentId).toBe(unitFixture.sampleCommentId)
    expect(input.body).toBe('updated')
    expect(input.authorId).toBe(unitFixture.sampleUserId)
  })

  it('converts delete comment request to input dto', ({ unitFixture }) => {
    const input = commentMapper.toDeleteCommentInputDTO(unitFixture.sampleCommentId, unitFixture.sampleUserId)

    expect(input.commentId).toBe(unitFixture.sampleCommentId)
    expect(input.authorId).toBe(unitFixture.sampleUserId)
    expect(input.deletingUserId).toBe(unitFixture.sampleUserId)
  })

  it('throws InvalidRequestError when logged in user id is missing for edit comment', ({ unitFixture }) => {
    expect(() => commentMapper.toEditCommentInputDTO({ body: 'updated' }, unitFixture.sampleCommentId)).toThrow(InvalidRequestError)
  })

  it('throws InvalidRequestError when logged in user id is missing for delete comment', ({ unitFixture }) => {
    expect(() => commentMapper.toDeleteCommentInputDTO(unitFixture.sampleCommentId)).toThrow(InvalidRequestError)
  })
})
