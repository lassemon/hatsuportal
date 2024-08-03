import { describe, expect, it } from 'vitest'
import { OrderEnum } from '@hatsuportal/common'
import { NonNegativeInteger } from '@hatsuportal/shared-kernel'
import { CommentId, PostId } from '../../domain'
import { CommentReadModelDTO } from '../../application'
import { MapCache } from '../../__test__/mapCache'
import { CommentReadRepositoryWithCache } from './CommentReadRepositoryWithCache'
import * as Fixture from '../../__test__/testFactory'

describe('CommentReadRepositoryWithCache', () => {
  const setup = () => {
    const baseRepo = Fixture.commentReadRepositoryMock()
    const cache = new MapCache<CommentReadModelDTO>()
    const repository = new CommentReadRepositoryWithCache(baseRepo, cache)
    return { baseRepo, cache, repository }
  }

  it('loads getById from base on miss and serves cache on hit', async () => {
    const { baseRepo, repository } = setup()
    const comment = Fixture.commentReadModelDTOMock()
    baseRepo.getById.mockResolvedValue(comment)

    await expect(repository.getById(new CommentId(Fixture.sampleCommentId))).resolves.toEqual(comment)
    await expect(repository.getById(new CommentId(Fixture.sampleCommentId))).resolves.toEqual(comment)
    expect(baseRepo.getById).toHaveBeenCalledTimes(1)
  })

  it('passes through listTopLevelForPost without caching', async () => {
    const { baseRepo, cache, repository } = setup()
    const chunk = { comments: [Fixture.commentReadModelDTOMock()], nextCursor: null }
    baseRepo.listTopLevelForPost.mockResolvedValue(chunk)

    const options = {
      limit: new NonNegativeInteger(10),
      sort: OrderEnum.Ascending,
      replyPreviewOptions: { perParentLimit: new NonNegativeInteger(3) }
    }

    await expect(repository.listTopLevelForPost(new PostId(Fixture.sampleStoryId), options)).resolves.toEqual(chunk)
    await expect(repository.listTopLevelForPost(new PostId(Fixture.sampleStoryId), options)).resolves.toEqual(chunk)
    expect(baseRepo.listTopLevelForPost).toHaveBeenCalledTimes(2)
    expect(cache.store.size).toBe(0)
  })

  it('passes through listReplies without caching', async () => {
    const { baseRepo, cache, repository } = setup()
    const chunk = { replies: [], nextCursor: null }
    baseRepo.listReplies.mockResolvedValue(chunk)

    const options = { limit: new NonNegativeInteger(10), sort: OrderEnum.Ascending }

    await expect(repository.listReplies(new CommentId(Fixture.sampleParentCommentId), options)).resolves.toEqual(chunk)
    await expect(repository.listReplies(new CommentId(Fixture.sampleParentCommentId), options)).resolves.toEqual(chunk)
    expect(baseRepo.listReplies).toHaveBeenCalledTimes(2)
    expect(cache.store.size).toBe(0)
  })
})
