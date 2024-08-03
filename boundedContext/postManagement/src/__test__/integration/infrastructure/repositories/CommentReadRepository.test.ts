import { beforeAll, describe, expect, it } from 'vitest'
import { OrderEnum, uuid, unixtimeNow } from '@hatsuportal/common'
import { CreatedAtTimestamp, NonNegativeInteger, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { CommentReadRepository } from '../../../../infrastructure/repositories/CommentReadRepository'
import { CommentInfrastructureMapper } from '../../../../infrastructure/mappers/CommentInfrastructureMapper'
import { CommentCursor, CommentId, PostId } from '../../../../domain'
import { createCommentWriteRepository, seedCommentFixture } from '../../../support/fixtures/commentFixture'
import { seedStoryFixture } from '../../../support/fixtures/storyFixture'
import { persistenceHarness } from '../../../setup.db'

describe('CommentReadRepository (integration)', () => {
  let repository: CommentReadRepository

  beforeAll(() => {
    repository = new CommentReadRepository(
      {
        defaultRepliesPreviewLimit: new NonNegativeInteger(4),
        defaultRepliesSortOrder: OrderEnum.Ascending
      },
      persistenceHarness.dataAccessProvider,
      persistenceHarness.repositoryHelpers,
      persistenceHarness.transactionContext,
      new CommentInfrastructureMapper()
    )
  })

  it('lists top-level comments and counts for a post', async ({ unitFixture }) => {
    const { comment, storyId } = await seedCommentFixture(persistenceHarness, unitFixture)

    const list = await repository.listTopLevelForPost(new PostId(storyId), {
      limit: new NonNegativeInteger(10),
      sort: OrderEnum.Ascending,
      replyPreviewOptions: { perParentLimit: new NonNegativeInteger(2) }
    })
    const count = await repository.countForPost(new PostId(storyId))

    expect(list.comments.some((row) => row.id === comment.id.value)).toBe(true)
    expect(count).toBeGreaterThanOrEqual(1)
  })

  it('lists replies for a parent comment', async ({ unitFixture }) => {
    const { comment, storyId } = await seedCommentFixture(persistenceHarness, unitFixture)
    const commentWriteRepository = createCommentWriteRepository(persistenceHarness)
    const reply = unitFixture.commentMock({
      postId: new PostId(storyId),
      parentCommentId: comment.id
    })

    await persistenceHarness.createUnitOfWork().execute(async () => {
      await commentWriteRepository.insert(reply)
      return [null]
    })

    const replies = await repository.listReplies(comment.id, {
      limit: new NonNegativeInteger(10),
      sort: OrderEnum.Ascending
    })
    const replyCount = await repository.countReplies(comment.id)

    expect(replies.replies.some((row) => row.id === reply.id.value)).toBe(true)
    expect(replyCount).toBeGreaterThanOrEqual(1)
  })

  it('returns soft-deleted comments with body null', async ({ unitFixture }) => {
    const { comment, storyId, commentWriteRepository } = await seedCommentFixture(persistenceHarness, unitFixture)

    await persistenceHarness.createUnitOfWork().execute(async () => {
      await commentWriteRepository.softDelete(comment.id)
      return [null]
    })

    const byId = await repository.getById(comment.id)
    expect(byId?.isDeleted).toBe(true)
    expect(byId?.body).toBeNull()

    const list = await repository.listTopLevelForPost(new PostId(storyId), {
      limit: new NonNegativeInteger(10),
      sort: OrderEnum.Ascending,
      replyPreviewOptions: { perParentLimit: new NonNegativeInteger(0) }
    })
    const row = list.comments.find((item) => item.id === comment.id.value)
    expect(row?.isDeleted).toBe(true)
    expect(row?.body).toBeNull()
  })

  it('paginates top-level comments with cursor keyset', async ({ unitFixture }) => {
    const { story } = await seedStoryFixture(persistenceHarness, unitFixture)
    const storyId = story.id.value
    const commentWriteRepository = createCommentWriteRepository(persistenceHarness)
    const baseCreatedAt = unixtimeNow() - 10_000

    const seededIds: string[] = []
    for (let index = 0; index < 3; index++) {
      const createdAt = baseCreatedAt + index * 1_000
      const comment = unitFixture.commentMock({
        id: new CommentId(uuid()),
        postId: new PostId(storyId),
        createdAt: new CreatedAtTimestamp(createdAt),
        updatedAt: new UnixTimestamp(createdAt)
      })
      await persistenceHarness.createUnitOfWork().execute(async () => {
        await commentWriteRepository.insert(comment)
        return [null]
      })
      seededIds.push(comment.id.value)
    }

    const firstPage = await repository.listTopLevelForPost(new PostId(storyId), {
      limit: new NonNegativeInteger(2),
      sort: OrderEnum.Ascending,
      replyPreviewOptions: { perParentLimit: new NonNegativeInteger(0) }
    })

    expect(firstPage.comments).toHaveLength(2)
    expect(firstPage.nextCursor).not.toBeNull()

    const secondPage = await repository.listTopLevelForPost(new PostId(storyId), {
      limit: new NonNegativeInteger(2),
      sort: OrderEnum.Ascending,
      cursor: CommentCursor.fromCursorString(firstPage.nextCursor!),
      replyPreviewOptions: { perParentLimit: new NonNegativeInteger(0) }
    })

    const allIds = [...firstPage.comments, ...secondPage.comments].map((row) => row.id)
    expect(allIds).toEqual(expect.arrayContaining(seededIds))
    expect(new Set(allIds).size).toBe(seededIds.length)
  })

  it('paginates replies with cursor keyset', async ({ unitFixture }) => {
    const { comment, storyId } = await seedCommentFixture(persistenceHarness, unitFixture)
    const commentWriteRepository = createCommentWriteRepository(persistenceHarness)
    const baseCreatedAt = unixtimeNow() - 10_000

    const replyIds: string[] = []
    for (let index = 0; index < 3; index++) {
      const createdAt = baseCreatedAt + index * 1_000
      const reply = unitFixture.commentMock({
        id: new CommentId(uuid()),
        postId: new PostId(storyId),
        parentCommentId: comment.id,
        createdAt: new CreatedAtTimestamp(createdAt),
        updatedAt: new UnixTimestamp(createdAt)
      })
      await persistenceHarness.createUnitOfWork().execute(async () => {
        await commentWriteRepository.insert(reply)
        return [null]
      })
      replyIds.push(reply.id.value)
    }

    const firstPage = await repository.listReplies(comment.id, {
      limit: new NonNegativeInteger(2),
      sort: OrderEnum.Ascending
    })

    expect(firstPage.replies).toHaveLength(2)
    expect(firstPage.nextCursor).not.toBeNull()

    const secondPage = await repository.listReplies(comment.id, {
      limit: new NonNegativeInteger(2),
      sort: OrderEnum.Ascending,
      cursor: CommentCursor.fromCursorString(firstPage.nextCursor!)
    })

    const allIds = [...firstPage.replies, ...secondPage.replies].map((row) => row.id)
    expect(allIds).toEqual(expect.arrayContaining(replyIds))
    expect(new Set(allIds).size).toBe(replyIds.length)
  })

  it('sorts top-level comments ascending and descending by createdAt', async ({ unitFixture }) => {
    const { storyId } = await seedCommentFixture(persistenceHarness, unitFixture)
    const commentWriteRepository = createCommentWriteRepository(persistenceHarness)
    const baseCreatedAt = unixtimeNow() - 10_000

    for (let index = 0; index < 3; index++) {
      const createdAt = baseCreatedAt + index * 1_000
      const comment = unitFixture.commentMock({
        id: new CommentId(uuid()),
        postId: new PostId(storyId),
        createdAt: new CreatedAtTimestamp(createdAt),
        updatedAt: new UnixTimestamp(createdAt)
      })
      await persistenceHarness.createUnitOfWork().execute(async () => {
        await commentWriteRepository.insert(comment)
        return [null]
      })
    }

    const ascending = await repository.listTopLevelForPost(new PostId(storyId), {
      limit: new NonNegativeInteger(10),
      sort: OrderEnum.Ascending,
      replyPreviewOptions: { perParentLimit: new NonNegativeInteger(0) }
    })
    const descending = await repository.listTopLevelForPost(new PostId(storyId), {
      limit: new NonNegativeInteger(10),
      sort: OrderEnum.Descending,
      replyPreviewOptions: { perParentLimit: new NonNegativeInteger(0) }
    })

    const ascTimestamps = ascending.comments.map((row) => row.createdAt)
    const descTimestamps = descending.comments.map((row) => row.createdAt)

    expect(ascTimestamps).toEqual([...ascTimestamps].sort((a, b) => a - b))
    expect(descTimestamps).toEqual([...descTimestamps].sort((a, b) => b - a))
    expect(ascTimestamps).toEqual([...descTimestamps].reverse())
  })
})
