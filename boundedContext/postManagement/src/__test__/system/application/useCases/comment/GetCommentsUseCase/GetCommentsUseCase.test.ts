import { describe, expect, it } from 'vitest'
import { OrderEnum, uuid, unixtimeNow } from '@hatsuportal/common'
import { CreatedAtTimestamp, NonNegativeInteger, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { CommentAuthorId, CommentId, PostId } from '../../../../../../domain'
import { createCommentWriteRepository } from '../../../../../support/fixtures/commentFixture'
import { seedStoryFixture } from '../../../../../support/fixtures/storyFixture'
import { persistenceHarness } from '../../../../../setup.db'
import { systemWiring } from '../../../../../setup.system'

describe('GetCommentsUseCase (system)', () => {
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
        authorId: new CommentAuthorId(unitFixture.sampleUserId),
        createdAt: new CreatedAtTimestamp(createdAt),
        updatedAt: new UnixTimestamp(createdAt)
      })
      await persistenceHarness.createUnitOfWork().execute(async () => {
        await commentWriteRepository.insert(comment)
        return [null]
      })
      seededIds.push(comment.id.value)
    }

    let firstPageIds: string[] = []
    let firstPageNextCursor: string | null = null

    await systemWiring.createGetCommentsUseCaseWithValidation().execute({
      defaultSortOrder: OrderEnum.Ascending,
      defaultRepliesPreviewLimit: new NonNegativeInteger(0),
      getCommentsInput: {
        postId: storyId,
        limit: 2,
        sort: OrderEnum.Ascending
      },
      commentsFound: (chunk) => {
        firstPageIds = chunk.comments.map((row) => row.id)
        firstPageNextCursor = chunk.nextCursor
      }
    })

    expect(firstPageIds).toHaveLength(2)
    expect(firstPageNextCursor).not.toBeNull()

    let secondPageIds: string[] = []

    await systemWiring.createGetCommentsUseCaseWithValidation().execute({
      defaultSortOrder: OrderEnum.Ascending,
      defaultRepliesPreviewLimit: new NonNegativeInteger(0),
      getCommentsInput: {
        postId: storyId,
        limit: 2,
        sort: OrderEnum.Ascending,
        cursor: firstPageNextCursor!
      },
      commentsFound: (chunk) => {
        secondPageIds = chunk.comments.map((row) => row.id)
      }
    })

    const allIds = [...firstPageIds, ...secondPageIds]
    expect(allIds).toEqual(expect.arrayContaining(seededIds))
    expect(new Set(allIds).size).toBe(seededIds.length)
  })
})
