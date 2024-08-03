import { describe, expect, it } from 'vitest'
import { CommentInfrastructureMapper } from './CommentInfrastructureMapper'
import { MissingBodyError } from '../../application/errors/MissingBodyError'

describe('CommentInfrastructureMapper', () => {
  const commentMapper = new CommentInfrastructureMapper()

  it('converts comment to insert record', ({ unitFixture }) => {
    const comment = unitFixture.commentMock()
    const insertRecord = commentMapper.toCommentInsertRecord(comment)

    expect(insertRecord.id).toBe(comment.id.value)
    expect(insertRecord.postId).toBe(comment.postId.value)
    expect(insertRecord.authorId).toBe(comment.authorId.value)
    expect(insertRecord.body).toBe(comment.body?.value)
  })

  it('throws MissingBodyError when converting comment without body to insert record', ({ unitFixture }) => {
    const comment = unitFixture.commentMock({ body: null, isDeleted: true })
    expect(() => commentMapper.toCommentInsertRecord(comment)).toThrow(MissingBodyError)
  })

  it('converts comment to update record', ({ unitFixture }) => {
    const comment = unitFixture.commentMock()
    const updateRecord = commentMapper.toCommentUpdateRecord(comment)

    expect(updateRecord.id).toBe(comment.id.value)
    expect(updateRecord.body).toBe(comment.body?.value)
    expect(updateRecord.isDeleted).toBe(comment.isDeleted)
  })

  it('converts comment database record to domain entity', ({ unitFixture }) => {
    const record = unitFixture.commentDatabaseRecord()
    const comment = commentMapper.toDomainEntity(record)

    expect(comment.id.value).toBe(record.id)
    expect(comment.postId.value).toBe(record.postId)
    expect(comment.authorId.value).toBe(record.authorId)
    expect(comment.body?.value).toBe(record.body)
    expect(comment.isDeleted).toBe(record.isDeleted)
  })

  it('converts comment database record to read model dto', ({ unitFixture }) => {
    const record = unitFixture.commentDatabaseRecord()
    const replies = { replies: [], nextCursor: null }
    const dto = commentMapper.toDTO(record, replies)

    expect(dto.id).toBe(record.id)
    expect(dto.postId).toBe(record.postId)
    expect(dto.authorId).toBe(record.authorId)
    expect(dto.body).toBe(record.body)
    expect(dto.replyCount).toBe(record.replyCount)
    expect(dto.hasReplies).toBe(record.hasReplies)
    expect(dto.repliesPreview).toStrictEqual(replies)
  })
})
