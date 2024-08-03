import { describe, expect, it } from 'vitest'
import { OrderEnum, uuid, unixtimeNow } from '@hatsuportal/common'
import { CreatedAtTimestamp, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { CommentId, PostId } from '../../../../../../domain'
import { createCommentWriteRepository, seedCommentFixture } from '../../../../../support/fixtures/commentFixture'
import { persistenceHarness } from '../../../../../setup.db'
import { systemWiring } from '../../../../../setup.system'

describe('GetRepliesUseCase (system)', () => {
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

    let firstPageIds: string[] = []
    let firstPageNextCursor: string | null = null

    await systemWiring.createGetRepliesUseCaseWithValidation().execute({
      defaultRepliesSortOrder: OrderEnum.Ascending,
      getRepliesInput: {
        parentCommentId: comment.id.value,
        limit: 2
      },
      repliesFound: (chunk) => {
        firstPageIds = chunk.replies.map((row) => row.id)
        firstPageNextCursor = chunk.nextCursor
      }
    })

    expect(firstPageIds).toHaveLength(2)
    expect(firstPageNextCursor).not.toBeNull()

    let secondPageIds: string[] = []

    await systemWiring.createGetRepliesUseCaseWithValidation().execute({
      defaultRepliesSortOrder: OrderEnum.Ascending,
      getRepliesInput: {
        parentCommentId: comment.id.value,
        limit: 2,
        cursor: firstPageNextCursor!
      },
      repliesFound: (chunk) => {
        secondPageIds = chunk.replies.map((row) => row.id)
      }
    })

    const allIds = [...firstPageIds, ...secondPageIds]
    expect(allIds).toEqual(expect.arrayContaining(replyIds))
    expect(new Set(allIds).size).toBe(replyIds.length)
  })
})
