import { beforeAll, describe, expect, it } from 'vitest'
import { uuid, unixtimeNow } from '@hatsuportal/common'
import { CommentBody, CommentId, PostId } from '../../../../domain'
import { createCommentWriteRepository, seedCommentFixture } from '../../../support/fixtures/commentFixture'
import { persistenceHarness } from '../../../setup.db'
import { ConcurrencyError, DataPersistenceError } from '@hatsuportal/platform'

describe('CommentWriteRepository (integration)', () => {
  let repository: ReturnType<typeof createCommentWriteRepository>

  beforeAll(() => {
    repository = createCommentWriteRepository(persistenceHarness)
  })

  it('updates and soft-deletes a comment', async ({ unitFixture }) => {
    const { comment } = await seedCommentFixture(persistenceHarness, unitFixture)

    await persistenceHarness.createUnitOfWork().execute(async () => {
      const existing = await repository.findByIdForUpdate(comment.id)
      if (!existing) throw new Error('expected comment')

      const updated = existing.clone()
      updated.writeBody(new CommentBody('Updated comment body'))
      await repository.update(updated)
      await repository.softDelete(comment.id)

      const reloaded = await repository.findByIdForUpdate(comment.id)
      expect(reloaded?.body?.value).toBe('Updated comment body')
      expect(reloaded?.isDeleted).toBe(true)
      return [null]
    })
  })

  it('deletePermanently removes a comment', async ({ unitFixture }) => {
    const { comment } = await seedCommentFixture(persistenceHarness, unitFixture)

    await persistenceHarness.createUnitOfWork().execute(async () => {
      await repository.deletePermanently(comment.id)
      const loaded = await repository.findByIdForUpdate(comment.id)
      expect(loaded).toBeNull()
      return [null]
    })
  })

  it('throws ConcurrencyError when updating with stale version', async ({ unitFixture }) => {
    const { comment } = await seedCommentFixture(persistenceHarness, unitFixture)

    await expect(
      persistenceHarness.createUnitOfWork().execute(async () => {
        const existing = await repository.findByIdForUpdate(comment.id)
        expect(existing).toBeDefined()

        const scope = persistenceHarness.transactionContext.getScope()
        expect(scope).toBeDefined()

        await scope!.transaction
          .table('comments')
          .where('id', comment.id.value)
          .update({ updatedAt: unixtimeNow() + 10_000 })

        const updated = existing!.clone()
        updated.writeBody(new CommentBody('Stale update attempt'))
        await repository.update(updated)
        return [null]
      })
    ).rejects.toBeInstanceOf(ConcurrencyError)
  })

  it('rejects reply insert when parent comment does not exist', async ({ unitFixture }) => {
    const { storyId } = await seedCommentFixture(persistenceHarness, unitFixture)
    const missingParentId = new CommentId(uuid())

    await expect(
      persistenceHarness.createUnitOfWork().execute(async () => {
        const reply = unitFixture.commentMock({
          postId: new PostId(storyId),
          parentCommentId: missingParentId
        })
        await repository.insert(reply)
        return [null]
      })
    ).rejects.toSatisfy((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error)
      return (
        error instanceof DataPersistenceError ||
        /foreign|violates|parent|not found|same post/i.test(message)
      )
    })
  })
})
