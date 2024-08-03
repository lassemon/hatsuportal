import { describe, expect, it } from 'vitest'
import { CommentApplicationMapper } from './CommentApplicationMapper'
import { Comment } from '../../domain'

describe('CommentApplicationMapper', () => {
  const commentMapper = new CommentApplicationMapper()

  it('converts comment entity to dto', ({ unitFixture }) => {
    const comment = unitFixture.commentMock()
    const result = commentMapper.toDTO(comment)
    expect(typeof result).toBe('object')
    expect(result).toStrictEqual(unitFixture.commentDTOMock())
  })

  it('converts dto into comment entity', ({ unitFixture }) => {
    const comment = commentMapper.dtoToDomainEntity(unitFixture.commentDTOMock())
    expect(comment).toBeInstanceOf(Comment)
    expect({
      id: comment.id.value,
      postId: comment.postId.value,
      authorId: comment.authorId.value,
      body: comment.body?.value ?? null,
      parentCommentId: comment.parentCommentId?.value ?? null,
      isDeleted: comment.isDeleted,
      createdAt: comment.createdAt.value,
      updatedAt: comment.updatedAt.value
    }).toStrictEqual({
      ...unitFixture.commentDTOMock(),
      parentCommentId: unitFixture.commentDTOMock().parentCommentId ?? 'UNKNOWN_UNIQUE_ID'
    })
  })

  it('converts deleted comment dto with null body', ({ unitFixture }) => {
    const dto = unitFixture.commentDTOMock({ body: null, isDeleted: true })
    const comment = commentMapper.dtoToDomainEntity(dto)
    expect(comment.body).toBeNull()
    expect(comment.isDeleted).toBe(true)
  })
})
