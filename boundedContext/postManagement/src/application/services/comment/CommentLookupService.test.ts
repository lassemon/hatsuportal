import { describe, expect, it, vi } from 'vitest'
import { OrderEnum } from '@hatsuportal/common'
import { EntityLoadResult, NotFoundError } from '@hatsuportal/platform'
import { NonNegativeInteger } from '@hatsuportal/shared-kernel'
import { CommentLookupService } from './CommentLookupService'
import { CommentId, PostId } from '../../../domain'
import { UserLoadError } from '../../acl/userManagement/errors/UserLoadError'

describe('CommentLookupService', () => {
  it('enriches a comment with author name', async ({ unitFixture }) => {
    const commentReadRepository = unitFixture.commentReadRepositoryMock()
    const userGateway = unitFixture.userGatewayMock()
    const service = new CommentLookupService(commentReadRepository, userGateway)

    const result = await service.getById(new CommentId(unitFixture.sampleCommentId))

    expect(result).not.toBeNull()
    expect(result?.authorName).toBe(unitFixture.userReadModelDTOMock().name)
  })

  it('returns null when comment is not found', async ({ unitFixture }) => {
    const commentReadRepository = unitFixture.commentReadRepositoryMock()
    commentReadRepository.getById = vi.fn().mockResolvedValue(null)
    const service = new CommentLookupService(commentReadRepository, unitFixture.userGatewayMock())

    const result = await service.getById(new CommentId(unitFixture.sampleCommentId))
    expect(result).toBeNull()
  })

  it('throws NotFoundError when author cannot be loaded', async ({ unitFixture }) => {
    const commentReadRepository = unitFixture.commentReadRepositoryMock()
    const userGateway = unitFixture.userGatewayMock()
    userGateway.getUserById = vi
      .fn()
      .mockResolvedValue(EntityLoadResult.failure(new UserLoadError({ userId: unitFixture.sampleUserId, error: new Error('not found') })))
    const service = new CommentLookupService(commentReadRepository, userGateway)

    await expect(service.getById(new CommentId(unitFixture.sampleCommentId))).rejects.toBeInstanceOf(NotFoundError)
  })

  it('lists top-level comments for a post with enriched authors', async ({ unitFixture }) => {
    const service = new CommentLookupService(unitFixture.commentReadRepositoryMock(), unitFixture.userGatewayMock())

    const result = await service.listTopLevelForPost(new PostId(unitFixture.sampleStoryId), {
      limit: new NonNegativeInteger(10),
      sort: OrderEnum.Descending,
      replyPreviewOptions: { perParentLimit: new NonNegativeInteger(3) }
    })

    expect(result.comments).toHaveLength(1)
    expect(result.comments[0]?.authorName).toBe(unitFixture.userReadModelDTOMock().name)
  })

  it('lists replies with enriched authors', async ({ unitFixture }) => {
    const commentReadRepository = unitFixture.commentReadRepositoryMock()
    commentReadRepository.listReplies = vi.fn().mockResolvedValue({
      replies: [
        {
          id: unitFixture.sampleCommentId,
          authorId: unitFixture.sampleUserId,
          body: 'reply body',
          isDeleted: false,
          createdAt: unitFixture.commentDTOMock().createdAt
        }
      ],
      nextCursor: null
    })
    const service = new CommentLookupService(commentReadRepository, unitFixture.userGatewayMock())

    const result = await service.listReplies(new CommentId(unitFixture.sampleCommentId), {
      limit: new NonNegativeInteger(10),
      sort: OrderEnum.Ascending
    })

    expect(result.replies).toHaveLength(1)
    expect(result.replies[0]?.authorName).toBe(unitFixture.userReadModelDTOMock().name)
  })

  it('delegates countForPost to read repository', async ({ unitFixture }) => {
    const commentReadRepository = unitFixture.commentReadRepositoryMock()
    const service = new CommentLookupService(commentReadRepository, unitFixture.userGatewayMock())

    const count = await service.countForPost(new PostId(unitFixture.sampleStoryId))
    expect(count).toBe(1)
    expect(commentReadRepository.countForPost).toHaveBeenCalledTimes(1)
  })

  it('delegates countReplies to read repository', async ({ unitFixture }) => {
    const commentReadRepository = unitFixture.commentReadRepositoryMock()
    const service = new CommentLookupService(commentReadRepository, unitFixture.userGatewayMock())

    const count = await service.countReplies(new CommentId(unitFixture.sampleCommentId))
    expect(count).toBe(0)
    expect(commentReadRepository.countReplies).toHaveBeenCalledTimes(1)
  })
})
