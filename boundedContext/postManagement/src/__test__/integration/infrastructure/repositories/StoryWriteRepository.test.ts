import { beforeAll, describe, expect, it } from 'vitest'
import { ImageRoleEnum, unixtimeNow, uuid } from '@hatsuportal/common'
import { PostTitle } from '../../../../domain'
import { CoverImageId } from '../../../../domain'
import { createStoryWriteRepository, seedStoryFixture } from '../../../support/fixtures/storyFixture'
import { seedTagFixture } from '../../../support/fixtures/tagFixture'
import { seedCommentFixture } from '../../../support/fixtures/commentFixture'
import { insertImagesForeignKeyStub } from '../../../support/fkStubs/images'
import { persistenceHarness } from '../../../setup.db'
import { ConcurrencyError } from '@hatsuportal/platform'
import * as Fixture from '../../../testFactory'

describe('StoryWriteRepository (integration)', () => {
  let repository: ReturnType<typeof createStoryWriteRepository>

  beforeAll(() => {
    repository = createStoryWriteRepository(persistenceHarness)
  })

  it('updates a story inside a unit of work', async ({ unitFixture }) => {
    const { story } = await seedStoryFixture(persistenceHarness, unitFixture)

    await persistenceHarness.createUnitOfWork().execute(async () => {
      const existing = await repository.findByIdForUpdate(story.id)
      if (!existing) throw new Error('expected story')

      const updated = existing.clone()
      updated.rename(new PostTitle('Updated integration title'), story.createdById)
      await repository.update(updated)

      const reloaded = await repository.findByIdForUpdate(story.id)
      expect(reloaded?.title.value).toBe('Updated integration title')
      return [null]
    })
  })

  it('deletes a story', async ({ unitFixture }) => {
    const { story } = await seedStoryFixture(persistenceHarness, unitFixture)

    await persistenceHarness.createUnitOfWork().execute(async () => {
      const loaded = await repository.findByIdForUpdate(story.id)
      if (!loaded) throw new Error('expected story')
      await repository.delete(loaded)
      const afterDelete = await repository.findByIdForUpdate(story.id)
      expect(afterDelete).toBeNull()
      return [null]
    })
  })

  it('throws ConcurrencyError when updating with stale version', async ({ unitFixture }) => {
    const { story } = await seedStoryFixture(persistenceHarness, unitFixture)

    await expect(
      persistenceHarness.createUnitOfWork().execute(async () => {
        const existing = await repository.findByIdForUpdate(story.id)
        expect(existing).toBeDefined()

        const scope = persistenceHarness.transactionContext.getScope()
        expect(scope).toBeDefined()

        await scope!.transaction
          .table('posts')
          .where('id', story.id.value)
          .update({ updatedAt: unixtimeNow() + 10_000 })
        await repository.update(existing!.clone())
        return [null]
      })
    ).rejects.toBeInstanceOf(ConcurrencyError)
  })

  it('inserts and updates tag links and cover image link', async ({ unitFixture }) => {
    const { tag: firstTag } = await seedTagFixture(persistenceHarness, unitFixture)
    const { tag: secondTag } = await seedTagFixture(persistenceHarness, unitFixture)
    const coverImageId = new CoverImageId(uuid())

    await insertImagesForeignKeyStub(persistenceHarness, {
      id: coverImageId.value,
      createdById: unitFixture.sampleUserId
    })

    const { story } = await seedStoryFixture(persistenceHarness, unitFixture, {
      coverImageId,
      tagIds: [firstTag.id, secondTag.id]
    })

    const tagLinksAfterInsert = await persistenceHarness.dataAccessProvider
      .table('post_tag_links')
      .where('postId', story.id.value)
      .orderBy('tagId', 'asc')
    const imageLinkAfterInsert = await persistenceHarness.dataAccessProvider
      .table('post_image_links')
      .where({ postId: story.id.value, role: ImageRoleEnum.Cover })
      .first()

    expect(tagLinksAfterInsert.map((row: { tagId: string }) => row.tagId)).toEqual(
      [firstTag.id.value, secondTag.id.value].sort()
    )
    expect(imageLinkAfterInsert?.imageId).toBe(coverImageId.value)

    const replacementCoverImageId = new CoverImageId(uuid())
    await insertImagesForeignKeyStub(persistenceHarness, {
      id: replacementCoverImageId.value,
      createdById: unitFixture.sampleUserId
    })

    await persistenceHarness.createUnitOfWork().execute(async () => {
      const existing = await repository.findByIdForUpdate(story.id)
      if (!existing) throw new Error('expected story')

      const updated = existing.clone()
      updated.updateCoverImage(replacementCoverImageId, story.createdById)
      updated.setNewTags([secondTag.id], story.createdById)
      await repository.update(updated)
      return [null]
    })

    const tagLinksAfterUpdate = await persistenceHarness.dataAccessProvider
      .table('post_tag_links')
      .where('postId', story.id.value)
    const imageLinkAfterUpdate = await persistenceHarness.dataAccessProvider
      .table('post_image_links')
      .where({ postId: story.id.value, role: ImageRoleEnum.Cover })
      .first()

    expect(tagLinksAfterUpdate).toHaveLength(1)
    expect(tagLinksAfterUpdate[0]?.tagId).toBe(secondTag.id.value)
    expect(imageLinkAfterUpdate?.imageId).toBe(replacementCoverImageId.value)
  })

  it('cascade-deletes comments and link rows when story is deleted', async ({ unitFixture }) => {
    const { tag } = await seedTagFixture(persistenceHarness, unitFixture)
    const coverImageId = new CoverImageId(Fixture.sampleImageId)

    await insertImagesForeignKeyStub(persistenceHarness, {
      id: coverImageId.value,
      createdById: unitFixture.sampleUserId
    })

    const { story } = await seedStoryFixture(persistenceHarness, unitFixture, {
      coverImageId,
      tagIds: [tag.id]
    })
    const { comment } = await seedCommentFixture(persistenceHarness, unitFixture, story.id.value)

    await persistenceHarness.createUnitOfWork().execute(async () => {
      const loaded = await repository.findByIdForUpdate(story.id)
      if (!loaded) throw new Error('expected story')
      await repository.delete(loaded)
      return [null]
    })

    const commentRow = await persistenceHarness.dataAccessProvider
      .table('comments')
      .where('id', comment.id.value)
      .first()
    const tagLinkRow = await persistenceHarness.dataAccessProvider
      .table('post_tag_links')
      .where({ postId: story.id.value, tagId: tag.id.value })
      .first()
    const imageLinkRow = await persistenceHarness.dataAccessProvider
      .table('post_image_links')
      .where({ postId: story.id.value, role: ImageRoleEnum.Cover })
      .first()

    expect(commentRow).toBeUndefined()
    expect(tagLinkRow).toBeUndefined()
    expect(imageLinkRow).toBeUndefined()
  })
})
